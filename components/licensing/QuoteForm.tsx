"use client";

import { useState } from "react";
import { CountyPicker, type PickCounty } from "./CountyPicker";

/** Get a quote: firm, contact, email, counties, seats. Emails hello@redplanetdata.com and shows a confirmation. */
export function QuoteForm({ counties, seatsIncluded, seatBlock }: { counties: PickCounty[]; seatsIncluded: number; seatBlock: number }) {
  const [firm, setFirm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [seats, setSeats] = useState(String(seatsIncluded));
  const [picked, setPicked] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!picked.length) {
      setError("Choose at least one county.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/licensing/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "quote", firm, name, email, seats: Number(seats), counties: picked, website }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) setError(j.error ?? "That did not go through. Please try again.");
      else setDone(true);
    } catch {
      setError("That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rph-form__done" data-licensing="quote-done" role="status">
        <p className="rph-form__done-kicker">Request received</p>
        <p className="rph-form__done-title">Thank you. Your quote request is with Red Planet Data.</p>
        <p className="rpl-text">
          A written quote for {firm} will be sent to {email}, with each county as its own line and the seats you asked for.
        </p>
      </div>
    );
  }

  return (
    <form className="rpl-form" onSubmit={submit} data-licensing="quote-form" noValidate>
      <div className="rph-form__grid">
        <label className="rph-field">
          <span className="rph-field__label">Firm</span>
          <input name="firm" value={firm} onChange={(e) => setFirm(e.target.value)} required maxLength={160} autoComplete="organization" />
        </label>
        <label className="rph-field">
          <span className="rph-field__label">Contact</span>
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} autoComplete="name" />
        </label>
        <label className="rph-field">
          <span className="rph-field__label">Email</span>
          <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} autoComplete="email" />
        </label>
        <label className="rph-field">
          <span className="rph-field__label">Seats</span>
          <input
            name="seats"
            type="number"
            min={seatsIncluded}
            step={seatBlock}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            inputMode="numeric"
          />
        </label>
      </div>
      <div className="rph-field">
        <span className="rph-field__label">Counties</span>
        <CountyPicker id="quote-county-search" counties={counties} value={picked} onChange={setPicked} />
      </div>
      <label className="rph-form__honeypot" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      {error && <p className="rph-form__error" role="alert">{error}</p>}
      <div className="rph-form__actions">
        <button type="submit" className="rpl-submit" disabled={busy} data-licensing="quote-submit">
          {busy ? "Sending" : "Request a quote"}
        </button>
        <span className="rph-form__note">Seats are counted in blocks of {seatBlock}, from {seatsIncluded}.</span>
      </div>
    </form>
  );
}
