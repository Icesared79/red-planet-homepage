import { ContactTrigger } from "./ContactTrigger";
import { SectionLabel } from "./SectionLabel";

export function CTA() {
  return (
    <section className="cta" id="cta">
      <svg
        className="cta-bg"
        viewBox="0 0 1600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="ctaGlow" cx="70%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(216, 57, 47, 0.18)" />
            <stop offset="100%" stopColor="rgba(216, 57, 47, 0)" />
          </radialGradient>
          <radialGradient id="ctaGlow2" cx="20%" cy="80%" r="40%">
            <stop offset="0%" stopColor="rgba(196, 166, 97, 0.12)" />
            <stop offset="100%" stopColor="rgba(196, 166, 97, 0)" />
          </radialGradient>
          <pattern
            id="ctagrid"
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
        </defs>
        <rect width="1600" height="600" fill="url(#ctagrid)" />
        <circle cx="1200" cy="300" r="400" fill="url(#ctaGlow)" />
        <circle cx="320" cy="480" r="300" fill="url(#ctaGlow2)" />
      </svg>
      <div className="container cta-content">
        <div className="section-grid">
          <SectionLabel title="§ 06 — Get in touch" num="06" variant="dark" />
          <div className="section-body">
            <h2>
              Built for operators shaping what&apos;s{" "}
              <span className="accent">next.</span>
            </h2>
            <p className="cta-body">
              Atlas isn&apos;t off-the-shelf data. We work directly with the
              operators reshaping how property intelligence gets used — funds,
              lenders, counselors, installers, conversion shops.
            </p>
            <div className="cta-actions">
              <ContactTrigger className="btn-primary">
                Start the conversation
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M9 1L13 5L9 9M13 5H1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </ContactTrigger>
            </div>
            <p className="cta-footnote">
              We don&apos;t sell off-the-shelf data. We work directly with
              operators who need an edge — tell us what you&apos;re working on
              and we&apos;ll show you what Atlas can find.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
