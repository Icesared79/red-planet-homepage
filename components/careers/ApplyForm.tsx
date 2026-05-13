"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Role } from "./roles";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

type Status = "idle" | "submitting" | "error";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = [".pdf", ".doc", ".docx"] as const;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type FormState = {
  name: string;
  email: string;
  linkedin_url: string;
  q1: string;
  q2: string;
  q3: string;
  anything_else: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  linkedin_url: "",
  q1: "",
  q2: "",
  q3: "",
  anything_else: "",
};

export function ApplyForm({ role }: { role: Role }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }
    const lower = f.name.toLowerCase();
    const extOk = ALLOWED_EXT.some((ext) => lower.endsWith(ext));
    const mimeOk = ALLOWED_MIME.has(f.type) || f.type === ""; // some browsers omit MIME for .doc
    if (!extOk || !mimeOk) {
      setErrorMsg("Resume must be a .pdf, .doc, or .docx file.");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setErrorMsg("Resume is larger than 10MB.");
      setFile(null);
      e.target.value = "";
      return;
    }
    setErrorMsg("");
    setFile(f);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!file) {
      setErrorMsg("Please attach a resume.");
      return;
    }
    setStatus("submitting");

    try {
      // 1. Ask the server for a signed upload URL.
      const uploadRes = await fetch("/api/careers/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: role.slug,
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          size: file.size,
        }),
      });
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        setErrorMsg(
          data?.error ?? "Couldn't prepare the upload. Please try again."
        );
        setStatus("error");
        return;
      }
      const { path, token } = await uploadRes.json();

      // 2. Upload directly to Supabase Storage via the signed upload token.
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error: uploadErr } = await supabase.storage
        .from("resumes")
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadErr) {
        setErrorMsg(
          "Resume upload failed. Please try again or use a different file."
        );
        setStatus("error");
        return;
      }

      // 3. Submit the application payload referencing the resume path.
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: role.title,
          role_slug: role.slug,
          resume_path: path,
          resume_filename: file.name,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data?.error ?? "Something went wrong. Please try again."
        );
        setStatus("error");
        return;
      }

      router.push("/careers/thanks");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <form className="careers-form" onSubmit={submit} noValidate>
      <div className="careers-field">
        <label htmlFor="cf-name">Name</label>
        <input
          id="cf-name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div className="careers-field">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div className="careers-field">
        <label htmlFor="cf-linkedin">LinkedIn URL</label>
        <input
          id="cf-linkedin"
          type="url"
          required
          placeholder="https://linkedin.com/in/…"
          value={form.linkedin_url}
          onChange={(e) => update("linkedin_url", e.target.value)}
        />
      </div>
      <div className="careers-field">
        <label htmlFor="cf-resume">Resume</label>
        <input
          id="cf-resume"
          type="file"
          required
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onFile}
        />
        <span className="careers-field-hint">
          .pdf, .doc, or .docx · max 10MB
        </span>
      </div>

      {role.questions.map((q) => (
        <div className="careers-field" key={q.id}>
          <label htmlFor={`cf-${q.id}`}>{q.prompt}</label>
          <textarea
            id={`cf-${q.id}`}
            required
            rows={5}
            value={form[q.id]}
            onChange={(e) => update(q.id, e.target.value)}
          />
        </div>
      ))}

      <div className="careers-field">
        <label htmlFor="cf-anything">
          Anything else <span className="optional">(optional)</span>
        </label>
        <textarea
          id="cf-anything"
          rows={4}
          value={form.anything_else}
          onChange={(e) => update("anything_else", e.target.value)}
        />
      </div>

      {errorMsg && (
        <div className="careers-error" role="alert">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        className="careers-submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting…" : "Submit application"}
        {status !== "submitting" && (
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path
              d="M9 1L13 5L9 9M13 5H1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </form>
  );
}
