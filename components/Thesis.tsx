export function Thesis() {
  return (
    <section className="thesis" id="thesis">
      <div className="container">
        <div className="thesis-grid">
          <div className="thesis-label">
            <div className="thesis-label-title">§ 01 — About</div>
            <div className="thesis-label-num">
              01<span className="dot">.</span>
            </div>
          </div>
          <div className="thesis-body">
            <h2>
              Why we&apos;re building <span className="accent">Atlas.</span>
            </h2>
            <div className="thesis-text">
              <p>
                Real estate data has always been shallow. Records go stale.
                Filings are scattered across thousands of jurisdictions.
                Ownership chains take a week to map by hand. The patterns that
                actually move deals — distress before it surfaces, ownership
                shifts before they&apos;re public, signals that compound across
                data layers — get lost in the noise.
              </p>
              <p>
                <strong>We built Atlas to find them.</strong> A self-building
                foundation that pulls property records, ownership, court
                activity, debt, and signals from hundreds of sources, then
                connects them in ways the rest of the industry can&apos;t. We
                use Atlas every day to close our own work. Other operators use
                it to close theirs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
