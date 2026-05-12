import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_TO = "paul.dicesare@gmail.com";
const NOTIFY_FROM = "Red Planet <notifications@redplanetdata.com>";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

const ALLOWED_ROLES = new Set<string>([
  "Head of Operations & Strategy",
  "Head of Platform",
]);

type Body = {
  name?: string;
  email?: string;
  role?: string;
  linkedin_url?: string;
  note?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const role = (body.role ?? "").trim();
  const linkedinRaw = (body.linkedin_url ?? "").trim();
  const note = (body.note ?? "").trim();

  if (!name || !email || !role) {
    return NextResponse.json(
      { error: "Name, email, and role are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 }
    );
  }
  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json(
      { error: "Please select one of the listed roles." },
      { status: 400 }
    );
  }
  if (linkedinRaw && !URL_RE.test(linkedinRaw)) {
    return NextResponse.json(
      { error: "LinkedIn URL should start with https://." },
      { status: 400 }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase env vars missing.");
    return NextResponse.json(
      { error: "Server is misconfigured. Try again shortly." },
      { status: 500 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: row, error: insertError } = await supabase
    .from("careers_applications")
    .insert({
      name,
      email,
      role,
      linkedin_url: linkedinRaw || null,
      note: note || null,
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    console.error("careers_applications insert error:", insertError);
    return NextResponse.json(
      { error: "We couldn't save that. Please try again." },
      { status: 500 }
    );
  }

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const subject = `New Red Planet careers application: ${name} — ${role}`;
      const lines = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Role: ${role}`,
        `LinkedIn: ${linkedinRaw || "(not provided)"}`,
        ``,
        `Note:`,
        note || "(none)",
        ``,
        `Application id: ${row?.id}`,
        `Submitted: ${row?.created_at}`,
      ];
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;color:#1a1612;max-width:560px;">
          <h2 style="font-weight:700;font-size:18px;margin:0 0 16px;">New careers application</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr><td style="padding:6px 0;color:#6b6760;width:160px;">Name</td><td style="padding:6px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;">Role</td><td style="padding:6px 0;">${escapeHtml(role)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;">LinkedIn</td><td style="padding:6px 0;">${linkedinRaw ? `<a href="${escapeHtml(linkedinRaw)}">${escapeHtml(linkedinRaw)}</a>` : "(not provided)"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;vertical-align:top;">Note</td><td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(note || "(none)")}</td></tr>
            <tr><td style="padding:12px 0 0;color:#8a8478;font-size:12px;">Submission</td><td style="padding:12px 0 0;color:#8a8478;font-size:12px;">${escapeHtml(String(row?.id ?? ""))}</td></tr>
          </table>
        </div>`;

      const { error: emailError } = await resend.emails.send({
        from: NOTIFY_FROM,
        to: NOTIFY_TO,
        replyTo: email,
        subject,
        text: lines.join("\n"),
        html,
      });
      if (emailError) {
        console.error("Resend send error:", emailError);
      }
    } catch (err) {
      console.error("Resend exception:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set — skipping notification email.");
  }

  return NextResponse.json({ ok: true, id: row?.id });
}
