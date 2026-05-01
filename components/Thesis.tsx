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
                  We built Atlas because nothing out there did this.
                </strong>{" "}
                Figuring out who owns what across jurisdictions, spotting
                patterns across millions of records, connecting signals that
                live in different places — that&apos;s the work. AI does most
                of it now. We use Atlas every day to build our own products.
                Anyone else building something useful is welcome to it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
