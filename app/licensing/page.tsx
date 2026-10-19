import type { Metadata } from "next";
import { IndividualBuy } from "@/components/licensing/IndividualBuy";
import { QuoteForm } from "@/components/licensing/QuoteForm";
import { LICENSING_REVALIDATE, LICENSING_STATES, loadLicensing, longDay, priceText, usd, type CountyPrice } from "@/lib/licensing";
import Link from "next/link";
import "./licensing.css";

// COUNTY-4.2 (2026-10-18): residential county licensing for Connecticut and Florida.
// COUNTY-7 (2026-10-18): operator ruling -- the license is for Signal, Red Planet Data's application for residential
// agents, with the firm's licensed counties loaded in it.
// COUNTY-8 (2026-10-19): the page is drawn in the design of the shared Signal license page (atlas-dash
// app/o/[token]/LicenseView.tsx, LICENSE-3): a light document on paper whichever theme the device asks for, with the
// company's own top bar, a dark summary card, numbered cards and one sticky panel. In order: what Signal is and does
// (the license page's screenshot and three captions); the license (the counties loaded into Signal, seats, individual
// licenses, white label for larger brokerages, the standing terms); the Connecticut and Florida tables in the shared
// price list's compact form (county, residential parcels, 90-day foreclosure and probate filings, firm and individual
// price); then the two request forms. The catalog's own calculation text is not shown: it is written for the operator
// (levels and bands), and the shared price list does not carry it either.
//
// NOT LINKED FROM ANYWHERE on the site, and not indexed: it is reachable only by its address until the operator
// links it. Every price, discount, seat term, count and terms text is read live from the County Catalog
// (lib/licensing.ts); this file holds the words around them and no figure of its own.

export const revalidate = LICENSING_REVALIDATE;

export const metadata: Metadata = {
  title: "Licensing | Red Planet Data",
  description: "Signal, Red Planet Data's application for residential agents, licensed with Connecticut and Florida counties loaded in it.",
  robots: { index: false, follow: false },
};

const RECORD_TYPES: Array<[string, string]> = [
  ["Residential parcels", "every home on the county's roll: single family, condominium, multi-family, mobile home and co-operative"],
  ["Owners", "the owner of record of each parcel, matched across the properties they hold"],
  ["Sales", "recorded sales of each parcel, with their dates and prices"],
  ["Foreclosure court filings", "lis pendens and foreclosure cases filed against a property"],
  ["Probate filings", "estates opened in probate court"],
  ["Tax delinquency records", "property taxes unpaid past their due date"],
  ["Liens", "liens recorded against a property"],
  ["Code enforcement cases", "violations cited by the municipality"],
];

// The Signal section of the shared license page (atlas-dash LicenseView.tsx): the same screenshot, captions and note.
const SIGNAL_SHOT = {
  src: "/licensing/signal-screenshot.png",
  alt: "Signal showing a Connecticut territory: the list of filings on the left, the map of the territory in the middle, and a property brief with owner contact on the right",
  w: 1680,
  h: 983,
};
const PANES: Array<[string, string]> = [
  ["The List", "Every filing, newest first, with its filing date and assessed value."],
  ["The Map", "Each filing pinned to its parcel, filtered by filing type and town."],
  ["The Property Brief", "The filing, debt and ownership, with the owner’s phone, email and mailing address."],
];
const ISSUER = "Red Planet Data, Inc.";
const int = (v: number) => Math.round(v).toLocaleString("en-US");

function Mark({ id, size, dark }: { id: string; size: number; dark?: boolean }) {
  return (
    <svg className={`lp-mark${dark ? " is-dark" : ""}`} width={size} height={size} viewBox="0 0 28 28" role={dark ? undefined : "img"} aria-label={dark ? undefined : "Red Planet Data mark"} aria-hidden={dark ? true : undefined}>
      <defs><clipPath id={id}><circle cx="14" cy="14" r="14" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect className="lp-mark__sun" x="0" y="0" width="28" height="14" />
        {[15, 18.6, 22.2, 25.8].map((y) => <rect key={y} className="lp-mark__line" x="0" y={y} width="28" height="2.4" />)}
      </g>
    </svg>
  );
}

function PriceTable({ n, state, counties, seats }: { n: string; state: string; counties: CountyPrice[]; seats: number | null }) {
  const name = LICENSING_STATES[state];
  // The earliest as-of date of the counts in this table, as the license page dates its counts.
  const dates = counties.map((c) => c.countsAsOf).filter((d): d is string => !!d).sort();
  const asOf = dates.length ? longDay(dates[0]) : null;
  return (
    <section className="lp-card lp-card--sage" aria-labelledby={`prices-${state}`} data-licensing="price-list" data-state={state}>
      <h2 className="lp-eyebrow" id={`prices-${state}`}>{n} · {name} <span className="lp-eyebrow__count">{counties.length} {counties.length === 1 ? "county" : "counties"}</span></h2>
      <div className="lp-tablecard">
        <div className="lp-scroll">
          <table className="lp-table" data-licensing="county-table">
            <thead>
              <tr>
                <th>County</th>
                <th className="num">Residential parcels</th>
                <th className="num">Foreclosure, 90 days</th>
                <th className="num">Probate, 90 days</th>
                <th className="num">Firm, a year</th>
                <th className="num">Individual, a year</th>
              </tr>
            </thead>
            <tbody>
              {counties.map((c) => (
                <tr key={c.fips} data-licensing="county-line" data-fips={c.fips}>
                  <td><span className="lp-tname"><span className="lp-swatch" />{c.shortName}</span></td>
                  <td className="num" data-licensing="parcels">{c.parcels !== null ? int(c.parcels) : "—"}</td>
                  <td className="num" data-licensing="foreclosure-90">{c.foreclosure90 !== null ? int(c.foreclosure90) : "—"}</td>
                  <td className="num" data-licensing="probate-90">{c.probate90 !== null ? int(c.probate90) : "—"}</td>
                  <td className="num" data-licensing="firm-price">{priceText(c.firmLow, c.firmHigh)}</td>
                  <td className="num" data-licensing="individual-price">{priceText(c.individualLow, c.individualHigh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lp-asof" data-licensing="table-note">
          {seats !== null ? `Firm prices are for one year of a firm license with ${seats} seats; an individual license is for one named person.` : "An individual license is for one named person."}
          {asOf && <> Filing counts are for the last 90 days, as of {asOf}.</>} A dash means Red Planet Data does not hold that record type in the county.
          {" "}Where a price is a range, the higher figure counts the record types Red Planet Data obtains by records request. Discounts are applied on a quote and are not shown here.
        </div>
      </div>
    </section>
  );
}

export default async function LicensingPage() {
  const data = await loadLicensing();
  const t = data?.terms;
  const counties = data?.counties ?? [];
  const pick = counties.map((c) => ({ fips: c.fips, state: c.state, name: c.name }));
  const individualTerms = (t?.individualTerms ?? "")
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const states = Object.keys(LICENSING_STATES).filter((st) => counties.some((c) => c.state === st));
  const wl = t?.whiteLabelPrice != null && t?.whiteLabelMinSeats != null;

  return (
    <div className="lp" data-licensing="page">
      <div className="lp-col">
        <header className="lp-top">
          <Link className="lp-brand" href="/"><Mark id="lp-mark-top" size={24} /><span className="lp-brand__name">Red Planet Data</span></Link>
          <span className="lp-label">Licensing</span>
        </header>

        <div className="lp-layout">
          <main className="lp-doc" id="top">
            <section className="lp-card lp-card--dark lp-hero" data-licensing="summary">
              <div className="lp-ov">
                <h1 className="lp-h1">Signal licenses for Connecticut and Florida.</h1>
                <p className="lp-lead">
                  Signal puts every new foreclosure and probate filing in a licensed county in front of your agents, with the
                  owner&rsquo;s contact details. Red Planet Data licenses it for a year at a time, to a firm with seats for its
                  people or to one named agent.
                </p>
              </div>
            </section>

            <section id="signal" className="lp-card" aria-labelledby="lp-01" data-licensing="signal">
              <h2 className="lp-eyebrow" id="lp-01">01 · What Signal is</h2>
              <p className="lp-text">
                Signal, at signal.redplanetdata.com, is Red Planet Data&rsquo;s application for residential agents. An agent
                signs in and works the properties in the counties their license covers, with the records Red Planet Data
                collects and keeps current attached to each property.
              </p>
              <figure className="lp-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SIGNAL_SHOT.src} alt={SIGNAL_SHOT.alt} width={SIGNAL_SHOT.w} height={SIGNAL_SHOT.h} data-licensing="signal-shot" />
              </figure>
              <div className="lp-panes" data-licensing="signal-features">
                {PANES.map(([h, d]) => (
                  <div key={h} className="lp-pane"><span className="lp-pane__h">{h}</span><span className="lp-pane__t">{d}</span></div>
                ))}
              </div>
              <div className="lp-mask">Names, addresses and case details are masked in this image. Records are used inside Signal; Signal does not offer bulk downloads of lists or records.</div>
            </section>

            <section id="license" className="lp-card" aria-labelledby="lp-02" data-licensing="license">
              <h2 className="lp-eyebrow" id="lp-02">02 · The license</h2>
              <div className="lp-blocks">
                <div className="lp-block">
                  <h3 className="lp-h3">The counties loaded into Signal</h3>
                  <p>
                    A license loads one or more counties into Signal for one year. In Connecticut a county is one of the
                    state&rsquo;s nine planning regions; in Florida it is one of its 67 counties. Each county is priced on its
                    own. Every county includes residential parcels, owners and sales; a county that also carries
                    foreclosure filings and more of the other record types below is priced higher.
                  </p>
                </div>
                <div className="lp-block" id="firm">
                  <h3 className="lp-h3">{t ? `${t.seatsIncluded} seats, then blocks` : "Seats"}</h3>
                  {t ? (
                    <>
                      <p>
                        A firm license is held by the firm, and its seats are the people at the firm who use Signal. Each
                        county license includes {t.seatsIncluded} seats, which is also the least a firm license carries. More
                        seats come in blocks of {t.seatBlockSize}; each block adds {t.seatBlockPct}% of that county&rsquo;s
                        annual license price.
                      </p>
                      {t.seatRule && <p data-licensing="seat-rule">{t.seatRule}</p>}
                      <p>
                        A quote of {t.bundleMinCounties} or more counties takes {t.bundleDiscountPct}% off those county lines,
                        licenses and seats together. A quote holding every county of a state takes {t.stateDiscountPct}% off
                        that state&rsquo;s county lines instead. No county line is discounted twice.
                      </p>
                    </>
                  ) : (
                    <p>Firm license terms are available on request from hello@redplanetdata.com.</p>
                  )}
                </div>
                <div className="lp-block" id="individual">
                  <h3 className="lp-h3">Individual licenses</h3>
                  {t ? (
                    <p>
                      An individual license is held by one named agent, for their own use in Signal. It is priced county by
                      county at {t.individualPct}% of the county&rsquo;s firm license price, and never less than{" "}
                      {usd(t.individualFloor)} a year for a county. It carries no seats. The same discounts apply:{" "}
                      {t.bundleDiscountPct}% off at {t.bundleMinCounties} or more counties, and {t.stateDiscountPct}% off every
                      county of a state when all of them are licensed.
                    </p>
                  ) : (
                    <p>Individual license terms are available on request from hello@redplanetdata.com.</p>
                  )}
                </div>
                <div className="lp-block" id="white-label">
                  <h3 className="lp-h3">White label, for larger brokerages</h3>
                  <p data-licensing="white-label">
                    {wl ? (
                      <>
                        A firm license of {t!.whiteLabelMinSeats} or more seats can add white label, for{" "}
                        {usd(t!.whiteLabelPrice!)} a year: Signal carries the firm&rsquo;s name, logo and color in place of
                        Signal&rsquo;s, on its sign-in page, in the application and in the emails its people receive, at the
                        firm&rsquo;s own address on redplanetdata.com.
                      </>
                    ) : (
                      <>
                        A firm license can add white label: Signal carries the firm&rsquo;s name, logo and color in place of
                        Signal&rsquo;s, at the firm&rsquo;s own address on redplanetdata.com. Terms are available on request
                        from hello@redplanetdata.com.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="lp-subhead"><span className="lp-label">Record types a county can carry</span></div>
              <dl className="lp-types" data-licensing="record-types">
                {RECORD_TYPES.map(([name, what]) => (
                  <div key={name} className="lp-types__row">
                    <dt>{name}</dt>
                    <dd>{what}</dd>
                  </div>
                ))}
              </dl>

              <div className="lp-subhead" id="terms"><span className="lp-label">Standing terms</span></div>
              <div className="lp-terms" data-licensing="terms">
                <div>
                  <span className="lp-terms__h">Firm license</span>
                  A one-year license to the firm. Paid in advance. The first year is non-refundable. The agreement is signed
                  with {ISSUER}
                </div>
                <div data-licensing="individual-terms">
                  <span className="lp-terms__h">Individual license</span>
                  {(individualTerms.length
                    ? individualTerms
                    : ["A one-year license to the named person.", "Paid in advance.", "The first year is non-refundable.",
                       "The license is not transferable.", "The agreement is signed with Red Planet Data, Inc."]
                  ).join(" ")}
                </div>
              </div>
            </section>

            {states.length ? (
              states.map((st, i) => (
                <PriceTable key={st} n={String(i + 3).padStart(2, "0")} state={st} counties={counties.filter((c) => c.state === st)}
                  seats={t?.seatsIncluded ?? null} />
              ))
            ) : (
              <section id="prices" className="lp-card" data-licensing="prices-unavailable">
                <h2 className="lp-eyebrow">03 · Prices</h2>
                <p className="lp-text">Prices are not available right now. Write to hello@redplanetdata.com and we will send them.</p>
              </section>
            )}

            <section id="quote" className="lp-card lp-form-card" aria-labelledby="lp-quote" data-licensing="quote">
              <h2 className="lp-eyebrow" id="lp-quote">{String(Math.max(states.length, 1) + 3).padStart(2, "0")} · Get a quote</h2>
              <p className="lp-text">
                For a firm license. Tell us the firm, the counties and how many seats, and Red Planet Data will send a written
                quote with each county as its own line.
              </p>
              <QuoteForm counties={pick} seatsIncluded={t?.seatsIncluded ?? 25} seatBlock={t?.seatBlockSize ?? 25} />
            </section>

            <section id="buy" className="lp-card lp-form-card" aria-labelledby="lp-buy" data-licensing="individual">
              <h2 className="lp-eyebrow" id="lp-buy">{String(Math.max(states.length, 1) + 4).padStart(2, "0")} · Request an individual license</h2>
              <p className="lp-text">
                Choose your counties to see the price for one year. Then send the request: the license agreement and an
                invoice follow by email, and access to Signal is turned on when payment clears.
              </p>
              <IndividualBuy counties={pick} />
            </section>
          </main>

          <aside className="lp-rail" aria-label="Signal license">
            <div className="lp-lic" data-licensing="panel">
              <div className="lp-lic__head">
                <div className="lp-lic__row1">
                  <span className="lp-label lp-label--dark">Signal License</span>
                  <Mark id="lp-mark-panel" size={20} dark />
                </div>
                <div className="lp-lic__no">Connecticut and Florida</div>
                <div className="lp-lic__kv">
                  <div><span>Issued by</span><span>{ISSUER}</span></div>
                  <div><span>Term</span><span>One year</span></div>
                  {t && <div><span>Firm license</span><span data-licensing="panel-seats">{t.seatsIncluded} seats included</span></div>}
                  {t && <div><span>Added seats</span><span>Blocks of {t.seatBlockSize}</span></div>}
                  {t && <div><span>Individual</span><span data-licensing="panel-individual">One named person</span></div>}
                  {wl && <div><span>White label</span><span data-licensing="panel-white-label">{t!.whiteLabelMinSeats}+ seats</span></div>}
                </div>
              </div>
              <div className="lp-lic__sec">
                <span className="lp-label">How it works</span>
                <div className="lp-steps">
                  {["Request a quote or an individual license", "Sign the agreement with Red Planet Data, Inc.", "Pay the invoice", "Access turned on"].map((s, i) => (
                    <div key={s} className={`lp-step${i === 0 ? "" : " is-off"}`}>
                      <span className={`lp-step__n${i === 0 ? " is-on" : " is-off"}`}>{i + 1}</span><span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lp-lic__sec lp-lic__actions">
                <a className="lp-btn" href="#quote" data-licensing="panel-quote">Get a quote</a>
                <a className="lp-btn lp-btn--line" href="#buy" data-licensing="panel-individual-link">Request an individual license</a>
              </div>
              <div className="lp-lic__foot">
                <div className="lp-lic__q">Questions: <a href="mailto:hello@redplanetdata.com">hello@redplanetdata.com</a></div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="lp-foot">
          <span>{ISSUER}</span>
          <a href="mailto:hello@redplanetdata.com">hello@redplanetdata.com</a>
        </footer>
      </div>
    </div>
  );
}
