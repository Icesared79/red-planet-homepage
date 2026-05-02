export function Hero() {
  return (
    <section className="hero">
      <svg
        className="hero-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="grid-major"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 240 0 L 0 0 0 240"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.7"
            />
          </pattern>
          <radialGradient id="hotspot1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(216, 57, 47, 0.4)" />
            <stop offset="100%" stopColor="rgba(216, 57, 47, 0)" />
          </radialGradient>
          <radialGradient id="hotspot2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(196, 166, 97, 0.25)" />
            <stop offset="100%" stopColor="rgba(196, 166, 97, 0)" />
          </radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#grid)" />
        <rect width="1600" height="900" fill="url(#grid-major)" />

        <g stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none">
          <path d="M 0 200 Q 200 180, 400 220 T 800 200 T 1200 240 T 1600 220" />
          <path d="M 0 280 Q 220 260, 420 300 T 820 290 T 1220 320 T 1600 300" />
          <path d="M 0 380 Q 240 360, 440 400 T 840 380 T 1240 410 T 1600 390" />
          <path d="M 0 480 Q 260 470, 460 500 T 860 490 T 1260 510 T 1600 490" />
          <path d="M 0 600 Q 280 580, 480 620 T 880 600 T 1280 630 T 1600 610" />
          <path d="M 0 720 Q 200 700, 400 740 T 800 720 T 1200 750 T 1600 730" />
        </g>

        <circle cx="1180" cy="380" r="260" fill="url(#hotspot1)" />
        <circle cx="380" cy="620" r="200" fill="url(#hotspot2)" />

        <g fill="rgba(255,255,255,0.35)">
          <circle cx="1100" cy="300" r="1.5" />
          <circle cx="1140" cy="320" r="1.5" />
          <circle cx="1180" cy="340" r="1.5" />
          <circle cx="1220" cy="360" r="1.5" />
          <circle cx="1080" cy="340" r="1.5" />
          <circle cx="1120" cy="360" r="1.5" />
          <circle cx="1160" cy="380" r="1.5" />
          <circle cx="1200" cy="400" r="1.5" />
          <circle cx="1240" cy="420" r="1.5" />
          <circle cx="1060" cy="380" r="1.5" />
          <circle cx="1100" cy="400" r="1.5" />
          <circle cx="1140" cy="420" r="1.5" />
          <circle cx="1180" cy="440" r="1.5" />
          <circle cx="1220" cy="460" r="1.5" />
          <circle cx="1260" cy="480" r="1.5" />

          <circle cx="280" cy="540" r="1.5" />
          <circle cx="320" cy="560" r="1.5" />
          <circle cx="360" cy="580" r="1.5" />
          <circle cx="400" cy="600" r="1.5" />
          <circle cx="260" cy="580" r="1.5" />
          <circle cx="300" cy="600" r="1.5" />
          <circle cx="340" cy="620" r="1.5" />
          <circle cx="380" cy="640" r="1.5" />
          <circle cx="420" cy="660" r="1.5" />
          <circle cx="240" cy="620" r="1.5" />
          <circle cx="280" cy="640" r="1.5" />
          <circle cx="320" cy="660" r="1.5" />

          <circle cx="600" cy="200" r="1" />
          <circle cx="800" cy="250" r="1" />
          <circle cx="900" cy="180" r="1" />
          <circle cx="500" cy="350" r="1" />
          <circle cx="700" cy="450" r="1" />
          <circle cx="850" cy="500" r="1" />
          <circle cx="950" cy="600" r="1" />
          <circle cx="1050" cy="700" r="1" />
          <circle cx="650" cy="650" r="1" />
          <circle cx="450" cy="450" r="1" />
          <circle cx="750" cy="350" r="1" />
          <circle cx="350" cy="280" r="1" />
          <circle cx="1300" cy="600" r="1" />
          <circle cx="1400" cy="500" r="1" />
          <circle cx="200" cy="400" r="1" />
        </g>

        <g>
          <circle className="signal-pulse" cx="1180" cy="380" r="4" fill="#D8392F" />
          <circle
            className="signal-pulse"
            cx="1180"
            cy="380"
            r="11"
            fill="rgba(216,57,47,0.3)"
          />

          <circle
            className="signal-pulse signal-pulse-2"
            cx="380"
            cy="620"
            r="4"
            fill="#C4A661"
          />
          <circle
            className="signal-pulse signal-pulse-2"
            cx="380"
            cy="620"
            r="11"
            fill="rgba(196,166,97,0.3)"
          />

          <circle
            className="signal-pulse signal-pulse-3"
            cx="850"
            cy="500"
            r="3"
            fill="#D8392F"
          />
          <circle
            className="signal-pulse signal-pulse-3"
            cx="850"
            cy="500"
            r="9"
            fill="rgba(216,57,47,0.3)"
          />

          <circle
            className="signal-pulse signal-pulse-4"
            cx="650"
            cy="650"
            r="3"
            fill="#C4A661"
          />
          <circle
            className="signal-pulse signal-pulse-4"
            cx="650"
            cy="650"
            r="9"
            fill="rgba(196,166,97,0.3)"
          />
        </g>

        <g
          stroke="rgba(216,57,47,0.18)"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="3 4"
        >
          <line x1="1180" y1="380" x2="850" y2="500" />
          <line x1="850" y1="500" x2="650" y2="650" />
          <line x1="650" y1="650" x2="380" y2="620" />
          <line x1="380" y1="620" x2="850" y2="500" />
        </g>

        <g
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="rgba(255,255,255,0.25)"
        >
          <text x="40" y="40">41.7658°N</text>
          <text x="40" y="56">72.6734°W</text>
          <text x="1480" y="40" textAnchor="end">N · 0001</text>
          <text x="1480" y="860" textAnchor="end">869 sources</text>
          <text x="40" y="860">→ ingestion</text>
        </g>
      </svg>

      <div className="hero-vignette" />

      <div className="container hero-content">
        <div className="hero-grid">
          <div>
            <div className="eyebrow reveal reveal-1">Property intelligence</div>
            <h1 className="reveal reveal-2">
              <span className="line">Property data,</span>
              <span className="line">
                connected by <span className="accent">AI.</span>
              </span>
            </h1>
            <p className="hero-sub reveal reveal-3">
              Atlas finds patterns in real estate that were unfindable until
              now. A self-building data foundation tuned to the deals
              you&apos;re trying to close.
            </p>
            <div className="hero-actions reveal reveal-4">
              <a href="#cta" className="btn-primary">
                Build on Atlas
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M9 1L13 5L9 9M13 5H1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              <a href="#thesis" className="btn-text">
                Why we&apos;re building this
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
