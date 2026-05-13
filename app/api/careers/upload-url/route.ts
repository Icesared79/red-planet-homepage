import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_ROLE_SLUGS = new Set([
  "head-of-operations-and-strategy",
  "head-of-platform",
]);

type Body = {
  role?: string;
  filename?: string;
  content_type?: string;
  size?: number;
};

function safeExtension(filename: string): string {
  const m = filename.toLowerCase().match(/\.(pdf|doc|docx)$/);
  return m ? m[0] : ".bin";
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const role = (body.role ?? "").trim();
  const filename = (body.filename ?? "").trim();
  const contentType = (body.content_type ?? "").trim();
  const size = Number(body.size ?? 0);

  if (!ALLOWED_ROLE_SLUGS.has(role)) {
    return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  }
  if (!filename) {
    return NextResponse.json({ error: "Filename required." }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Resume must be larger than zero and at most 10MB." },
      { status: 400 }
    );
  }
  // Some browsers send an empty content_type for .doc; trust the extension if so.
  const ext = safeExtension(filename);
  if (ext === ".bin") {
    return NextResponse.json(
      { error: "Resume must be a .pdf, .doc, or .docx file." },
      { status: 400 }
    );
  }
  if (contentType && !ALLOWED_MIME.has(contentType)) {
    return NextResponse.json(
      { error: "Resume must be a .pdf, .doc, or .docx file." },
      { status: 400 }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase env vars missing on /api/careers/upload-url.");
    return NextResponse.json(
      { error: "Server is misconfigured. Try again shortly." },
      { status: 500 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Path layout: <role-slug>/<uuid><ext> — unguessable and easy to bucket.
  const path = `${role}/${randomUUID()}${ext}`;

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createSignedUploadUrl error:", error);
    return NextResponse.json(
      { error: "Could not prepare upload." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
  });
}
