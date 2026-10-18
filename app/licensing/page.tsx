import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IndividualBuy } from "@/components/licensing/IndividualBuy";
import { QuoteForm } from "@/components/licensing/QuoteForm";
import { LICENSING_REVALIDATE, LICENSING_STATES, loadLicensing, priceText, usd, type CountyPrice } from "@/lib/licensing";
import "./licensing.css";

// COUNTY-4.2 (2026-10-18): residential county licensing for Connecticut and Florida.
// COUNTY-7 (2026-10-18): operator ruling -- the license is for Signal, Red Planet Data's application for residential
// agents, with the firm's licensed counties loaded in it. The page now reads in that order: what Signal is and what
// agents do in it, with one screenshot; then the license (the counties loaded into Signal, seats, individual
// licenses, white label for larger brokerages); then the Connecticut and Florida prices and the two request forms.
//
// NOT LINKED FROM ANYWHERE on the site, and not indexed: it is reachable only by its address until the operator
// links it. Every price, discount, seat term and terms text is read live from the County Catalog
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

// The four things agents do in Signal: the same four the shared quote pages name (atlas-dash lib/share/signal-copy.ts).
const SIGNAL_FEATURES = [
  "A map and list of the properties with foreclosure, probate, divorce and tax filings in the territory, newest filing first, filtered by filing type and by town.",
  "A property brief for each address: the filing and its court, an estimated value, recorded debt, the tax assessment, the last sale and ownership.",
  "A contact lookup that returns the owner\u2019s phone, email and mailing address.",
  "A saved list for the properties each agent is working, and a dashboard of the territory by filing type.",
];

const levelText = (lo: number | null, hi: number | null) =>
  lo === null && hi === null ? null : lo === hi || lo === null || hi === null ? `Level ${hi ?? lo}` : `Level ${lo} to ${hi}`;

function PriceList({ state, counties }: { state: string; counties: CountyPrice[] }) {
  return (
    <section className="rpl-prices" aria-labelledby={`prices-${state}`} data-licensing="price-list" data-state={state}>
      <h3 className="rpl-h3" id={`prices-${state}`}>
        {LICENSING_STATES[state]} <span className="rpl-muted">{counties.length} {counties.length === 1 ? "county" : "counties"}</span>
      </h3>
      <div className="rpl-prices__head" aria-hidden="true">
        <span>County</span>
        <span>Firm license</span>
        <span>Individual license</span>
      </div>
      <ul className="rpl-prices__list">
        {counties.map((c) => (
          <li key={c.fips} className="rpl-line" data-licensing="county-line" data-fips={c.fips}>
            <div className="rpl-line__row">
              <span className="rpl-line__name">
                {c.name.replace(/, (Connecticut|Florida)$/, "")}
                {levelText(c.levelLow, c.levelHigh) && <span className="rpl-line__level">{levelText(c.levelLow, c.levelHigh)}</span>}
              </span>
              <span className="rpl-line__price" data-licensing="firm-price">
                <span className="rpl-line__label">Firm license</span>
                {priceText(c.firmLow, c.firmHigh)}
                <span className="rpl-line__per"> a year</span>
              </span>
              <span className="rpl-line__price" data-licensing="individual-price">
                <span className="rpl-line__label">Individual license</span>
                {priceText(c.individualLow, c.individualHigh)}
                <span className="rpl-line__per"> a year</span>
              </span>
            </div>
            {c.explanation && (
              <details className="rpl-why">
                <summary>How this price was calculated</summary>
                <p>{c.explanation}</p>
              </details>
            )}
          </li>
        ))}
      </ul>
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

  return (
    <>
      <div className="rph-page">
        <Header variant="page" />
        <main className="rph-doc rpl" id="top">
          <div className="rpl__inner">
            <p className="rpl-eyebrow">Licensing</p>
            <h1>Signal licenses for Connecticut and Florida.</h1>
            <p className="rph-doc__lede">
              Red Planet Data licenses Signal, its application for residential agents, for a year at a time. A license
              loads the counties it covers in Connecticut and Florida into Signal, and is held by a firm, with seats for
              its people, or by one named agent.
            </p>

            <nav className="rpl-toc" aria-label="On this page">
              <a href="#signal">Signal</a>
              <a href="#license">The license</a>
              <a href="#terms">Terms</a>
              <a href="#prices">Prices</a>
              <a href="#quote">Get a quote</a>
              <a href="#buy">Buy an individual license</a>
            </nav>

            <section id="signal" className="rpl-section" data-licensing="signal">
              <h2>What Signal is.</h2>
              <p>
                Signal, at signal.redplanetdata.com, is Red Planet Data&rsquo;s application for residential agents. An
                agent signs in and works the properties in the counties their license covers, with the records Red
                Planet Data collects and keeps current attached to each property.
              </p>
              <ul data-licensing="signal-features">
                {SIGNAL_FEATURES.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <figure className="rpl-shot" data-licensing="signal-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/licensing/signal-map.png" alt="Signal map and list of properties with filings in the Capitol region of Connecticut" width={1440} height={900} loading="lazy" />
                <figcaption>The map and list in Signal: properties with foreclosure, probate, divorce and tax filings in the territory, newest filing first. Names and addresses are blurred here.</figcaption>
              </figure>
              <p>Records are used inside Signal. Signal does not offer bulk downloads of lists or records.</p>
            </section>

            <section id="license" className="rpl-section" data-licensing="license">
              <h2>The license.</h2>
              <h3 className="rpl-h3">The counties loaded into Signal</h3>
              <p>
                A license loads one or more counties into Signal for one year. In Connecticut a county is one of the
                state&rsquo;s nine planning regions; in Florida it is one of its 67 counties. Each county is priced on its
                own, and these are the record types a county can carry:
              </p>
              <dl className="rpl-types" data-licensing="record-types">
                {RECORD_TYPES.map(([name, what]) => (
                  <div key={name} className="rpl-types__row">
                    <dt>{name}</dt>
                    <dd>{what}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Every county includes residential parcels, owners and sales. Which of the other five a county includes,
                and how Red Planet Data obtains each one, is written out under that county in the price list, in
                &ldquo;How this price was calculated.&rdquo; A county with more of them is at a higher level and a
                higher price.
              </p>

              <h3 className="rpl-h3" id="firm">Seats</h3>
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

              <h3 className="rpl-h3" id="individual">Individual licenses</h3>
              {t ? (
                <>
                  <p>
                    An individual license is held by one named agent, for their own use in Signal. It is priced county by
                    county at {t.individualPct}% of the county&rsquo;s firm license price, and never less than{" "}
                    {usd(t.individualFloor)} a year for a county. It carries no seats.
                  </p>
                  <p>
                    The same discounts apply: {t.bundleDiscountPct}% off at {t.bundleMinCounties} or more counties, and{" "}
                    {t.stateDiscountPct}% off every county of a state when all of them are licensed.
                  </p>
                </>
              ) : (
                <p>Individual license terms are available on request from hello@redplanetdata.com.</p>
              )}

              <h3 className="rpl-h3" id="white-label">White label</h3>
              <p data-licensing="white-label">
                {t?.whiteLabelPrice != null && t?.whiteLabelMinSeats != null ? (
                  <>
                    For larger brokerages, a firm license of {t.whiteLabelMinSeats} or more seats can add white label, for{" "}
                    {usd(t.whiteLabelPrice)} a year: Signal carries the firm&rsquo;s name, logo and color in place of
                    Signal&rsquo;s, on its sign-in page, in the application and in the emails its people receive, at the
                    firm&rsquo;s own address on redplanetdata.com.
                  </>
                ) : (
                  <>
                    For larger brokerages, a firm license can add white label: Signal carries the firm&rsquo;s name, logo
                    and color in place of Signal&rsquo;s, at the firm&rsquo;s own address on redplanetdata.com. Terms are
                    available on request from hello@redplanetdata.com.
                  </>
                )}
              </p>
            </section>

            <section id="terms" className="rpl-section" data-licensing="terms">
              <h2>The standing terms.</h2>
              <div className="rpl-terms">
                <div>
                  <h3 className="rpl-h3">Firm license</h3>
                  <ul>
                    <li>A one-year license to the firm.</li>
                    <li>Paid in advance.</li>
                    <li>The first year is non-refundable.</li>
                    <li>The agreement is signed with Red Planet Data, Inc.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="rpl-h3">Individual license</h3>
                  <ul data-licensing="individual-terms">
                    {(individualTerms.length
                      ? individualTerms
                      : ["A one-year license to the named person.", "Paid in advance.", "The first year is non-refundable.",
                         "The license is not transferable.", "The agreement is signed with Red Planet Data, Inc."]
                    ).map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </section>

            <section id="prices" className="rpl-section">
              <h2>Prices.</h2>
              <p>
                Annual prices for each county, as they stand today. Where a county&rsquo;s price is a range, the higher
                figure counts the record types Red Planet Data obtains by records request. Discounts are applied on a
                quote and are not shown here.
              </p>
              {counties.length ? (
                Object.keys(LICENSING_STATES).map((st) => {
                  const rows = counties.filter((c) => c.state === st);
                  return rows.length ? <PriceList key={st} state={st} counties={rows} /> : null;
                })
              ) : (
                <p>Prices are not available right now. Write to hello@redplanetdata.com and we will send them.</p>
              )}
            </section>

            <section id="quote" className="rpl-section rpl-action">
              <h2>Get a quote.</h2>
              <p>
                For a firm license. Tell us the firm, the counties and how many seats, and Red Planet Data will send a
                written quote with each county as its own line.
              </p>
              <QuoteForm counties={pick} seatsIncluded={t?.seatsIncluded ?? 25} seatBlock={t?.seatBlockSize ?? 25} />
            </section>

            <section id="buy" className="rpl-section rpl-action">
              <h2>Buy an individual license.</h2>
              <p>
                Choose your counties to see the price for one year. Then send the request: the license agreement and an
                invoice follow by email, and access to Signal is turned on when payment clears.
              </p>
              <IndividualBuy counties={pick} />
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
