import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { cleanFips, priceText, quoteFirm, quoteIndividual } from "@/lib/licensing";

// COUNTY-4.2: the two actions on /licensing.
//
//   kind "quote"       Get a quote: firm, contact, email, counties, seats.
//   kind "individual"  Buy an individual license: name, email, counties. No checkout is connected (COUNTY-2.1's
//                      accept-and-pay is not on this site), so this is a request: the person is told an invoice
//                      follows and access is turned on when payment clears.
//
// Each request is stored in contact_submissions (the site's existing record of what reaches us) and emailed to
// hello@redplanetdata.com ONLY, with the person's address as reply-to. Nothing is sent to the person who filled
// in the form. The counties are priced by the catalog at the moment of the request and the figures go in the
// email, so the reply starts from the price the person saw.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_TO = "hello@redplanetdata.com";
const NOTIFY_FROM = "Red Planet Data <notifications@redplanetdata.com>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  kind?: string;
  firm?: string;
  name?: string;
  email?: string;
  phone?: string;
  seats?: number | string;
  counties?: unknown;
  note?: string;
  website?: string; // honeypot
};

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  // A filled honeypot is a bot. Answer as if it worked and do nothing.
  if (clip(body.website, 200)) return NextResponse.json({ ok: true });

  const kind = body.kind === "individual" ? "individual" : body.kind === "quote" ? "quote" : null;
  const name = clip(body.name, 160);
  const email = clip(body.email, 200);
  const firm = clip(body.firm, 160);
  const phone = clip(body.phone, 40);
  const note = clip(body.note, 2000);
  const fips = cleanFips(body.counties);
  const seatsIn = Number(body.seats);
  const seats = Number.isFinite(seatsIn) && seatsIn > 0 ? Math.min(100000, Math.max(25, Math.ceil(seatsIn / 25) * 25)) : 25;

  if (!kind) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (!name || !email) return NextResponse.json({ error: "Your name and email are required." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
  if (kind === "quote" && !firm) return NextResponse.json({ error: "Name the firm the quote is for." }, { status: 400 });
  if (!fips.length) return NextResponse.json({ error: "Choose at least one county." }, { status: 400 });
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("[licensing request] Supabase env vars missing.");
    return NextResponse.json({ error: "This form is not available right now. Write to hello@redplanetdata.com." }, { status: 500 });
  }

  // Price the counties now, from the catalog.
  let countyLines: string[] = [];
  let totalLine = "";
  try {
    if (kind === "individual") {
      const q = await quoteIndividual(fips);
      const lines = (q?.lines ?? []).filter((l) => l.available && (l.state === "CT" || l.state === "FL"));
      countyLines = lines.map((l) => `${l.name}: ${priceText(Number(l.price_low), Number(l.price_high))} a year`);
      if (q && Number(q.state_discount_high) > 0) countyLines.push(`Whole-state discount: -${priceText(Number(q.state_discount_low), Number(q.state_discount_high))}`);
      if (q && Number(q.bundle_discount_high) > 0) countyLines.push(`Multi-county discount: -${priceText(Number(q.bundle_discount_low), Number(q.bundle_discount_high))}`);
      if (q) totalLine = `Individual license total: ${priceText(Number(q.total_low), Number(q.total_high))} a year`;
    } else {
      const q = await quoteFirm(fips, seats);
      const lines = (q?.lines ?? []).filter((l) => l.available && (l.state === "CT" || l.state === "FL"));
      countyLines = lines.map((l) =>
        `${l.name}: license ${priceText(Number(l.price_low), Number(l.price_high))}, seats ${priceText(Number(l.seat_low), Number(l.seat_high))}`);
      if (q && Number(q.state_discount_high) > 0) countyLines.push(`Whole-state discount: -${priceText(Number(q.state_discount_low), Number(q.state_discount_high))}`);
      if (q && Number(q.bundle_discount_high) > 0) countyLines.push(`Multi-county discount: -${priceText(Number(q.bundle_discount_low), Number(q.bundle_discount_high))}`);
      if (q) totalLine = `Firm license total at ${q.seats.toLocaleString("en-US")} seats: ${priceText(Number(q.total_low), Number(q.total_high))} a year`;
    }
  } catch (e) {
    console.error("[licensing request] pricing failed:", e);
  }
  if (!countyLines.length) return NextResponse.json({ error: "None of those counties is licensed on this page." }, { status: 400 });

  const source = kind === "quote" ? "Licensing: get a quote" : "Licensing: individual license";
  const detail = [
    kind === "quote" ? `Seats: ${seats}` : null,
    phone ? `Phone: ${phone}` : null,
    "Counties:",
    ...countyLines,
    totalLine || null,
    note ? `\nNote: ${note}` : null,
  ].filter(Boolean).join("\n");

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: row, error: insertError } = await sb
    .from("contact_submissions")
    .insert({ name, email, company: kind === "quote" ? firm : "(individual license)", building: detail, source })
    .select("id, created_at")
    .single();
  if (insertError) {
    console.error("[licensing request] insert failed:", insertError);
    return NextResponse.json({ error: "We could not save that. Please try again." }, { status: 500 });
  }

  if (!RESEND_API_KEY) {
    console.error("[licensing request] RESEND_API_KEY not set; request saved but not emailed.");
  } else {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const subject = kind === "quote" ? `Licensing quote request: ${firm}` : `Individual license request: ${name}`;
      const head: Array<[string, string]> = [
        ["Request", kind === "quote" ? "Get a quote (firm license)" : "Buy an individual license (invoice to follow)"],
        ...(kind === "quote" ? ([["Firm", firm]] as Array<[string, string]>) : []),
        ["Name", name],
        ["Email", email],
        ...(phone ? ([["Phone", phone]] as Array<[string, string]>) : []),
        ...(kind === "quote" ? ([["Seats", seats.toLocaleString("en-US")]] as Array<[string, string]>) : []),
      ];
      const text = [
        ...head.map(([k, v]) => `${k}: ${v}`),
        "",
        "Counties, priced by the catalog when the request was made:",
        ...countyLines,
        totalLine,
        note ? `\nNote: ${note}` : "",
        "",
        `Submission ${row?.id}, ${row?.created_at}. Sent from redplanetdata.com/licensing.`,
      ].join("\n");
      const html = `
        <div style="font-family:'Geist','Helvetica Neue',Helvetica,Arial,sans-serif;color:#141A16;max-width:600px;">
          <p style="font-family:'Fragment Mono',Menlo,monospace;font-size:12px;color:#C8382A;margin:0 0 12px;">Licensing</p>
          <h2 style="font-weight:500;font-size:20px;margin:0 0 16px;">${esc(subject)}</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            ${head.map(([k, v]) => `<tr><td style="padding:6px 0;color:#56605A;width:120px;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;">${k === "Email" ? `<a href="mailto:${esc(v)}">${esc(v)}</a>` : esc(v)}</td></tr>`).join("")}
          </table>
          <p style="font-size:13px;color:#56605A;margin:18px 0 6px;">Counties, priced by the catalog when the request was made:</p>
          <ul style="font-size:14px;margin:0 0 8px;padding-left:18px;">${countyLines.map((l) => `<li style="margin:3px 0;">${esc(l)}</li>`).join("")}</ul>
          ${totalLine ? `<p style="font-size:14px;margin:8px 0;"><strong style="font-weight:500;">${esc(totalLine)}</strong></p>` : ""}
          ${note ? `<p style="font-size:14px;white-space:pre-wrap;margin:12px 0;">${esc(note)}</p>` : ""}
          <p style="font-size:12px;color:#7E8A80;margin:18px 0 0;">Submission ${esc(String(row?.id ?? ""))}. Sent from redplanetdata.com/licensing.</p>
        </div>`;
      const { error: mailError } = await resend.emails.send({ from: NOTIFY_FROM, to: NOTIFY_TO, replyTo: email, subject, text, html });
      if (mailError) console.error("[licensing request] Resend error:", mailError);
    } catch (e) {
      console.error("[licensing request] Resend exception:", e);
    }
  }

  return NextResponse.json({ ok: true, id: row?.id, total: totalLine || null });
}
