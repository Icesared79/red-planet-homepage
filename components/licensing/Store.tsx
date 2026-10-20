"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// COUNTY-9 (2026-10-20): the store on /licensing. Three options in the usual pricing-card form, then the picker: a
// state, counties chosen on the state's map or by typing a town or county name (a town finds the county it sits in),
// Individual or Firm and, for a firm, how many people in the catalog's steps. Each chosen county is one line with its
// annual price and, when current, its 90-day filing counts; the total is priced live by the catalog
// (/api/licensing/price) with any multi-county or whole-state discount as its own line. Under the total, one button:
// "Request this license", which collects the person's details and emails hello@redplanetdata.com
// (/api/licensing/request). No figure is computed here except adding the branding price to the catalog's total, as the
// shared license page does.

export type StoreCounty = {
  fips: string;
  state: string;
  name: string;
  individualLow: number;
  individualHigh: number;
  firmLow: number;
  firmHigh: number;
  foreclosure90: number | null;
  probate90: number | null;
};

export type StoreTerms = {
  seatsIncluded: number;
  seatStep: number;
  seatStepPct: number;
  bundleMinCounties: number;
  bundleDiscountPct: number;
  stateDiscountPct: number;
  brandingPrice: number | null;
  brandingMinPeople: number | null;
};

type Geo = {
  maps: Record<string, { w: number; h: number; outline: string; counties: Array<{ fips: string; d: string }> }>;
  towns: Array<[string, string]>;
};
type Priced = {
  lines: Array<{ fips: string; name: string; low: number; high: number; addedLow: number; addedHigh: number }>;
  discounts: Array<{ label: string; low: number; high: number }>;
  total_low: number;
  total_high: number;
  seats: number | null;
};
type Mode = "individual" | "firm";

const STATE_NAMES: Record<string, string> = { CT: "Connecticut", FL: "Florida" };
const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const range = (lo: number, hi: number) => (Math.round(lo) === Math.round(hi) ? usd(hi) : `${usd(lo)} to ${usd(hi)}`);
const int = (v: number) => Math.round(v).toLocaleString("en-US");

function filings(c: StoreCounty): string | null {
  const parts = [
    c.foreclosure90 !== null ? `${int(c.foreclosure90)} foreclosure` : null,
    c.probate90 !== null ? `${int(c.probate90)} probate` : null,
  ].filter(Boolean);
  if (!parts.length) return null;
  const n = (c.foreclosure90 ?? 0) + (c.probate90 ?? 0);
  return `${parts.join(" and ")} ${n === 1 ? "filing" : "filings"} in the last 90 days`;
}

export function Store({ counties, terms, from }: {
  counties: StoreCounty[];
  terms: StoreTerms;
  from: { individual: number | null; firm: number | null };
}) {
  const byFips = useMemo(() => new Map(counties.map((c) => [c.fips, c])), [counties]);
  const states = useMemo(() => Object.keys(STATE_NAMES).filter((s) => counties.some((c) => c.state === s)), [counties]);
  const [st, setSt] = useState(states[0] ?? "CT");
  const [picked, setPicked] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>("firm");
  const [people, setPeople] = useState(terms.seatsIncluded);
  const [branding, setBranding] = useState(false);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<string | null>(null);
  const [priced, setPriced] = useState<Priced | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [form, setForm] = useState({ name: "", firm: "", email: "", phone: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const brandingOk = mode === "firm" && terms.brandingPrice !== null && people >= (terms.brandingMinPeople ?? 0);
  const withBranding = branding && brandingOk;

  useEffect(() => {
    fetch("/licensing/map.json").then((r) => r.json()).then(setGeo).catch(() => setGeo(null));
  }, []);

  useEffect(() => {
    if (!picked.length) {
      setPriced(null);
      setPriceError(null);
      return;
    }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const qs = `fips=${encodeURIComponent([...picked].sort().join(","))}${mode === "firm" ? `&seats=${people}` : ""}`;
        const r = await fetch(`/api/licensing/price?${qs}`, { signal: ctl.signal });
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
    }, 150);
    return () => {
      ctl.abort();
      clearTimeout(t);
    };
  }, [picked, mode, people]);

  const toggle = (fips: string) => {
    setDone(null);
    setPicked((p) => (p.includes(fips) ? p.filter((f) => f !== fips) : [...p, fips]));
  };
  const add = (fips: string) => {
    setDone(null);
    setPicked((p) => (p.includes(fips) ? p : [...p, fips]));
  };
  const stateAll = counties.filter((c) => c.state === st).map((c) => c.fips);
  const everyInState = stateAll.length > 0 && stateAll.every((f) => picked.includes(f));
  const toggleState = () => {
    setDone(null);
    setPicked((p) => (everyInState ? p.filter((f) => !stateAll.includes(f)) : [...new Set([...p, ...stateAll])]));
  };

  const choose = (m: Mode, brand: boolean) => {
    setMode(m);
    setBranding(brand);
    if (brand && terms.brandingMinPeople) setPeople((n) => Math.max(n, terms.brandingMinPeople!));
    pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Search: counties by name, and towns, each pointing at the county it sits in.
  const needle = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (needle.length < 2) return [];
    const out: Array<{ key: string; label: string; detail: string; fips: string }> = [];
    for (const c of counties) {
      if (c.name.toLowerCase().includes(needle)) out.push({ key: `c${c.fips}`, label: c.name, detail: STATE_NAMES[c.state], fips: c.fips });
    }
    for (const [name, fips] of geo?.towns ?? []) {
      const c = byFips.get(fips);
      if (c && name.toLowerCase().startsWith(needle)) {
        out.push({ key: `t${name}${fips}`, label: name, detail: `${c.name}, ${STATE_NAMES[c.state]}`, fips });
      }
    }
    return out.slice(0, 8);
  }, [needle, counties, geo, byFips]);

  const pickResult = (r: { label: string; fips: string }) => {
    const c = byFips.get(r.fips);
    if (!c) return;
    add(r.fips);
    setSt(c.state);
    setQ("");
    setFound(r.label === c.name ? `${c.name} added.` : `${r.label} is in ${c.name}. ${c.name} added.`);
  };

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
        body: JSON.stringify({
          kind: mode, name: form.name, firm: form.firm, email: form.email, phone: form.phone,
          seats: mode === "firm" ? people : undefined, branding: withBranding, counties: picked, website: form.website,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) setError(j.error ?? "That did not go through. Please try again.");
      else {
        setDone(form.email);
        setAsking(false);
      }
    } catch {
      setError("That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const map = geo?.maps[st];
  const lines = priced?.lines.filter((l) => picked.includes(l.fips)) ?? [];
  const totalLow = priced ? priced.total_low + (withBranding ? terms.brandingPrice! : 0) : 0;
  const totalHigh = priced ? priced.total_high + (withBranding ? terms.brandingPrice! : 0) : 0;
  const extraPeople = Math.max(0, people - terms.seatsIncluded);

  return (
    <>
      <section className="lp-plans" aria-label="Options" data-licensing="plans">
        <div className="lp-plan" data-licensing="plan" data-plan="individual">
          <span className="lp-label">Individual</span>
          <h2 className="lp-plan__title">For one person.</h2>
          <div className="lp-plan__price">
            <span className="lp-plan__from">From</span>
            <span className="lp-plan__fig" data-licensing="from-individual">{from.individual !== null ? usd(from.individual) : "On request"}</span>
            <span className="lp-plan__per">per county, per year</span>
          </div>
          <ul className="lp-plan__list">
            <li>One person uses Signal</li>
            <li>Choose any counties, each priced on its own</li>
            <li>Lower prices for {terms.bundleMinCounties} or more counties, or a whole state</li>
          </ul>
          <button type="button" className="lp-btn lp-btn--line" onClick={() => choose("individual", false)} data-licensing="choose-individual">Choose counties</button>
        </div>

        <div className="lp-plan lp-plan--dark" data-licensing="plan" data-plan="firm">
          <span className="lp-label lp-label--dark">Firm</span>
          <h2 className="lp-plan__title">For your whole team.</h2>
          <div className="lp-plan__price">
            <span className="lp-plan__from">From</span>
            <span className="lp-plan__fig" data-licensing="from-firm">{from.firm !== null ? usd(from.firm) : "On request"}</span>
            <span className="lp-plan__per">per county, per year</span>
          </div>
          <ul className="lp-plan__list">
            <li>{terms.seatsIncluded} people included</li>
            <li>More people available {terms.seatStep} at a time</li>
            <li>Lower prices for {terms.bundleMinCounties} or more counties, or a whole state</li>
          </ul>
          <button type="button" className="lp-btn lp-btn--light" onClick={() => choose("firm", false)} data-licensing="choose-firm">Choose counties</button>
        </div>

        <div className="lp-plan" data-licensing="plan" data-plan="branding">
          <span className="lp-label">Firm with your branding</span>
          <h2 className="lp-plan__title">Signal under your firm&rsquo;s own name and logo.</h2>
          <div className="lp-plan__price">
            <span className="lp-plan__fig" data-licensing="branding-price">{terms.brandingPrice !== null ? usd(terms.brandingPrice) : "On request"}</span>
            <span className="lp-plan__per">per year, on top of the firm license</span>
          </div>
          <ul className="lp-plan__list">
            <li>Your name and logo on the sign-in page, in Signal and in its emails</li>
            {terms.brandingMinPeople !== null && <li>For firms of {terms.brandingMinPeople} or more people</li>}
          </ul>
          <button type="button" className="lp-btn lp-btn--line" onClick={() => choose("firm", true)} data-licensing="choose-branding">Choose counties</button>
        </div>
      </section>

      <section className="lp-card lp-store" id="choose" ref={pickerRef} aria-labelledby="lp-choose" data-licensing="picker">
        <h2 className="lp-eyebrow" id="lp-choose">Build your license</h2>
        <div className="lp-store__grid">
          <div className="lp-store__pick">
            <div className="lp-seg" role="tablist" aria-label="State">
              {states.map((s) => (
                <button key={s} type="button" role="tab" aria-selected={st === s} className={`lp-seg__btn${st === s ? " is-on" : ""}`}
                  onClick={() => setSt(s)} data-licensing="state-tab" data-state={s}>{STATE_NAMES[s]}</button>
              ))}
            </div>

            <div className="lp-search">
              <label className="lp-label" htmlFor="lp-search">Find a town or county</label>
              <input id="lp-search" type="search" className="lp-search__input" placeholder="A town or county, like Glastonbury"
                value={q} onChange={(e) => { setQ(e.target.value); setFound(null); }} autoComplete="off" data-licensing="search"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (results[0]) pickResult(results[0]); } }} />
              {results.length > 0 && (
                <ul className="lp-search__results" data-licensing="search-results">
                  {results.map((r) => (
                    <li key={r.key}>
                      <button type="button" onClick={() => pickResult(r)} data-licensing="search-result" data-fips={r.fips}>
                        <span>{r.label}</span><span className="lp-search__in">{r.detail}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {needle.length >= 2 && !results.length && geo && <p className="lp-search__none">Nothing found in Connecticut or Florida by that name.</p>}
              <p className="lp-search__found" aria-live="polite" data-licensing="search-found">{found}</p>
            </div>

            <div className="lp-mapwell">
              {map ? (
                <svg className="lp-map" viewBox={`0 0 ${map.w} ${map.h}`} role="group" aria-label={`Map of ${STATE_NAMES[st]}. Choose a county to add it.`} data-licensing="map" data-state={st}>
                  <path className="lp-map__outline" d={map.outline} />
                  {map.counties.filter((c) => byFips.has(c.fips)).map((c) => {
                    const on = picked.includes(c.fips);
                    const name = byFips.get(c.fips)!.name;
                    return (
                      <path key={c.fips} d={c.d} className={`lp-map__c${on ? " is-on" : ""}`} tabIndex={0} role="checkbox" aria-checked={on} aria-label={name}
                        onClick={() => toggle(c.fips)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(c.fips); } }}
                        onMouseEnter={() => setHover(name)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(name)} onBlur={() => setHover(null)}
                        data-licensing="map-county" data-fips={c.fips}>
                        <title>{name}</title>
                      </path>
                    );
                  })}
                </svg>
              ) : (
                <div className="lp-map__wait">Loading the map</div>
              )}
              <div className="lp-mapbar">
                <span className="lp-mapbar__hint">{hover ?? "Choose a county on the map to add it or take it off"}</span>
                <button type="button" className="lp-chip" onClick={toggleState} data-licensing="pick-state" data-state={st}>
                  {everyInState ? `Clear ${STATE_NAMES[st]}` : `All ${stateAll.length} in ${STATE_NAMES[st]}`}
                </button>
              </div>
            </div>
          </div>

          <div className="lp-cart" data-licensing="cart">
            <div className="lp-cart__head">
              <div className="lp-seg lp-seg--dark" role="radiogroup" aria-label="License">
                {(["individual", "firm"] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={mode === m} className={`lp-seg__btn${mode === m ? " is-on" : ""}`}
                    onClick={() => { setMode(m); setDone(null); }} data-licensing="mode" data-mode={m}>{m === "individual" ? "Individual" : "Firm"}</button>
                ))}
              </div>
              {mode === "firm" ? (
                <div className="lp-people">
                  <span className="lp-people__label">People</span>
                  <div className="lp-stepper">
                    <button type="button" aria-label={`${terms.seatStep} fewer people`} disabled={people <= terms.seatsIncluded}
                      onClick={() => setPeople((n) => Math.max(terms.seatsIncluded, n - terms.seatStep))} data-licensing="people-less">&minus;</button>
                    <span className="lp-stepper__n" aria-live="polite" data-licensing="people">{int(people)}</span>
                    <button type="button" aria-label={`${terms.seatStep} more people`} disabled={people >= 1000}
                      onClick={() => setPeople((n) => Math.min(1000, n + terms.seatStep))} data-licensing="people-more">+</button>
                  </div>
                </div>
              ) : (
                <p className="lp-cart__who">One person</p>
              )}
              {mode === "firm" && terms.brandingPrice !== null && (
                <label className={`lp-brand-opt${brandingOk ? "" : " is-off"}`}>
                  <input type="checkbox" checked={withBranding} disabled={!brandingOk} onChange={(e) => setBranding(e.target.checked)} data-licensing="branding" />
                  <span>
                    Your firm&rsquo;s name and logo, {usd(terms.brandingPrice)} a year
                    {!brandingOk && terms.brandingMinPeople !== null && <span className="lp-brand-opt__note"> For firms of {terms.brandingMinPeople} or more people.</span>}
                  </span>
                </label>
              )}
            </div>

            <div className="lp-cart__body" aria-live="polite">
              {!picked.length && <p className="lp-cart__empty">Choose counties on the map or by name. Each one appears here with its price.</p>}
              {priceError && <p className="lp-cart__error" role="alert">{priceError}</p>}
              {picked.length > 0 && !priceError && (
                <>
                  <ul className="lp-lines" data-licensing="lines">
                    {lines.map((l) => {
                      const c = byFips.get(l.fips);
                      const f = c ? filings(c) : null;
                      return (
                        <li key={l.fips} className="lp-line" data-licensing="line" data-fips={l.fips}>
                          <div className="lp-line__top">
                            <span className="lp-line__name">{c?.name ?? l.name}</span>
                            <span className="lp-fig" data-licensing="line-price">{range(l.low, l.high)}</span>
                          </div>
                          {mode === "firm" && (
                            <span className="lp-line__sub" data-licensing="line-detail">
                              {terms.seatsIncluded} seats included{extraPeople > 0 && l.addedHigh > 0 ? `; ${int(extraPeople)} more seats ${range(l.addedLow, l.addedHigh)}` : ""}
                            </span>
                          )}
                          {f && <span className="lp-line__sub" data-licensing="line-filings">{f}</span>}
                          <button type="button" className="lp-line__x" onClick={() => toggle(l.fips)} aria-label={`Take ${c?.name ?? l.name} off`}>Remove</button>
                        </li>
                      );
                    })}
                    {priced?.discounts.map((d) => (
                      <li key={d.label} className="lp-line lp-line--discount" data-licensing="discount">
                        <div className="lp-line__top"><span>{d.label}</span><span className="lp-fig">&minus;{range(d.low, d.high)}</span></div>
                      </li>
                    ))}
                    {withBranding && (
                      <li className="lp-line" data-licensing="branding-line">
                        <div className="lp-line__top"><span>Your firm&rsquo;s name and logo</span><span className="lp-fig">{usd(terms.brandingPrice!)}</span></div>
                      </li>
                    )}
                  </ul>
                  {priced && (
                    <div className="lp-total">
                      <span>Total for one year</span>
                      <span className="lp-total__fig" data-licensing="total">{range(totalLow, totalHigh)}</span>
                    </div>
                  )}
                  {priced && priced.total_low !== priced.total_high && (
                    <p className="lp-cart__note">Where a price is a range, the higher figure includes records Red Planet Data obtains by request in that county.</p>
                  )}
                </>
              )}

              {done ? (
                <div className="lp-done" role="status" data-licensing="request-done">
                  <p className="lp-done__title">Thank you. Your request is with Red Planet Data.</p>
                  <p>An agreement and an invoice will follow by email to {done}. Access to Signal is turned on when payment clears.</p>
                </div>
              ) : (
                <>
                  {!asking && (
                    <button type="button" className="lp-btn" disabled={!picked.length || !priced} onClick={() => setAsking(true)} data-licensing="request">
                      Request this license
                    </button>
                  )}
                  {asking && (
                    <form className="lp-ask" onSubmit={submit} noValidate data-licensing="request-form">
                      <label className="lp-field">
                        <span className="lp-label">Your name</span>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={160} autoComplete="name" data-licensing="f-name" />
                      </label>
                      {mode === "firm" && (
                        <label className="lp-field">
                          <span className="lp-label">Firm</span>
                          <input value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} required maxLength={160} autoComplete="organization" data-licensing="f-firm" />
                        </label>
                      )}
                      <label className="lp-field">
                        <span className="lp-label">Email</span>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={200} autoComplete="email" data-licensing="f-email" />
                      </label>
                      <label className="lp-field">
                        <span className="lp-label">Phone</span>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={40} autoComplete="tel" data-licensing="f-phone" />
                      </label>
                      <label className="lp-honey" aria-hidden="true">
                        Website
                        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                      </label>
                      {error && <p className="lp-cart__error" role="alert">{error}</p>}
                      <button type="submit" className="lp-btn" disabled={busy} data-licensing="send">{busy ? "Sending" : "Send request"}</button>
                      <p className="lp-cart__note">We email you an agreement and an invoice. Access is turned on when payment clears.</p>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
