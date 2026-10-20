import type { Metadata } from "next";
import { Store, type StoreCounty, type StoreTerms } from "@/components/licensing/Store";
import { LICENSING_REVALIDATE, loadLicensing, usd } from "@/lib/licensing";
import Link from "next/link";
import "./licensing.css";

// COUNTY-4.2 (2026-10-18): residential county licensing for Connecticut and Florida.
// COUNTY-8 (2026-10-19): drawn in the design of the shared Signal license page (atlas-dash LicenseView.tsx, LICENSE-3).
// COUNTY-9 (2026-10-20): operator ruling -- the page is a store, the way people shop for and buy software, not a
// reference document. In order: a one-sentence header with one screenshot; three options in the usual pricing-card
// form (Individual, Firm, Firm with your branding), each "from" the lowest county price; the picker (state, counties by
// map or by town or county name, Individual or Firm and how many people, each county's line with its price and its
// current 90-day filing counts, the live total with discounts as their own lines) and one "Request this license"
// button under the total (components/licensing/Store.tsx); then a short questions section, closed by default. The two
// county tables and every per-county paragraph are gone.
//
// NOT LINKED FROM ANYWHERE on the site, and not indexed: it is reachable only by its address until the operator
// links it. Every price, discount, seat term and count is read live from the County Catalog (lib/licensing.ts); this
// file holds the words around them and no figure of its own. A filing count shows only while its as-of date is within
// the last 14 days (lib/licensing.ts COUNT_FRESH_DAYS).

export const revalidate = LICENSING_REVALIDATE;

export const metadata: Metadata = {
  title: "Licensing | Red Planet Data",
  description: "Signal for Connecticut and Florida, licensed by the county for one person or a whole firm.",
  robots: { index: false, follow: false },
};

const SHOT = {
  src: "/licensing/signal-screenshot.png",
  alt: "Signal showing new filings in Connecticut: the list of filings on the left, the map in the middle, and a property with the owner's contact details on the right",
  w: 1680,
  h: 983,
};
const ISSUER = "Red Planet Data, Inc.";

function Mark({ id, size }: { id: string; size: number }) {
  return (
    <svg className="lp-mark" width={size} height={size} viewBox="0 0 28 28" role="img" aria-label="Red Planet Data mark">
      <defs><clipPath id={id}><circle cx="14" cy="14" r="14" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect className="lp-mark__sun" x="0" y="0" width="28" height="14" />
        {[15, 18.6, 22.2, 25.8].map((y) => <rect key={y} className="lp-mark__line" x="0" y={y} width="28" height="2.4" />)}
      </g>
    </svg>
  );
}

export default async function LicensingPage() {
  const data = await loadLicensing();
  const t = data?.terms;
  const counties: StoreCounty[] = (data?.counties ?? []).map((c) => ({
    fips: c.fips,
    state: c.state,
    name: c.shortName,
    individualLow: c.individualLow,
    individualHigh: c.individualHigh,
    firmLow: c.firmLow,
    firmHigh: c.firmHigh,
    foreclosure90: c.foreclosure90,
    probate90: c.probate90,
  }));
  const min = (xs: number[]) => (xs.length ? Math.min(...xs) : null);
  const from = {
    individual: min(counties.map((c) => c.individualLow).filter((v) => v > 0)),
    firm: min(counties.map((c) => c.firmLow).filter((v) => v > 0)),
  };
  const terms: StoreTerms | null = t
    ? {
        seatsIncluded: t.seatsIncluded,
        seatStep: t.seatBlockSize,
        seatStepPct: t.seatBlockPct,
        bundleMinCounties: t.bundleMinCounties,
        bundleDiscountPct: t.bundleDiscountPct,
        stateDiscountPct: t.stateDiscountPct,
        brandingPrice: t.whiteLabelPrice,
        brandingMinPeople: t.whiteLabelMinSeats,
      }
    : null;

  const questions: Array<[string, string]> = [
    [
      "What is included in a county?",
      "Signal shows the new foreclosure and probate filings Red Planet Data collects in that county, each on a list and a map with the property's owner and their phone, email and mailing address. It also includes the county's homes, who owns them and their recorded sales. What is collected differs a little from county to county, and your agreement lists it for each county you choose.",
    ],
    [
      "What happens if we need more people?",
      t
        ? `A firm license includes ${t.seatsIncluded} people in every county you choose. You can add people ${t.seatBlockSize} at a time, and each ${t.seatBlockSize} more adds ${t.seatBlockPct}% of that county's yearly price. Write to us and we will send an updated agreement and invoice.`
        : "A firm license includes a set number of people in every county you choose, and you can add more. Write to us and we will send an updated agreement and invoice.",
    ],
    [
      "Can we add counties later?",
      t
        ? `Yes. Tell us which counties you want to add and we will send an updated agreement and invoice at the prices on this page. With ${t.bundleMinCounties} or more counties the price drops by ${t.bundleDiscountPct}%, and with every county in a state it drops by ${t.stateDiscountPct}%.`
        : "Yes. Tell us which counties you want to add and we will send an updated agreement and invoice at the prices on this page.",
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
      t?.whiteLabelPrice != null && t?.whiteLabelMinSeats != null
        ? `For firms of ${t.whiteLabelMinSeats} or more people, Signal can appear under your firm's own name and logo, on the sign-in page, inside the application and in the emails your people get. It costs ${usd(t.whiteLabelPrice)} a year on top of the firm license.`
        : "Signal can appear under your firm's own name and logo, on the sign-in page, inside the application and in the emails your people get. Write to us for the price.",
    ],
  ];

  return (
    <div className="lp" data-licensing="page">
      <div className="lp-col">
        <header className="lp-top">
          <Link className="lp-brand" href="/"><Mark id="lp-mark-top" size={24} /><span className="lp-brand__name">Red Planet Data</span></Link>
          <span className="lp-label">Signal licensing</span>
        </header>

        <main className="lp-doc" id="top">
          <section className="lp-card lp-card--dark lp-hero" data-licensing="summary">
            <h1 className="lp-h1" data-licensing="headline">
              Signal shows your agents every new foreclosure and probate filing in the counties you license, with the owner&rsquo;s contact details.
            </h1>
            <figure className="lp-shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SHOT.src} alt={SHOT.alt} width={SHOT.w} height={SHOT.h} data-licensing="signal-shot" />
            </figure>
          </section>

          {terms && counties.length ? (
            <Store counties={counties} terms={terms} from={from} />
          ) : (
            <section className="lp-card" data-licensing="prices-unavailable">
              <p className="lp-text">Prices are not available right now. Write to hello@redplanetdata.com and we will send them.</p>
            </section>
          )}

          <section className="lp-card" aria-labelledby="lp-faq" data-licensing="questions">
            <h2 className="lp-eyebrow" id="lp-faq">Questions</h2>
            <div className="lp-faq">
              {questions.map(([q, a]) => (
                <details key={q} className="lp-faq__item" data-licensing="question">
                  <summary className="lp-faq__q">{q}</summary>
                  <p className="lp-faq__a">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </main>

        <footer className="lp-foot">
          <span>{ISSUER}</span>
          <a href="mailto:hello@redplanetdata.com">hello@redplanetdata.com</a>
        </footer>
      </div>
    </div>
  );
}
