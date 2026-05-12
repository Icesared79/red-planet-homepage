"use client";

import { useState, type ReactNode } from "react";

export type Role = {
  slug: string;
  title: string;
  equity: string;
  summary: string;
  details: ReactNode;
};

export function RoleCards({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (slug: string) =>
    setOpen((s) => ({ ...s, [slug]: !s[slug] }));

  const apply = (slug: string) => {
    const el = document.getElementById("apply");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Hint the form which role; ApplyForm listens for this event.
    window.dispatchEvent(
      new CustomEvent("rp:careers:role", { detail: { slug } })
    );
  };

  return (
    <div className="role-cards">
      {roles.map((r) => {
        const isOpen = !!open[r.slug];
        return (
          <article key={r.slug} className="role-card">
            <div className="role-card-header">
              <h3 className="role-card-title">{r.title}</h3>
              <span className="role-card-equity">{r.equity} equity</span>
            </div>
            <p className="role-card-summary">{r.summary}</p>
            <div className="role-card-actions">
              <button
                type="button"
                className={`role-card-toggle ${isOpen ? "is-open" : ""}`}
                onClick={() => toggle(r.slug)}
                aria-expanded={isOpen}
                aria-controls={`role-${r.slug}-details`}
              >
                {isOpen ? "Hide full description" : "Read full description"}
                <span className="chev">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path
                      d="M1 1L6 6L11 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                className="role-card-apply"
                onClick={() => apply(r.slug)}
              >
                Apply
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M9 1L13 5L9 9M13 5H1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            {isOpen && (
              <div
                id={`role-${r.slug}-details`}
                className="role-card-details"
              >
                {r.details}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
