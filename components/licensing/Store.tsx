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
//
// COUNTY-9.1 (2026-10-20): the header, the Individual and Firm cards and the first question name only the filing types
// Red Planet Data holds in the state being viewed (`held`, derived from the current counts, lib/licensing.ts); before
// a state is chosen, the types held in every state. Every figure in the cards and questions comes from the pricing
// table (`terms`). A state's counties that the store does not offer (`onRequest`) are drawn on its map but cannot be
// chosen, and "Other <state> counties are available on request." opens a request form with the state set and a
// free-text field for the counties wanted.

export type FilingType = "foreclosure" | "probate";

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
  individualPct: number;
  individualFloor: number;
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
type Result = { key: string; label: string; detail: string; fips: string; state: string; offered: boolean; county: string };

const STATE_NAMES: Record<string, string> = { CT: "Connecticut", FL: "Florida" };
const SHOT = {
  src: "/licensing/signal-screenshot.png",
  alt: "Signal showing new filings in Connecticut: the list of filings on the left, the map in the middle, and a property with the owner's contact details on the right",
  w: 1680,
  h: 983,
};
const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const range = (lo: number, hi: number) => (Math.round(lo) === Math.round(hi) ? usd(hi) : `${usd(lo)} to ${usd(hi)}`);
const int = (v: number) => Math.round(v).toLocaleString("en-US");
/** "foreclosure", "foreclosure and probate". */
const typesText = (ts: FilingType[]) => (ts.length ? ts.join(" and ") : "");

function filings(c: StoreCounty): string | null {
  const parts = [
    c.foreclosure90 !== null ? `${int(c.foreclosure90)} foreclosure` : null,
    c.probate90 !== null ? `${int(c.probate90)} probate` : null,
  ].filter(Boolean);
  if (!parts.length) return null;
  const n = (c.foreclosure90 ?? 0) + (c.probate90 ?? 0);
  return `${parts.join(" and ")} ${n === 1 ? "filing" : "filings"} in the last 90 days`;
}

export function Store({ counties, terms, from, held, onRequest }: {
  counties: StoreCounty[];
  terms: StoreTerms;
  from: { individual: number | null; firm: number | null };
  held: Record<string, FilingType[]>;
  onRequest: Record<string, Array<{ fips: string; name: string }>>;
}) {
  const byFips = useMemo(() => new Map(counties.map((c) => [c.fips, c])), [counties]);
  const requestable = useMemo(() => new Map(Object.entries(onRequest).flatMap(([st, cs]) => cs.map((c) => [c.fips, { ...c, state: st }] as const))), [onRequest]);
  const states = useMemo(() => Object.keys(STATE_NAMES).filter((s) => counties.some((c) => c.state === s)), [counties]);
  const [st, setSt] = useState<string | null>(null);
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
  const [asking, setAsking] = useState<null | "license" | "other">(null);
  const [otherState, setOtherState] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", firm: "", email: "", phone: "", wanted: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { kind: "license" | "other"; email: string }>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // The filing types named in the header, the cards and the first question: the chosen state's, or before a state is
  // chosen, those held in every state.
  const types: FilingType[] = st
    ? held[st] ?? []
    : (["foreclosure", "probate"] as FilingType[]).filter((t) => states.length > 0 && states.every((s) => (held[s] ?? []).includes(t)));
  const typed = typesText(types);

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
  const stateAll = st ? counties.filter((c) => c.state === st).map((c) => c.fips) : [];
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

  const askOther = (state: string, county?: string) => {
    setOtherState(state);
    setAsking("other");
    setDone(null);
    setError(null);
    if (county) setForm((f) => (f.wanted.split(/,\s*/).includes(county) ? f : { ...f, wanted: f.wanted ? `${f.wanted}, ${county}` : county }));
    setTimeout(() => cartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  // Search: counties by name, and towns, each pointing at the county it sits in. A county the store does not offer is
  // listed as on request and opens the request form.
  const needle = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (needle.length < 2) return [] as Result[];
    const out: Result[] = [];
    const countyOf = (fips: string) => {
      const c = byFips.get(fips);
      if (c) return { name: c.name, state: c.state, offered: true };
      const r = requestable.get(fips);
      return r ? { name: r.name, state: r.state, offered: false } : null;
    };
    const where = (c: { name: string; state: string; offered: boolean }) => `${c.name}, ${STATE_NAMES[c.state]}${c.offered ? "" : ", on request"}`;
    for (const c of [...counties.map((x) => ({ fips: x.fips, name: x.name, state: x.state, offered: true })),
      ...[...requestable.values()].map((x) => ({ ...x, offered: false }))]) {
      if (c.name.toLowerCase().includes(needle)) {
        out.push({ key: `c${c.fips}`, label: c.name, detail: `${STATE_NAMES[c.state]}${c.offered ? "" : ", on request"}`, fips: c.fips, state: c.state, offered: c.offered, county: c.name });
      }
    }
    for (const [name, fips] of geo?.towns ?? []) {
      const c = countyOf(fips);
      if (c && name.toLowerCase().startsWith(needle)) {
        out.push({ key: `t${name}${fips}`, label: name, detail: where(c), fips, state: c.state, offered: c.offered, county: c.name });
      }
    }
    return out.slice(0, 8);
  }, [needle, counties, requestable, geo, byFips]);

  const pickResult = (r: Result) => {
    setSt(r.state);
    setQ("");
    if (!r.offered) {
      setFound(`${r.label === r.county ? r.county : `${r.label} is in ${r.county}, which`} is available on request.`);
      askOther(r.state, r.county);
      return;
    }
    add(r.fips);
    setFound(r.label === r.county ? `${r.county} added.` : `${r.label} is in ${r.county}. ${r.county} added.`);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const other = asking === "other";
    if (!other && !picked.length) {
      setError("Choose at least one county.");
      return;
    }
    setBusy(true);
    try {
      const body = other
        ? { kind: "on_request", state: otherState, wanted: form.wanted, license: mode, seats: mode === "firm" ? people : undefined,
            name: form.name, firm: form.firm, email: form.email, phone: form.phone, website: form.website }
        : { kind: mode, name: form.name, firm: form.firm, email: form.email, phone: form.phone,
            seats: mode === "firm" ? people : undefined, branding: withBranding, counties: picked, website: form.website };
      const r = await fetch("/api/licensing/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) setError(j.error ?? "That did not go through. Please try again.");
      else {
        setDone({ kind: other ? "other" : "license", email: form.email });
        setAsking(null);
      }
    } catch {
      setError("That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const map = st ? geo?.maps[st] : undefined;
  const lines = priced?.lines.filter((l) => picked.includes(l.fips)) ?? [];
  const totalLow = priced ? priced.total_low + (withBranding ? terms.brandingPrice! : 0) : 0;
  const totalHigh = priced ? priced.total_high + (withBranding ? terms.brandingPrice! : 0) : 0;
  const extraPeople = Math.max(0, people - terms.seatsIncluded);
  const others = st ? onRequest[st] ?? [] : [];

  const questions: Array<[string, string]> = [
    [
      "What is included in a county?",
      `Signal shows the new ${typed} filings Red Planet Data collects in that county, each on a list and a map with the property's owner and their phone, email and mailing address. It also includes the county's homes, who owns them and their recorded sales. What is collected differs a little from county to county, and your agreement lists it for each county you choose.`,
    ],
    [
      "What happens if we need more people?",
      `A firm license includes ${int(terms.seatsIncluded)} people in every county you choose. You can add people ${int(terms.seatStep)} at a time, and each ${int(terms.seatStep)} more adds ${terms.seatStepPct}% of that county's yearly price. Write to us and we will send an updated agreement and invoice.`,
    ],
    [
      "Can we add counties later?",
      `Yes. Tell us which counties you want to add and we will send an updated agreement and invoice at the prices on this page. With ${int(terms.bundleMinCounties)} or more counties the price drops by ${terms.bundleDiscountPct}%, and with every county in a state it drops by ${terms.stateDiscountPct}%.`,
    ],
    [
      "How does renewal work?",
      "A license runs for one year and is paid in advance. Before the year ends we will be in touch about renewing, and that is a good time to add or change counties and people.",
    ],
    [
      "Can we get a refund?",
      "The first year is paid in advance and is not refundable. If you have questions before you buy, write to hello@redplanetdata.com and we will answer them.",
    ],
    [
      "How does branding work?",
      terms.brandingPrice !== null && terms.brandingMinPeople !== null
        ? `For firms of ${int(terms.brandingMinPeople)} or more people, Signal can appear under your firm's own name and logo, on the sign-in page, inside the application and in the emails your people get. It costs ${usd(terms.brandingPrice)} a year on top of the firm license.`
        : "Signal can appear under your firm's own name and logo, on the sign-in page, inside the application and in the emails your people get. Write to us for the price.",
    ],
  ];

  return (
    <>
      <section className="lp-card lp-card--dark lp-hero" data-licensing="summary" data-state={st ?? ""}>
        <h1 className="lp-h1" data-licensing="headline">
          Signal shows your agents every new {typed} filing in the counties you license, with the owner&rsquo;s contact details.
        </h1>
        <figure className="lp-shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SHOT.src} alt={SHOT.alt} width={SHOT.w} height={SHOT.h} data-licensing="signal-shot" />
        </figure>
      </section>

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
            <li data-licensing="plan-filings">Every new {typed} filing in your counties</li>
            <li>One person uses Signal</li>
            <li>Choose any counties, each priced on its own</li>
            <li>Lower prices for {int(terms.bundleMinCounties)} or more counties, or a whole state</li>
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
            <li data-licensing="plan-filings">Every new {typed} filing in your counties</li>
            <li>{int(terms.seatsIncluded)} people included</li>
            <li>More people available {int(terms.seatStep)} at a time</li>
            <li>Lower prices for {int(terms.bundleMinCounties)} or more counties, or a whole state</li>
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
            {terms.brandingMinPeople !== null && <li>For firms of {int(terms.brandingMinPeople)} or more people</li>}
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
                      <button type="button" onClick={() => pickResult(r)} data-licensing="search-result" data-fips={r.fips} data-offered={r.offered ? "yes" : "no"}>
                        <span>{r.label}</span><span className="lp-search__in">{r.detail}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {needle.length >= 2 && !results.length && geo && <p className="lp-search__none">Nothing found in {states.map((s) => STATE_NAMES[s]).join(" or ")} by that name.</p>}
              <p className="lp-search__found" aria-live="polite" data-licensing="search-found">{found}</p>
            </div>

            <div className="lp-mapwell">
              {!st ? (
                <div className="lp-map__wait" data-licensing="choose-state">Choose {states.map((s) => STATE_NAMES[s]).join(" or ")} to see its counties</div>
              ) : map ? (
                <svg className="lp-map" viewBox={`0 0 ${map.w} ${map.h}`} role="group" aria-label={`Map of ${STATE_NAMES[st]}. Choose a county to add it.`} data-licensing="map" data-state={st}>
                  <path className="lp-map__outline" d={map.outline} />
                  {map.counties.filter((c) => !byFips.has(c.fips) && requestable.has(c.fips)).map((c) => (
                    <path key={c.fips} d={c.d} className="lp-map__c is-off" data-licensing="map-county-off" data-fips={c.fips}
                      onMouseEnter={() => setHover(`${requestable.get(c.fips)!.name}: available on request`)} onMouseLeave={() => setHover(null)}>
                      <title>{`${requestable.get(c.fips)!.name}: available on request`}</title>
                    </path>
                  ))}
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
              {st && (
                <div className="lp-mapbar">
                  <span className="lp-mapbar__hint">{hover ?? (others.length ? "Choose a light county to add it or take it off; the shaded ones are on request" : "Choose a county on the map to add it or take it off")}</span>
                  {!others.length && (
                    <button type="button" className="lp-chip" onClick={toggleState} data-licensing="pick-state" data-state={st}>
                      {everyInState ? `Clear ${STATE_NAMES[st]}` : `All ${stateAll.length} in ${STATE_NAMES[st]}`}
                    </button>
                  )}
                </div>
              )}
            </div>
            {st && others.length > 0 && (
              <p className="lp-other" data-licensing="on-request-line" data-state={st}>
                Other {STATE_NAMES[st]} counties are{" "}
                <a href="#cart" onClick={(e) => { e.preventDefault(); askOther(st); }} data-licensing="on-request-link">available on request</a>.
              </p>
            )}
          </div>

          <div className="lp-cart" id="cart" ref={cartRef} data-licensing="cart">
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
              {mode === "firm" && terms.brandingPrice !== null && asking !== "other" && (
                <label className={`lp-brand-opt${brandingOk ? "" : " is-off"}`}>
                  <input type="checkbox" checked={withBranding} disabled={!brandingOk} onChange={(e) => setBranding(e.target.checked)} data-licensing="branding" />
                  <span>
                    Your firm&rsquo;s name and logo, {usd(terms.brandingPrice)} a year
                    {!brandingOk && terms.brandingMinPeople !== null && <span className="lp-brand-opt__note"> For firms of {int(terms.brandingMinPeople)} or more people.</span>}
                  </span>
                </label>
              )}
            </div>

            <div className="lp-cart__body" aria-live="polite">
              {asking !== "other" && (
                <>
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
                                  {int(terms.seatsIncluded)} seats included{extraPeople > 0 && l.addedHigh > 0 ? `; ${int(extraPeople)} more seats ${range(l.addedLow, l.addedHigh)}` : ""}
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
                </>
              )}

              {done ? (
                <div className="lp-done" role="status" data-licensing="request-done" data-kind={done.kind}>
                  <p className="lp-done__title">Thank you. Your request is with Red Planet Data.</p>
                  {done.kind === "license"
                    ? <p>An agreement and an invoice will follow by email to {done.email}. Access to Signal is turned on when payment clears.</p>
                    : <p>We will write to {done.email} with prices for those counties. Access to Signal is turned on when payment clears.</p>}
                </div>
              ) : (
                <>
                  {!asking && (
                    <button type="button" className="lp-btn" disabled={!picked.length || !priced} onClick={() => setAsking("license")} data-licensing="request">
                      Request this license
                    </button>
                  )}
                  {asking && (
                    <form className="lp-ask" onSubmit={submit} noValidate data-licensing={asking === "other" ? "on-request-form" : "request-form"}>
                      {asking === "other" && (
                        <>
                          <p className="lp-ask__head" data-licensing="on-request-state">Other {STATE_NAMES[otherState ?? "FL"]} counties</p>
                          <label className="lp-field">
                            <span className="lp-label">Counties you want</span>
                            <textarea rows={3} value={form.wanted} onChange={(e) => setForm({ ...form, wanted: e.target.value })} required maxLength={1000} data-licensing="f-wanted" />
                          </label>
                        </>
                      )}
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
                      {asking === "other" ? (
                        <p className="lp-cart__note">We reply with prices for those counties. <button type="button" className="lp-textbtn" onClick={() => setAsking(null)}>Back to your license</button></p>
                      ) : (
                        <p className="lp-cart__note">We email you an agreement and an invoice. Access is turned on when payment clears.</p>
                      )}
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="lp-card" aria-labelledby="lp-faq" data-licensing="questions">
        <h2 className="lp-eyebrow" id="lp-faq">Questions</h2>
        <div className="lp-faq">
          {questions.map(([qq, a]) => (
            <details key={qq} className="lp-faq__item" data-licensing="question">
              <summary className="lp-faq__q">{qq}</summary>
              <p className="lp-faq__a">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
