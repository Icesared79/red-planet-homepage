export function Foundation() {
  return (
    <section className="foundation" id="foundation">
      <svg
        className="foundation-bg"
        viewBox="0 0 1600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="fgrid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="1600" height="600" fill="url(#fgrid)" />
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none">
          <path d="M 0 150 Q 200 130, 400 170 T 800 150 T 1200 190 T 1600 170" />
          <path d="M 0 300 Q 200 280, 400 320 T 800 300 T 1200 340 T 1600 320" />
          <path d="M 0 450 Q 200 430, 400 470 T 800 450 T 1200 490 T 1600 470" />
        </g>
      </svg>
      <div className="container foundation-content">
        <div className="foundation-header">
          <div className="eyebrow">§ 03 — The engine</div>
          <h2>
            Atlas, in <span className="accent-2">numbers.</span>
          </h2>
          <p>What&apos;s underneath.</p>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat-number">
              <span className="accent">Hundreds</span>
              <br />
              of millions
            </div>
            <div className="stat-label">
              Records on properties, owners, debt, courts, and energy.
              Connected, not just collected.
            </div>
          </div>
          <div className="stat">
            <div className="stat-number">
              869
              <br />
              <span className="accent-2">sources</span>
            </div>
            <div className="stat-label">
              National datasets, jurisdictional filings, and the signals that
              surround them. Growing every week.
            </div>
          </div>
          <div className="stat">
            <div className="stat-number">
              566
              <br />
              <span className="accent-2">runners</span>
            </div>
            <div className="stat-label">
              Self-healing pipeline. When a source breaks, the system fixes it
              on its own.
            </div>
          </div>
          <div className="stat">
            <div className="stat-number">
              Always
              <br />
              <span className="accent">on</span>
            </div>
            <div className="stat-label">
              Atlas grows on its own. When a source breaks, it fixes itself.
              When new data appears, it gets added. The foundation gets
              stronger every night.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
