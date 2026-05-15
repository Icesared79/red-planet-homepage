"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

type Form = {
  name: string;
  email: string;
  company: string;
  building: string;
  source: string;
};

const EMPTY: Form = {
  name: "",
  email: "",
  company: "",
  building: "",
  source: "",
};

export function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onOpen = () => {
      setStatus("idle");
      setErrorMsg("");
      setForm(EMPTY);
      setOpen(true);
    };
    window.addEventListener("rp:contact:open", onOpen);
    return () => window.removeEventListener("rp:contact:open", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(t);
    };
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
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

  const close = () => setOpen(false);

  return (
    <div
      className="contact-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="contact-dialog" ref={dialogRef}>
        <button
          type="button"
          className="contact-close"
          aria-label="Close"
          onClick={close}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="contact-success">
            <div className="contact-eyebrow">— Message received</div>
            <h2 id="contact-title" className="contact-success-title">
              Thanks. We&apos;ll be in touch soon.
            </h2>
            <p className="contact-success-body">
              We read every message personally. Expect a reply within a day or
              two.
            </p>
            <button type="button" className="contact-btn-ghost" onClick={close}>
              Dismiss
            </button>
          </div>
        ) : (
          <>
            <div className="contact-eyebrow">§ 06 — Get in touch</div>
            <h2 id="contact-title" className="contact-title">
              Tell us what you&apos;re building.
            </h2>
            <p className="contact-lede">
              We work directly with people building on Atlas. Send us a note —
              we read every one.
            </p>

            <form className="contact-form" onSubmit={submit} noValidate>
              <div className="contact-field">
                <label htmlFor="cf-name">Name</label>
                <input
                  ref={firstFieldRef}
                  id="cf-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="contact-field">
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
              <div className="contact-field">
                <label htmlFor="cf-company">Company</label>
                <input
                  id="cf-company"
                  type="text"
                  required
                  autoComplete="organization"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                />
              </div>
              <div className="contact-field">
                <label htmlFor="cf-building">What are you building?</label>
                <textarea
                  id="cf-building"
                  required
                  rows={4}
                  value={form.building}
                  onChange={(e) => update("building", e.target.value)}
                />
              </div>
              <div className="contact-field">
                <label htmlFor="cf-source">
                  How did you hear about us? <span className="contact-optional">(optional)</span>
                </label>
                <input
                  id="cf-source"
                  type="text"
                  value={form.source}
                  onChange={(e) => update("source", e.target.value)}
                />
              </div>

              {status === "error" && (
                <div className="contact-error" role="alert">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="contact-submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending…" : "Send message"}
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
          </>
        )}
      </div>
    </div>
  );
}
