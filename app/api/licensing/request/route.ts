import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { cleanFips, priceText, quoteFirm, quoteIndividual, usd, whiteLabel } from "@/lib/licensing";

// COUNTY-4.2: the request action on /licensing. COUNTY-9 (2026-10-20): one "Request this license" button under the
// store's total, for either license:
//
//   kind "individual"  one person: name, email, phone, counties.
//   kind "firm"        a firm: name, firm, email, phone, counties, people (seats) and, for a firm of the white-label
//                      minimum or more, whether it wants Signal under its own name and logo. ("quote", the kind
//                      COUNTY-4.2's quote form sent, is read as "firm".)
//
// No checkout is connected (COUNTY-2.1's accept-and-pay is atlas-dash's and has no Stripe keys), so this is a request:
// the person is told an agreement and an invoice follow and access is turned on when payment clears.
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
  branding?: boolean;
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

  const kind = body.kind === "individual" ? "individual" : body.kind === "firm" || body.kind === "quote" ? "firm" : null;
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
  if (!phone) return NextResponse.json({ error: "Add a phone number so we can reach you." }, { status: 400 });
  if (kind === "firm" && !firm) return NextResponse.json({ error: "Name the firm the license is for." }, { status: 400 });
  if (!fips.length) return NextResponse.json({ error: "Choose at least one county." }, { status: 400 });
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("[licensing request] Supabase env vars missing.");
    return NextResponse.json({ error: "This form is not available right now. Write to hello@redplanetdata.com." }, { status: 500 });
  }

  // Price the selection now, from the catalog.
  let countyLines: string[] = [];
  let totalLine = "";
  let brandingLine: string | null = null;
  try {
    if (kind === "individual") {
      const q = await quoteIndividual(fips);
      const lines = (q?.lines ?? []).filter((l) => l.available && (l.state === "CT" || l.state === "FL"));
      countyLines = lines.map((l) => `${l.name}: ${priceText(Number(l.price_low), Number(l.price_high))} a year`);
      if (q && Number(q.state_discount_high) > 0) countyLines.push(`Whole-state discount, ${q.state_discount_pct}% off: -${priceText(Number(q.state_discount_low), Number(q.state_discount_high))}`);
      if (q && Number(q.bundle_discount_high) > 0) countyLines.push(`Multi-county discount, ${q.bundle_discount_pct}% off: -${priceText(Number(q.bundle_discount_low), Number(q.bundle_discount_high))}`);
      if (q) totalLine = `Individual license, one person, total: ${priceText(Number(q.total_low), Number(q.total_high))} a year`;
    } else {
      const q = await quoteFirm(fips, seats);
      const lines = (q?.lines ?? []).filter((l) => l.available && (l.state === "CT" || l.state === "FL"));
      countyLines = lines.map((l) =>
        `${l.name}: license ${priceText(Number(l.price_low), Number(l.price_high))}, added seats ${priceText(Number(l.seat_low ?? 0), Number(l.seat_high ?? 0))}`);
      if (q && Number(q.state_discount_high) > 0) countyLines.push(`Whole-state discount, ${q.state_discount_pct}% off: -${priceText(Number(q.state_discount_low), Number(q.state_discount_high))}`);
      if (q && Number(q.bundle_discount_high) > 0) countyLines.push(`Multi-county discount, ${q.bundle_discount_pct}% off: -${priceText(Number(q.bundle_discount_low), Number(q.bundle_discount_high))}`);
      if (q) {
        let lo = Number(q.total_low);
        let hi = Number(q.total_high);
        if (body.branding === true) {
          const wl = await whiteLabel();
          if (wl.price !== null && (wl.minSeats === null || q.seats >= wl.minSeats)) {
            brandingLine = `Signal under the firm's own name and logo: ${usd(wl.price)} a year`;
            lo += wl.price;
            hi += wl.price;
          }
        }
        totalLine = `Firm license for ${q.seats.toLocaleString("en-US")} people${brandingLine ? ", with the firm's branding" : ""}, total: ${priceText(lo, hi)} a year`;
      }
    }
  } catch (e) {
    console.error("[licensing request] pricing failed:", e);
  }
  if (!countyLines.length) return NextResponse.json({ error: "None of those counties is licensed on this page." }, { status: 400 });

  const source = kind === "firm" ? "Licensing: firm license" : "Licensing: individual license";
  const detail = [
    kind === "firm" ? `People: ${seats}` : null,
    `Phone: ${phone}`,
    "Counties:",
    ...countyLines,
    brandingLine,
    totalLine || null,
    note ? `\nNote: ${note}` : null,
  ].filter(Boolean).join("\n");

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: row, error: insertError } = await sb
    .from("contact_submissions")
    .insert({ name, email, company: kind === "firm" ? firm : "(individual license)", building: detail, source })
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
      const subject = kind === "firm" ? `License request: ${firm}` : `Individual license request: ${name}`;
      const head: Array<[string, string]> = [
        ["Request", kind === "firm" ? "Firm license (agreement and invoice to follow)" : "Individual license (agreement and invoice to follow)"],
        ...(kind === "firm" ? ([["Firm", firm]] as Array<[string, string]>) : []),
        ["Name", name],
        ["Email", email],
        ["Phone", phone],
        ...(kind === "firm" ? ([["People", seats.toLocaleString("en-US")]] as Array<[string, string]>) : []),
        ...(kind === "firm" ? ([["Branding", brandingLine ? "Yes" : "No"]] as Array<[string, string]>) : []),
      ];
      const lines = [...countyLines, ...(brandingLine ? [brandingLine] : [])];
      const text = [
        ...head.map(([k, v]) => `${k}: ${v}`),
        "",
        "The selection, priced by the catalog when the request was made:",
        ...lines,
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
          <p style="font-size:13px;color:#56605A;margin:18px 0 6px;">The selection, priced by the catalog when the request was made:</p>
          <ul style="font-size:14px;margin:0 0 8px;padding-left:18px;">${lines.map((l) => `<li style="margin:3px 0;">${esc(l)}</li>`).join("")}</ul>
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
