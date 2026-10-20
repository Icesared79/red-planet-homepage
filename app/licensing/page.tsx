import type { Metadata } from "next";
import { Store, type StoreCounty, type StoreTerms } from "@/components/licensing/Store";
import { LICENSING_REVALIDATE, loadLicensing } from "@/lib/licensing";
import Link from "next/link";
import "./licensing.css";

// COUNTY-4.2 (2026-10-18): residential county licensing for Connecticut and Florida.
// COUNTY-8 (2026-10-19): drawn in the design of the shared Signal license page (atlas-dash LicenseView.tsx, LICENSE-3).
// COUNTY-9 (2026-10-20): operator ruling -- the page is a store, the way people shop for and buy software, not a
// reference document: a one-sentence header with one screenshot, three options in the usual pricing-card form, the
// picker with one "Request this license" button under the total, and a short questions section, closed by default
// (all drawn by components/licensing/Store.tsx).
// COUNTY-9.1 (2026-10-20): every figure is read from the residential pricing table (lib/licensing.ts pricingTable);
// the header, the Individual and Firm cards and the first question name only the filing types held in the state being
// viewed; Florida offers only counties with current foreclosure filings, the rest on request.
//
// NOT LINKED FROM ANYWHERE on the site, and not indexed: it is reachable only by its address until the operator
// links it. This file holds no figure of its own.

export const revalidate = LICENSING_REVALIDATE;

export const metadata: Metadata = {
  title: "Licensing | Red Planet Data",
  description: "Signal for Connecticut and Florida, licensed by the county for one person or a whole firm.",
  robots: { index: false, follow: false },
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
        individualPct: t.individualPct,
        individualFloor: t.individualFloor,
        brandingPrice: t.whiteLabelPrice,
        brandingMinPeople: t.whiteLabelMinSeats,
      }
    : null;

  return (
    <div className="lp" data-licensing="page">
      <div className="lp-col">
        <header className="lp-top">
          <Link className="lp-brand" href="/"><Mark id="lp-mark-top" size={24} /><span className="lp-brand__name">Red Planet Data</span></Link>
          <span className="lp-label">Signal licensing</span>
        </header>

        <main className="lp-doc" id="top">
          {data && terms && counties.length ? (
            <Store counties={counties} terms={terms} from={from} held={data.held} onRequest={data.onRequest} />
          ) : (
            <>
              <section className="lp-card lp-card--dark lp-hero" data-licensing="summary">
                <h1 className="lp-h1" data-licensing="headline">Signal shows your agents new filings in the counties you license, with the owner&rsquo;s contact details.</h1>
              </section>
              <section className="lp-card" data-licensing="prices-unavailable">
                <p className="lp-text">Prices are not available right now. Write to hello@redplanetdata.com and we will send them.</p>
              </section>
            </>
          )}
        </main>

        <footer className="lp-foot">
          <span>{ISSUER}</span>
          <a href="mailto:hello@redplanetdata.com">hello@redplanetdata.com</a>
        </footer>
      </div>
    </div>
  );
}
