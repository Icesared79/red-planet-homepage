import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// A one-time signed upload URL for one resume.
//
// WHY THE FILE DOES NOT COME THROUGH HERE. A resume is allowed to be 10 MB and
// a serverless request body is capped well below that, so the browser uploads
// straight to the private `resumes` bucket on a signed URL this route mints.
// The bucket is private (public = false) and enforces the same 10 MB ceiling
// and the same three MIME types independently, so a forged request cannot put
// anything else in it and no public URL for the object exists at all. The
// notification email carries a signed link that expires in 30 days.

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Not exported: a route module may only export the handlers and Next's own
// route config, and anything else fails the build with an index-signature error.
const RESUME_BUCKET = "resumes";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

/** Keeps the original name recognisable without letting it shape the path. */
function safeName(name: string): string {
  const cleaned = name
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-80);
  return cleaned || "resume.pdf";
}

type Body = {
  slug?: string;
  filename?: string;
  contentType?: string;
  size?: number;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim();
  const filename = (body.filename ?? "").trim();
  const contentType = (body.contentType ?? "").trim();
  const size = Number(body.size);

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "bad_slug" }, { status: 400 });
  }
  if (!filename || (!ALLOWED_TYPES.has(contentType) && !ALLOWED_EXT.test(filename))) {
    return NextResponse.json({ error: "bad_type" }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }
  if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
    console.error("jobs/resume-url: Supabase env vars missing.");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Only an OPEN posting gets an upload ticket, so a closed role cannot be used
  // as an upload endpoint.
  const { data: posting, error: postingError } = await supabase
    .from("job_postings")
    .select("id,status")
    .eq("slug", slug)
    .maybeSingle();
  if (postingError) {
    console.error("jobs/resume-url: posting read failed:", postingError);
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }
  if (!posting || posting.status !== "open") {
    return NextResponse.json({ error: "not_open" }, { status: 404 });
  }

  const path = `applications/${slug}/${crypto.randomUUID()}/${safeName(filename)}`;
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data?.token) {
    console.error("jobs/resume-url: createSignedUploadUrl failed:", error);
    return NextResponse.json({ error: "upload_url_failed" }, { status: 500 });
  }

  return NextResponse.json({
    path: data.path ?? path,
    token: data.token,
    url: SUPABASE_URL,
    anonKey: ANON_KEY,
  });
}
