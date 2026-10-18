"use client";

import { useEffect, useState } from "react";
import { CountyPicker, type PickCounty } from "./CountyPicker";

type Priced = {
  lines: Array<{ fips: string; name: string; low: number; high: number }>;
  discounts: Array<{ label: string; low: number; high: number }>;
  total_low: number;
  total_high: number;
};

const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const range = (lo: number, hi: number) => (lo === hi ? usd(hi) : `${usd(lo)} to ${usd(hi)}`);

/**
 * Buy an individual license. Step one: choose counties and see the live price, from the catalog. Step two: no
 * checkout is connected to this site, so it is a request: name and email go to hello@redplanetdata.com, and the
 * person is told the agreement and an invoice follow and access is turned on when payment clears.
 */
export function IndividualBuy({ counties }: { counties: PickCounty[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [priced, setPriced] = useState<Priced | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!picked.length) {
      setPriced(null);
      return;
    }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/licensing/price?fips=${encodeURIComponent([...picked].sort().join(","))}`, { signal: ctl.signal });
        const j = await r.json();
        if (!r.ok) {
          setPriceError(j.error ?? "Prices are not available right now.");
          return;
        }
        setPriceError(null);
        setPriced(j as Priced);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setPriceError("Prices are not available right now.");
      }
    }, 200);
    return () => {
      ctl.abort();
      clearTimeout(t);
    };
  }, [picked]);

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
        body: JSON.stringify({ kind: "individual", name, email, phone, counties: picked, website }),
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
      <div className="rph-form__done" data-licensing="individual-done" role="status">
        <p className="rph-form__done-kicker">Request received</p>
        <p className="rph-form__done-title">Thank you. Your individual license request is with Red Planet Data.</p>
        <p className="rpl-text">
          The license agreement and an invoice will be sent to {email}. Access to Signal is turned on when payment clears.
        </p>
      </div>
    );
  }

  return (
    <form className="rpl-form" onSubmit={submit} data-licensing="individual-form" noValidate>
      <div className="rph-field">
        <span className="rph-field__label">Counties</span>
        <CountyPicker id="individual-county-search" counties={counties} value={picked} onChange={setPicked} />
      </div>

      <div className="rpl-live" aria-live="polite" data-licensing="individual-price">
        {!picked.length && <p className="rpl-muted">Choose counties to see the price.</p>}
        {priceError && <p className="rph-form__error">{priceError}</p>}
        {picked.length > 0 && priced && !priceError && (
          <>
            <ul className="rpl-live__lines">
              {priced.lines.map((l) => (
                <li key={l.fips}>
                  <span>{l.name}</span>
                  <span className="rpl-figure">{range(l.low, l.high)}</span>
                </li>
              ))}
              {priced.discounts.map((d) => (
                <li key={d.label} className="rpl-live__discount">
                  <span>{d.label}</span>
                  <span className="rpl-figure">&minus;{range(d.low, d.high)}</span>
                </li>
              ))}
            </ul>
            <p className="rpl-live__total">
              <span>Individual license, one year</span>
              <span className="rpl-figure" data-licensing="individual-total">{range(priced.total_low, priced.total_high)}</span>
            </p>
          </>
        )}
      </div>

      <div className="rph-form__grid">
        <label className="rph-field">
          <span className="rph-field__label">Your name, as it will appear on the license</span>
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={160} autoComplete="name" />
        </label>
        <label className="rph-field">
          <span className="rph-field__label">Email</span>
          <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} autoComplete="email" />
        </label>
        <label className="rph-field">
          <span className="rph-field__label">Phone <span className="rph-field__optional">optional</span></span>
          <input name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} autoComplete="tel" />
        </label>
      </div>
      <label className="rph-form__honeypot" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      {error && <p className="rph-form__error" role="alert">{error}</p>}
      <div className="rph-form__actions">
        <button type="submit" className="rpl-submit rpl-submit--accent" disabled={busy} data-licensing="individual-submit">
          {busy ? "Sending" : "Request this license"}
        </button>
        <span className="rph-form__note">An invoice follows. Access is turned on when payment clears.</span>
      </div>
    </form>
  );
}
