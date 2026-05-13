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

const ROLE_BY_SLUG: Record<string, string> = {
  "head-of-operations-and-strategy": "Head of Operations & Strategy",
  "head-of-platform": "Head of Platform",
};

const ROLE_QUESTION_LABELS: Record<string, { q1: string; q2: string; q3: string }> = {
  "head-of-operations-and-strategy": {
    q1: "Describe a capital raise you led to close — round size, your role, outcome.",
    q2: "Your experience with proptech, fintech, or data infrastructure companies specifically.",
    q3: "Why this role over a salaried executive position elsewhere?",
  },
  "head-of-platform": {
    q1: "Describe a production data system you've owned — scale, hardest reliability problems, how you solved them.",
    q2: "Your experience with AI-assisted development in production. If none, how do you think about it?",
    q3: "Why this role at this stage of the company?",
  },
};

type Body = {
  name?: string;
  email?: string;
  role?: string;
  role_slug?: string;
  linkedin_url?: string;
  resume_path?: string;
  resume_filename?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  anything_else?: string;
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
  const roleSlug = (body.role_slug ?? "").trim();
  const linkedin = (body.linkedin_url ?? "").trim();
  const resumePath = (body.resume_path ?? "").trim();
  const resumeFilename = (body.resume_filename ?? "").trim();
  const q1 = (body.q1 ?? "").trim();
  const q2 = (body.q2 ?? "").trim();
  const q3 = (body.q3 ?? "").trim();
  const anything = (body.anything_else ?? "").trim();

  const roleTitle = ROLE_BY_SLUG[roleSlug];
  if (!roleTitle) {
    return NextResponse.json(
      { error: "Please apply to one of the listed roles." },
      { status: 400 }
    );
  }
  if (!name || !email || !linkedin || !resumePath || !q1 || !q2 || !q3) {
    return NextResponse.json(
      { error: "Please fill out every required field." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 }
    );
  }
  if (!URL_RE.test(linkedin)) {
    return NextResponse.json(
      { error: "LinkedIn URL should start with https://." },
      { status: 400 }
    );
  }
  // Defense-in-depth: the resume path must live under the role-slug folder
  // we create on /api/careers/upload-url.
  if (!resumePath.startsWith(`${roleSlug}/`)) {
    return NextResponse.json(
      { error: "Resume path looks wrong. Please re-upload." },
      { status: 400 }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase env vars missing on /api/careers.");
    return NextResponse.json(
      { error: "Server is misconfigured. Try again shortly." },
      { status: 500 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Confirm the resume actually exists before persisting the row. Stops
  // applications that POST without completing the upload.
  const folder = resumePath.split("/").slice(0, -1).join("/");
  const objectName = resumePath.split("/").pop() ?? "";
  const { data: listData, error: listErr } = await supabase.storage
    .from("resumes")
    .list(folder, { limit: 100, search: objectName });
  if (listErr || !listData?.some((o) => o.name === objectName)) {
    return NextResponse.json(
      { error: "Could not find your uploaded resume. Please re-upload." },
      { status: 400 }
    );
  }

  const { data: row, error: insertError } = await supabase
    .from("careers_applications")
    .insert({
      name,
      email,
      role: roleTitle,
      linkedin_url: linkedin,
      resume_url: resumePath,
      q1,
      q2,
      q3,
      anything_else: anything || null,
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

  // Long-lived signed URL for the founder to download the resume from the
  // notification email. 14 days is enough to review and follow up.
  let resumeDownloadUrl = "";
  try {
    const { data: signed } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resumePath, 60 * 60 * 24 * 14);
    if (signed?.signedUrl) resumeDownloadUrl = signed.signedUrl;
  } catch (err) {
    console.error("createSignedUrl error:", err);
  }

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const subject = `New Red Planet careers application: ${name} — ${roleTitle}`;
      const filenameLabel = resumeFilename || resumePath;
      const labels = ROLE_QUESTION_LABELS[roleSlug];
      const lines = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Role: ${roleTitle}`,
        `LinkedIn: ${linkedin}`,
        `Resume: ${filenameLabel}`,
        `Resume download: ${resumeDownloadUrl || "(unavailable — fetch via Supabase dashboard)"}`,
        ``,
        `Q1 — ${labels?.q1 ?? "Question 1"}`,
        q1,
        ``,
        `Q2 — ${labels?.q2 ?? "Question 2"}`,
        q2,
        ``,
        `Q3 — ${labels?.q3 ?? "Question 3"}`,
        q3,
        ``,
        `Anything else:`,
        anything || "(none)",
        ``,
        `Application id: ${row?.id}`,
        `Submitted: ${row?.created_at}`,
      ];
      const html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;color:#1a1612;max-width:640px;">
          <h2 style="font-weight:700;font-size:18px;margin:0 0 16px;">New careers application</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:24px;">
            <tr><td style="padding:6px 0;color:#6b6760;width:140px;">Name</td><td style="padding:6px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;">Role</td><td style="padding:6px 0;">${escapeHtml(roleTitle)}</td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;">LinkedIn</td><td style="padding:6px 0;"><a href="${escapeHtml(linkedin)}">${escapeHtml(linkedin)}</a></td></tr>
            <tr><td style="padding:6px 0;color:#6b6760;">Resume</td><td style="padding:6px 0;">${
              resumeDownloadUrl
                ? `<a href="${escapeHtml(resumeDownloadUrl)}">${escapeHtml(filenameLabel)}</a> <span style="color:#8a8478;font-size:12px;">(14-day signed link)</span>`
                : escapeHtml(filenameLabel)
            }</td></tr>
          </table>
          <h3 style="font-size:14px;font-weight:600;margin:0 0 6px;color:#1a1612;">${escapeHtml(labels?.q1 ?? "Question 1")}</h3>
          <p style="margin:0 0 18px;white-space:pre-wrap;line-height:1.55;font-size:14px;">${escapeHtml(q1)}</p>
          <h3 style="font-size:14px;font-weight:600;margin:0 0 6px;color:#1a1612;">${escapeHtml(labels?.q2 ?? "Question 2")}</h3>
          <p style="margin:0 0 18px;white-space:pre-wrap;line-height:1.55;font-size:14px;">${escapeHtml(q2)}</p>
          <h3 style="font-size:14px;font-weight:600;margin:0 0 6px;color:#1a1612;">${escapeHtml(labels?.q3 ?? "Question 3")}</h3>
          <p style="margin:0 0 18px;white-space:pre-wrap;line-height:1.55;font-size:14px;">${escapeHtml(q3)}</p>
          <h3 style="font-size:14px;font-weight:600;margin:0 0 6px;color:#1a1612;">Anything else</h3>
          <p style="margin:0 0 24px;white-space:pre-wrap;line-height:1.55;font-size:14px;">${escapeHtml(anything || "(none)")}</p>
          <p style="color:#8a8478;font-size:12px;margin:0;">Application id: ${escapeHtml(String(row?.id ?? ""))}</p>
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
