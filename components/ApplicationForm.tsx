"use client";

import { FormEvent, useState } from "react";

const labelClass =
  "block mb-2 font-mono text-eyebrow uppercase text-fg-muted";
const inputClass =
  "w-full bg-bg-base border border-rule px-4 py-3 text-body text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-none transition-colors duration-200";

const roleOptions = [
  "Founder / CEO",
  "Product / Engineering",
  "Data / Analytics",
  "Investment / Finance",
  "Operations / Strategy",
  "Other",
];

function RequiredMark() {
  return <span className="text-accent"> *</span>;
}

function SuccessPanel() {
  return (
    <div className="flex h-full min-h-[420px] animate-fade-in flex-col items-center justify-center text-center">
      <p className="text-h3 text-fg-primary">Application received.</p>
      <p className="mt-3 max-w-[420px] text-body text-fg-secondary">
        We&apos;ll review and respond within 24 hours. Check your email.
      </p>
    </div>
  );
}

export function ApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("apply_failed");
      }
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[4px] border border-rule bg-bg-elevated p-6 md:p-10">
        <SuccessPanel />
      </div>
    );
  }

  return (
    <div className="rounded-[4px] border border-rule bg-bg-elevated p-6 md:p-10">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="apply-name" className={labelClass}>
              Name<RequiredMark />
            </label>
            <input
              id="apply-name"
              name="name"
              type="text"
              required
              placeholder="Your full name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="apply-email" className={labelClass}>
              Email<RequiredMark />
            </label>
            <input
              id="apply-email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="apply-company" className={labelClass}>
              Company<RequiredMark />
            </label>
            <input
              id="apply-company"
              name="company"
              type="text"
              required
              placeholder="Your company"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="apply-role" className={labelClass}>
              Your role
            </label>
            <select
              id="apply-role"
              name="role"
              defaultValue=""
              className={`${inputClass} appearance-none`}
            >
              <option value="" disabled>
                Select role...
              </option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="apply-question" className={labelClass}>
            What are you trying to answer?<RequiredMark />
          </label>
          <textarea
            id="apply-question"
            name="question"
            required
            rows={4}
            placeholder="Describe what you're building or what data you need..."
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="mt-6">
          <label htmlFor="apply-referral" className={labelClass}>
            How did you hear about us?
          </label>
          <input
            id="apply-referral"
            name="referral"
            type="text"
            placeholder="LinkedIn, referral, search..."
            className={inputClass}
          />
        </div>

        {error && (
          <p className="mt-6 font-mono text-body-sm text-accent">
            Something went wrong. Please try again or email
            hello@redplanetdata.com.
          </p>
        )}

        <div className="mt-8 flex flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center bg-accent px-8 py-4 font-mono text-eyebrow uppercase text-fg-primary transition-colors duration-200 hover:bg-accent-dim disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit application →"}
          </button>
        </div>

        <p className="mt-4 text-body-sm text-fg-muted">
          We review every application personally. No contracts. No commitments.
        </p>
      </form>
    </div>
  );
}
