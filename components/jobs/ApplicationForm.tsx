"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  answerProblem,
  anyDisqualifying,
  DECLINE_NOTE,
  type Answer,
  type Question,
} from "@/lib/jobs-screening";

type Status = "idle" | "sending" | "done" | "declined";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_RE = /^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\/.+/i;

/** 10 MB, matching the ceiling the resumes bucket itself enforces. */
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const RESUME_EXT = /\.(pdf|doc|docx)$/i;

/** A submission faster than this is a bot, not a person. */
const MIN_FILL_MS = 3000;

type Errors = Record<string, string>;

export function ApplicationForm({
  slug,
  title,
  questions,
}: {
  slug: string;
  title: string;
  questions: Question[];
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [note, setNote] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");

  const startedAt = useRef<number>(Date.now());
  const fileInput = useRef<HTMLInputElement | null>(null);

  const setAnswer = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const onPickFile = (file: File | null) => {
    setErrors((e) => ({ ...e, resume: "" }));
    if (!file) {
      setResume(null);
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResume(null);
      if (fileInput.current) fileInput.current.value = "";
      setErrors((e) => ({ ...e, resume: "That file is over 10 MB." }));
      return;
    }
    if (!RESUME_TYPES.includes(file.type) && !RESUME_EXT.test(file.name)) {
      setResume(null);
      if (fileInput.current) fileInput.current.value = "";
      setErrors((e) => ({ ...e, resume: "PDF or Word only." }));
      return;
    }
    setResume(file);
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = "Required.";
    if (!email.trim()) next.email = "Required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Check this address.";
    if (!linkedin.trim()) next.linkedin = "Required.";
    else if (!LINKEDIN_RE.test(linkedin.trim()))
      next.linkedin = "A full linkedin.com profile URL, starting https://.";
    for (const q of questions) {
      const problem = answerProblem(q, answers[q.key] ?? "");
      if (problem) next[q.key] = problem;
    }
    return next;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      setSubmitError("");
      return;
    }

    // Honeypot, and a floor on how fast the form can be filled in. Both end in
    // the same place a real submission does, so a bot learns nothing.
    if (website.trim() || Date.now() - startedAt.current < MIN_FILL_MS) {
      setStatus("done");
      return;
    }

    // The screening gate, applied BEFORE anything is uploaded or saved, so a
    // disqualified applicant leaves no record and no file behind. The route
    // handler applies the same rule to the same answers, because a hand-rolled
    // POST would otherwise walk straight past this.
    if (anyDisqualifying(questions, answers)) {
      setErrors({});
      setSubmitError("");
      setStatus("declined");
      return;
    }

    setStatus("sending");
    setSubmitError("");
    setErrors({});

    const payload: {
      slug: string;
      fullName: string;
      email: string;
      linkedin: string;
      note: string | null;
      answers: Answer[];
      resumePath?: string;
      resumeFilename?: string;
      resumeBytes?: number;
    } = {
      slug,
      fullName: fullName.trim(),
      email: email.trim(),
      linkedin: linkedin.trim(),
      note: note.trim() || null,
      answers: questions.map((q) => ({
        key: q.key,
        prompt: q.prompt,
        type: q.type,
        answer: (answers[q.key] ?? "").trim(),
      })),
    };

    try {
      // The resume goes straight to the private bucket on a one-time signed
      // URL, never through the route handler: a serverless request body is
      // capped well below the 10 MB a resume is allowed to be.
      if (resume) {
        const ticketRes = await fetch("/api/jobs/resume-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            filename: resume.name,
            contentType: resume.type || "application/octet-stream",
            size: resume.size,
          }),
        });
        if (!ticketRes.ok) throw new Error("resume ticket");
        const ticket = (await ticketRes.json()) as {
          path: string;
          token: string;
          url: string;
          anonKey: string;
        };

        const { createClient } = await import("@supabase/supabase-js");
        const storage = createClient(ticket.url, ticket.anonKey, {
          auth: { persistSession: false },
        }).storage.from("resumes");
        const { error: upErr } = await storage.uploadToSignedUrl(
          ticket.path,
          ticket.token,
          resume,
          { contentType: resume.type || undefined }
        );
        if (upErr) throw upErr;

        payload.resumePath = ticket.path;
        payload.resumeFilename = resume.name;
        payload.resumeBytes = resume.size;
      }

      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 422) {
        setStatus("declined");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setSubmitError(
        "That did not send. Try again, or write to hello@redplanetdata.com."
      );
    }
  };

  if (status === "declined") {
    return (
      <div className="rph-form__done rph-jobs__declined" role="status">
        <div className="rph-form__done-kicker">Not a fit</div>
        <p className="rph-jobs__outcome">{DECLINE_NOTE}</p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="rph-form__done" role="status">
        <div className="rph-form__done-kicker">Application received</div>
        <div className="rph-form__done-title">Thank you for applying.</div>
        <p className="rph-jobs__outcome">
          Your application for {title} is in. A confirmation is on its way to{" "}
          {email.trim()}, and you will hear back directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rph-jobs__form">
      <div className="rph-form__grid">
        <label
          className={`rph-field${errors.fullName ? " rph-field--error" : ""}`}
        >
          <span className="rph-field__label">Full name</span>
          <input
            type="text"
            value={fullName}
            autoComplete="name"
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName ? (
            <span className="rph-field__error">{errors.fullName}</span>
          ) : null}
        </label>
        <label className={`rph-field${errors.email ? " rph-field--error" : ""}`}>
          <span className="rph-field__label">Email</span>
          <input
            type="email"
            value={email}
            autoComplete="email"
            inputMode="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email ? (
            <span className="rph-field__error">{errors.email}</span>
          ) : null}
        </label>
      </div>

      <label className={`rph-field${errors.linkedin ? " rph-field--error" : ""}`}>
        <span className="rph-field__label">LinkedIn profile URL</span>
        <input
          type="url"
          value={linkedin}
          inputMode="url"
          placeholder="https://www.linkedin.com/in/..."
          onChange={(e) => setLinkedin(e.target.value)}
        />
        {errors.linkedin ? (
          <span className="rph-field__error">{errors.linkedin}</span>
        ) : null}
      </label>

      <div className={`rph-field${errors.resume ? " rph-field--error" : ""}`}>
        <span className="rph-field__label">
          Resume <span className="rph-field__optional">optional</span>
        </span>
        <input
          ref={fileInput}
          type="file"
          className="rph-jobs__file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
        <span className="rph-form__note">PDF or Word, up to 10 MB.</span>
        {errors.resume ? (
          <span className="rph-field__error">{errors.resume}</span>
        ) : null}
      </div>

      {questions.length ? (
        <div className="rph-jobs__questions">
          <div className="rph-form__legend">A few screening questions</div>
          {questions.map((q) => (
            <div
              key={q.key}
              className={`rph-field rph-jobs__question${
                errors[q.key] ? " rph-field--error" : ""
              }`}
            >
              <span className="rph-field__label rph-jobs__prompt">
                {q.prompt}{" "}
                {q.required ? null : (
                  <span className="rph-field__optional">optional</span>
                )}
              </span>
              {q.type === "yes_no" ? (
                <div className="rph-chips" role="group" aria-label={q.prompt}>
                  {["yes", "no"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="rph-chip"
                      aria-pressed={(answers[q.key] ?? "") === v}
                      onClick={() => setAnswer(q.key, v)}
                    >
                      {v === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  min={0}
                  max={80}
                  step={1}
                  inputMode="numeric"
                  className="rph-jobs__number"
                  value={answers[q.key] ?? ""}
                  onChange={(e) => setAnswer(q.key, e.target.value)}
                  aria-label={q.prompt}
                />
              )}
              {errors[q.key] ? (
                <span className="rph-field__error">{errors[q.key]}</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <label className="rph-field">
        <span className="rph-field__label">
          Anything else <span className="rph-field__optional">optional</span>
        </span>
        <textarea
          rows={3}
          value={note}
          placeholder="A short note, if you want to add one."
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <div aria-hidden="true" className="rph-form__honeypot">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {submitError ? <div className="rph-form__error">{submitError}</div> : null}

      <div className="rph-form__actions">
        <button
          type="submit"
          className="rph-form__submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Submit application"}
        </button>
        <span className="rph-form__note">Every application is read.</span>
      </div>
    </form>
  );
}
