import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  answerProblem,
  anyDisqualifying,
  parseQuestions,
  type Answer,
  type Question,
} from "@/lib/jobs-screening";

// One job application: screened, saved, acknowledged, and mailed on.
//
// The form in the browser applies the same screening rule before it ever gets
// here, which is what stops a disqualified applicant on the page. This route
// applies it again because a hand-rolled POST would otherwise walk straight
// past the client check -- and when it refuses, it saves NOTHING and deletes
// whatever resume was already uploaded, so a declined applicant leaves no
// record and no file behind.
//
// The resume itself never passes through this route; see
// app/api/jobs/resume-url/route.ts for why. What arrives is a path in the
// private `resumes` bucket, which is checked for existence before the row is
// written and turned into a 30-day signed link for the notification email.

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const NOTIFY_TO = "hello@redplanetdata.com";
const MAIL_FROM = "Red Planet Data <hello@redplanetdata.com>";
const RESUME_BUCKET = "resumes";

/** 30 days, the life of the resume link in the notification email. */
const LINK_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Submissions allowed per email address per posting. */
const MAX_PER_EMAIL = 3;

/**
 * Attach the resume to the notification email below this size and link to it
 * above. The link is always included either way, so an attachment that cannot
 * be built costs nothing.
 */
const ATTACH_UNDER_BYTES = 7 * 1024 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_RE = /^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\/.+/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

type Body = {
  slug?: string;
  fullName?: string;
  email?: string;
  linkedin?: string;
  note?: string | null;
  answers?: Answer[];
  resumePath?: string;
  resumeFilename?: string;
  resumeBytes?: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "yes" -> "Yes"; "7" stays "7"; "" -> "(not answered)". */
function showAnswer(a: { type: string; answer: string }): string {
  const v = (a.answer ?? "").trim();
  if (!v) return "(not answered)";
  if (a.type === "yes_no") return v === "yes" ? "Yes" : v === "no" ? "No" : v;
  return v;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim();
  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim();
  const linkedin = (body.linkedin ?? "").trim();
  const note = (body.note ?? "")?.trim() || null;
  const sent = Array.isArray(body.answers) ? body.answers : [];
  const resumePath = (body.resumePath ?? "").trim();
  const resumeFilename = (body.resumeFilename ?? "").trim();
  const resumeBytes = Number.isFinite(Number(body.resumeBytes))
    ? Number(body.resumeBytes)
    : null;

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "bad_slug" }, { status: 400 });
  }
  if (!fullName || !email || !linkedin) {
    return NextResponse.json(
      { error: "Name, email and a LinkedIn profile URL are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address does not look right." },
      { status: 400 }
    );
  }
  if (!LINKEDIN_RE.test(linkedin)) {
    return NextResponse.json(
      { error: "That LinkedIn URL does not look right." },
      { status: 400 }
    );
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("jobs/apply: Supabase env vars missing.");
    return NextResponse.json(
      { error: "Server is misconfigured. Try again shortly." },
      { status: 500 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  /** Drop an already-uploaded resume when the application is not going to be saved. */
  const discardResume = async () => {
    if (!resumePath) return;
    const { error } = await supabase.storage
      .from(RESUME_BUCKET)
      .remove([resumePath]);
    if (error) console.error("jobs/apply: resume cleanup failed:", error);
  };

  const { data: posting, error: postingError } = await supabase
    .from("job_postings")
    .select("id,slug,title,status,questions")
    .eq("slug", slug)
    .maybeSingle();

  if (postingError) {
    console.error("jobs/apply: posting read failed:", postingError);
    return NextResponse.json(
      { error: "We could not save that. Please try again." },
      { status: 500 }
    );
  }
  if (!posting || posting.status !== "open") {
    await discardResume();
    return NextResponse.json({ error: "not_open" }, { status: 404 });
  }

  // The questions are the POSTING's, not the ones the browser sent: the answers
  // are matched onto them by key so an edited payload cannot invent a question,
  // drop a required one or soften which answer disqualifies.
  const questions: Question[] = parseQuestions(posting.questions);
  const byKey = new Map(sent.map((a) => [a?.key, (a?.answer ?? "").trim()]));
  const answerMap: Record<string, string> = {};
  for (const q of questions) {
    const value = byKey.get(q.key) ?? "";
    const problem = answerProblem(q, value);
    if (problem) {
      await discardResume();
      return NextResponse.json(
        { error: "Please answer every required question." },
        { status: 400 }
      );
    }
    answerMap[q.key] = value;
  }

  // The screening gate. 422 is what the form reads as "show the decline note".
  if (anyDisqualifying(questions, answerMap)) {
    await discardResume();
    return NextResponse.json({ error: "not_a_fit" }, { status: 422 });
  }

  // Three submissions per email address per posting.
  const { count, error: countError } = await supabase
    .from("job_applications")
    .select("id", { count: "exact", head: true })
    .eq("posting_id", posting.id)
    .ilike("email", email);
  if (countError) {
    console.error("jobs/apply: submission count failed:", countError);
  } else if ((count ?? 0) >= MAX_PER_EMAIL) {
    await discardResume();
    return NextResponse.json(
      {
        error:
          "We already have your application for this role. Write to hello@redplanetdata.com if you need to add to it.",
      },
      { status: 429 }
    );
  }

  // The resume path has to be one this site minted, and the object has to be
  // there. createSignedUrl fails on a missing object, so this both checks and
  // produces the 30-day link the notification email carries.
  let resumeLink: string | null = null;
  if (resumePath) {
    if (!resumePath.startsWith(`applications/${slug}/`)) {
      return NextResponse.json({ error: "bad_resume_path" }, { status: 400 });
    }
    const { data: signed, error: signError } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(resumePath, LINK_TTL_SECONDS);
    if (signError || !signed?.signedUrl) {
      console.error("jobs/apply: resume not readable:", signError);
      return NextResponse.json({ error: "resume_missing" }, { status: 400 });
    }
    resumeLink = signed.signedUrl;
  }

  const answers = questions.map((q) => ({
    key: q.key,
    prompt: q.prompt,
    type: q.type,
    answer: answerMap[q.key] ?? "",
  }));

  const { data: row, error: insertError } = await supabase
    .from("job_applications")
    .insert({
      posting_id: posting.id,
      posting_slug: posting.slug,
      full_name: fullName,
      email,
      linkedin_url: linkedin,
      note,
      answers,
      resume_path: resumePath || null,
      resume_filename: resumeFilename || null,
      resume_bytes: resumeBytes,
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    console.error("jobs/apply: insert failed:", insertError);
    return NextResponse.json(
      { error: "We could not save that. Please try again." },
      { status: 500 }
    );
  }

  // Both emails are best-effort: the application is saved either way, and a
  // mail failure must not tell the applicant their application did not land.
  if (RESEND_API_KEY) {
    const resend = new Resend(RESEND_API_KEY);

    const answerLines = answers.map(
      (a) => `${a.prompt}\n  ${showAnswer(a)}`
    );
    const resumeLine = resumePath
      ? `${resumeFilename || "resume"}${
          resumeBytes ? ` (${Math.round(resumeBytes / 1024)} KB)` : ""
        }\n  ${resumeLink} (link expires in 30 days)`
      : "(none provided)";

    const text = [
      `${posting.title}`,
      ``,
      `Name: ${fullName}`,
      `Email: ${email}`,
      `LinkedIn: ${linkedin}`,
      ``,
      `Screening answers:`,
      ...answerLines,
      ``,
      `Note:`,
      note || "(none)",
      ``,
      `Resume: ${resumeLine}`,
      ``,
      `Application id: ${row?.id}`,
      `Submitted: ${row?.created_at}`,
    ].join("\n");

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;color:#1a1612;max-width:620px;">
        <h2 style="font-weight:700;font-size:18px;margin:0 0 4px;">New application</h2>
        <p style="margin:0 0 18px;color:#6b6760;font-size:14px;">${escapeHtml(posting.title)}</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b6760;width:170px;">Name</td><td style="padding:6px 0;">${escapeHtml(fullName)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6760;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6b6760;">LinkedIn</td><td style="padding:6px 0;"><a href="${escapeHtml(linkedin)}">${escapeHtml(linkedin)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6b6760;vertical-align:top;">Resume</td><td style="padding:6px 0;">${
            resumePath
              ? `<a href="${escapeHtml(resumeLink ?? "")}">${escapeHtml(resumeFilename || "resume")}</a>` +
                `<br><span style="color:#8a8478;font-size:12px;">Link expires in 30 days.</span>`
              : "(none provided)"
          }</td></tr>
        </table>
        <h3 style="font-weight:700;font-size:14px;margin:22px 0 8px;">Screening answers</h3>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          ${answers
            .map(
              (a) =>
                `<tr><td style="padding:6px 0;color:#6b6760;vertical-align:top;width:70%;">${escapeHtml(a.prompt)}</td>` +
                `<td style="padding:6px 0;font-weight:600;">${escapeHtml(showAnswer(a))}</td></tr>`
            )
            .join("")}
        </table>
        <h3 style="font-weight:700;font-size:14px;margin:22px 0 8px;">Note</h3>
        <p style="margin:0;font-size:14px;white-space:pre-wrap;">${escapeHtml(note || "(none)")}</p>
        <p style="margin:22px 0 0;color:#8a8478;font-size:12px;">Application ${escapeHtml(String(row?.id ?? ""))}</p>
      </div>`;

    const attachments: { filename: string; content: string }[] = [];
    if (resumeLink && resumeBytes != null && resumeBytes <= ATTACH_UNDER_BYTES) {
      try {
        const res = await fetch(resumeLink);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          attachments.push({
            filename: resumeFilename || "resume.pdf",
            content: buf.toString("base64"),
          });
        }
      } catch (err) {
        console.error("jobs/apply: resume attach failed, link stands:", err);
      }
    }

    try {
      const { error } = await resend.emails.send({
        from: MAIL_FROM,
        to: NOTIFY_TO,
        replyTo: email,
        subject: `New application: ${fullName} - ${posting.title}`,
        text,
        html,
        ...(attachments.length ? { attachments } : {}),
      });
      if (error) console.error("jobs/apply: notification send failed:", error);
    } catch (err) {
      console.error("jobs/apply: notification exception:", err);
    }

    try {
      const { error } = await resend.emails.send({
        from: MAIL_FROM,
        to: email,
        subject: `We received your application - ${posting.title}`,
        text: [
          `Hello ${fullName},`,
          ``,
          `Thank you for applying for ${posting.title} at Red Planet Data. Your application is in and it will be read.`,
          ``,
          `If it looks like a fit you will hear back directly from this address.`,
          ``,
          `Red Planet Data`,
          `hello@redplanetdata.com`,
        ].join("\n"),
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif;color:#1a1612;max-width:560px;font-size:15px;line-height:1.6;">
            <p style="margin:0 0 14px;">Hello ${escapeHtml(fullName)},</p>
            <p style="margin:0 0 14px;">Thank you for applying for <strong>${escapeHtml(posting.title)}</strong> at Red Planet Data. Your application is in and it will be read.</p>
            <p style="margin:0 0 14px;">If it looks like a fit you will hear back directly from this address.</p>
            <p style="margin:22px 0 0;color:#6b6760;font-size:13px;">Red Planet Data<br><a href="mailto:hello@redplanetdata.com">hello@redplanetdata.com</a></p>
          </div>`,
      });
      if (error) console.error("jobs/apply: confirmation send failed:", error);
    } catch (err) {
      console.error("jobs/apply: confirmation exception:", err);
    }
  } else {
    console.warn("jobs/apply: RESEND_API_KEY not set - no email sent.");
  }

  return NextResponse.json({ ok: true, id: row?.id });
}
