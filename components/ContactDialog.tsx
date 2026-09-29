"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

type Status = "idle" | "sending" | "done";

const TOPICS = [
  { key: "data", label: "Data access", sub: "I want to query Atlas" },
  { key: "product", label: "A product", sub: "TeleAcre or Signal" },
  { key: "partnership", label: "Partnership", sub: "Working together" },
  { key: "other", label: "Something else", sub: "Anything not listed" },
];

const PRODUCTS = ["TeleAcre", "Signal", "Not sure yet"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A submission faster than this is a bot, not a person. */
const MIN_FILL_MS = 2500;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

type Errors = {
  choice?: string;
  name?: string;
  email?: string;
  message?: string;
};

export function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [product, setProduct] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [markets, setMarkets] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const startedAt = useRef<number>(0);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    const t = lastTrigger.current;
    if (t && typeof t.focus === "function") t.focus();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      lastTrigger.current = (document.activeElement as HTMLElement) ?? null;
      setChoice("");
      setProduct("");
      setName("");
      setEmail("");
      setCompany("");
      setMarkets("");
      setMessage("");
      setWebsite("");
      setErrors({});
      setStatus("idle");
      setSubmitError("");
      startedAt.current = Date.now();
      setOpen(true);
    };
    window.addEventListener("rp:contact:open", onOpen);
    return () => window.removeEventListener("rp:contact:open", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      const first = el.querySelector<HTMLElement>(
        "button, [href], input, textarea"
      );
      if (first) first.focus();
    }, 30);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const pick = (key: string) => {
    setChoice(key);
    if (key !== "product") setProduct("");
    if (key !== "data") setMarkets("");
    setErrors((e) => ({ ...e, choice: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!choice) next.choice = "Pick one to continue.";
    if (!name.trim()) next.name = "Required.";
    if (!email.trim()) next.email = "Required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Check this address.";
    if (!message.trim()) next.message = "Required.";
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

    // Honeypot, plus a floor on how fast the form can be filled in.
    if (website.trim() || Date.now() - startedAt.current < MIN_FILL_MS) {
      setStatus("done");
      return;
    }

    setStatus("sending");
    setSubmitError("");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: choice,
          product: product || null,
          markets: markets.trim() || null,
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || null,
          message: message.trim(),
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("done");
    } catch {
      setStatus("idle");
      setSubmitError(
        "That didn't send. Try again, or write to hello@redplanetdata.com."
      );
    }
  };

  const onOverlayClick = (e: ReactMouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    const list = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="rph-overlay" onClick={onOverlayClick} onKeyDown={onKeyDown}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Start the conversation"
        className="rph-dialog"
      >
        <div className="rph-dialog__head">
          <div className="rph-dialog__title">Start the conversation.</div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rph-dialog__close"
          >
            &#10005;
          </button>
        </div>

        {status === "done" ? (
          <div className="rph-form__done">
            <div className="rph-form__done-kicker">Received</div>
            <div className="rph-form__done-title">
              Thanks &mdash; we&rsquo;ll be in touch.
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="rph-form__legend">How can we help?</div>
            <div className="rph-form__options">
              {TOPICS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => pick(t.key)}
                  aria-pressed={choice === t.key}
                  className="rph-form__option"
                >
                  <span className="rph-form__option-label">{t.label}</span>
                  <span className="rph-form__option-sub">{t.sub}</span>
                </button>
              ))}
            </div>
            {errors.choice ? (
              <div
                className="rph-field__error"
                style={{ paddingTop: "10px", marginTop: 0 }}
              >
                {errors.choice}
              </div>
            ) : null}

            {choice ? (
              <div style={{ paddingTop: "22px" }}>
                <div className="rph-form__grid">
                  <label
                    className={`rph-field${errors.name ? " rph-field--error" : ""}`}
                  >
                    <span className="rph-field__label">Name</span>
                    <input
                      type="text"
                      value={name}
                      autoComplete="name"
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name ? (
                      <span className="rph-field__error">{errors.name}</span>
                    ) : null}
                  </label>
                  <label
                    className={`rph-field${errors.email ? " rph-field--error" : ""}`}
                  >
                    <span className="rph-field__label">Email</span>
                    <input
                      type="email"
                      value={email}
                      autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email ? (
                      <span className="rph-field__error">{errors.email}</span>
                    ) : null}
                  </label>
                </div>

                <label className="rph-field">
                  <span className="rph-field__label">
                    Company{" "}
                    <span className="rph-field__optional">optional</span>
                  </span>
                  <input
                    type="text"
                    value={company}
                    autoComplete="organization"
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>

                {choice === "data" ? (
                  <label className="rph-field">
                    <span className="rph-field__label">
                      Markets or counties you care about{" "}
                      <span className="rph-field__optional">optional</span>
                    </span>
                    <input
                      type="text"
                      value={markets}
                      onChange={(e) => setMarkets(e.target.value)}
                    />
                  </label>
                ) : null}

                {choice === "product" ? (
                  <div style={{ marginTop: "16px" }}>
                    <span className="rph-field__label">Which one</span>
                    <div className="rph-chips">
                      {PRODUCTS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className="rph-chip"
                          aria-pressed={product === p}
                          onClick={() => setProduct(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <label
                  className={`rph-field${errors.message ? " rph-field--error" : ""}`}
                >
                  <span className="rph-field__label">Message</span>
                  <textarea
                    rows={3}
                    value={message}
                    placeholder="What are you looking for?"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  {errors.message ? (
                    <span className="rph-field__error">{errors.message}</span>
                  ) : null}
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

                {submitError ? (
                  <div className="rph-form__error">{submitError}</div>
                ) : null}

                <div className="rph-form__actions">
                  <button
                    type="submit"
                    className="rph-form__submit"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Sending…" : "Send"}
                  </button>
                  <span className="rph-form__note">We read every message.</span>
                </div>
              </div>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
