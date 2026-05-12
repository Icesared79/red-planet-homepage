"use client";

import { useEffect, useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

type Form = {
  name: string;
  email: string;
  role: string;
  linkedin_url: string;
  note: string;
};

const EMPTY: Form = {
  name: "",
  email: "",
  role: "",
  linkedin_url: "",
  note: "",
};

const ROLE_OPTIONS: Array<{ slug: string; label: string }> = [
  { slug: "head-of-operations-strategy", label: "Head of Operations & Strategy" },
  { slug: "head-of-platform", label: "Head of Platform" },
];

export function ApplyForm() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const onRole = (e: Event) => {
      const detail = (e as CustomEvent<{ slug: string }>).detail;
      if (!detail?.slug) return;
      const match = ROLE_OPTIONS.find((r) => r.slug === detail.slug);
      if (match) setForm((f) => ({ ...f, role: match.label }));
    };
    window.addEventListener("rp:careers:role", onRole);
    return () => window.removeEventListener("rp:careers:role", onRole);
  }, []);

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="apply-success">
        <div className="apply-success-title">
          Thanks — your application is in.
        </div>
        <p className="apply-success-body">
          We&apos;ll review it personally and reply by email. If it&apos;s a
          fit, the next step is a call.
        </p>
      </div>
    );
  }

  return (
    <form className="apply-form" onSubmit={submit} noValidate>
      <div className="apply-field">
        <label htmlFor="af-name">Name</label>
        <input
          id="af-name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div className="apply-field">
        <label htmlFor="af-email">Email</label>
        <input
          id="af-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div className="apply-field">
        <label htmlFor="af-role">Role applying for</label>
        <select
          id="af-role"
          required
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
        >
          <option value="" disabled>
            Select a role
          </option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.slug} value={r.label}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="apply-field">
        <label htmlFor="af-linkedin">
          LinkedIn URL <span className="optional">(optional)</span>
        </label>
        <input
          id="af-linkedin"
          type="url"
          placeholder="https://linkedin.com/in/…"
          value={form.linkedin_url}
          onChange={(e) => update("linkedin_url", e.target.value)}
        />
      </div>
      <div className="apply-field">
        <label htmlFor="af-note">
          Brief note <span className="optional">(optional)</span>
        </label>
        <textarea
          id="af-note"
          rows={5}
          placeholder="Why this role, what you'd want to build, anything else we should know."
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
        />
      </div>

      {status === "error" && (
        <div className="apply-error" role="alert">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        className="apply-submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send application"}
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
