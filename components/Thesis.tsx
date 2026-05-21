import { SectionLabel } from "./SectionLabel";

export function Thesis() {
  return (
    <section className="thesis" id="thesis">
      <div className="container">
        <div className="section-grid">
          <SectionLabel title="§ 01 — About" num="01" />
          <div className="thesis-body">
            <h2>
              Why we&apos;re building <span className="accent">Atlas.</span>
            </h2>
            <div className="thesis-text">
              <p>
                Red Planet built Atlas because the data real estate runs on
                doesn&apos;t go deep enough. Records go stale.
                Filings are scattered across thousands of jurisdictions.
                Ownership chains take a week to map by hand. The patterns that
                actually move deals — distress before it surfaces, ownership
                shifts before they&apos;re public, signals that compound across
                data layers — get lost in the noise.
              </p>
              <p>
                <strong>We built Atlas to find them.</strong> An agent-driven
                foundation. Continuous data work — property records, ownership,
                court activity, debt, signals — pulled from hundreds of sources
                across the country, then connected in ways the rest of the
                industry can&apos;t. We use Atlas every day to close our own
                work. Other operators use it to close theirs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
