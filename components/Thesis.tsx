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
                Real estate data has been bad for a long time. Records go stale
                before you can buy them. Court filings live in thousands of
                jurisdictional portals. Entity chains take a week to map by
                hand.
              </p>
              <p>
                <strong>
                  Atlas is what we built when we couldn&apos;t find a foundation
                  that solved this.
                </strong>{" "}
                The hard parts — entity resolution across jurisdictions, signal
                compounding across data layers, pattern detection across
                millions of records — are handled by AI. We use Atlas to build
                our own products. We make it available to others building
                theirs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
