import type { Metadata } from "next";
import { ApplyForm } from "@/components/careers/ApplyForm";
import { ContactDialog } from "@/components/ContactDialog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RoleCards, type Role } from "@/components/careers/RoleCards";
import { getAtlasLive } from "@/lib/atlas-live";

export async function generateMetadata(): Promise<Metadata> {
  let recordsText = "Hundreds of millions of";
  let sourcesText = "hundreds of";
  let runnersText = "hundreds of";
  try {
    const data = await getAtlasLive();
    if (data.total_records != null && data.total_records >= 1_000_000) {
      const m = Math.floor(data.total_records / 1_000_000);
      recordsText = `${m}M+`;
    }
    if (data.active_sources > 0) {
      sourcesText = String(data.active_sources);
    }
    if (data.runners_total != null && data.runners_total > 0) {
      runnersText = String(data.runners_total);
    }
  } catch {
    // fall through to placeholders
  }
  const description = `Atlas — the autonomous data engine — holds ${recordsText} verified records across ${sourcesText} active sources, refreshed nightly by ${runnersText} Python runners. Eight products are already built on top of it. We're hiring.`;

  return {
    title: "Careers — Red Planet",
    description,
    alternates: { canonical: "/careers" },
    openGraph: {
      title: "Careers — Red Planet",
      description,
      url: "https://redplanetdata.com/careers",
      siteName: "Red Planet",
      images: [{ url: "/og-image.png", width: 1280, height: 640, alt: "Red Planet" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Careers — Red Planet",
      description,
      images: ["/og-image.png"],
    },
  };
}

// Eight products built on Atlas. Names + one-line descriptions kept in sync
// with what each product actually does today.
const PRODUCTS: Array<{ name: string; oneLiner: string }> = [
  {
    name: "Atlas",
    oneLiner:
      "The autonomous data engine — hundreds of millions of joined property, owner, debt, court, and energy records, refreshing on its own.",
  },
  {
    name: "Atlas Dashboard",
    oneLiner:
      "Operator view of the engine — coverage, signal health, runner status, and findings, in real time.",
  },
  {
    name: "SunScope",
    oneLiner:
      "Installer-facing solar lead intelligence — homes where equity, rates, roof, and incentives all line up.",
  },
  {
    name: "Beacon",
    oneLiner:
      "Community outreach intelligence — households showing distress before the notice arrives, for housing counselors.",
  },
  {
    name: "NYC Office Conversion",
    oneLiner:
      "1,683 Manhattan office buildings scored for residential conversion — zoning, debt, abatement, absorption.",
  },
  {
    name: "BitCense",
    oneLiner:
      "Asset qualification platform for bitcoin-backed lending — leads, asset review, and scoring in one workflow.",
  },
  {
    name: "Capital Qualifier",
    oneLiner:
      "Self-serve capital qualification — surface eligible deals and matched investors from Atlas in minutes.",
  },
  {
    name: "LevelPie",
    oneLiner:
      "Portfolio coverage view — what you own, what you owe, what's at risk, sliced by exposure.",
  },
];

const ROLES: Role[] = [
  {
    slug: "head-of-operations-strategy",
    title: "Head of Operations & Strategy",
    equity: "4–7%",
    summary:
      "Run the business side of Red Planet end-to-end while the engine runs itself. Pricing, partnerships, fundraising, hiring — anything that isn't shipping code. Reports directly to the founder; operates as the partner who turns Atlas into a company.",
    details: (
      <>
        <p>
          <strong>Placeholder copy — finalized JD coming in a separate pass.</strong>
        </p>
        <p>
          You&apos;ll own everything that isn&apos;t engineering. That means
          shaping the commercial story, packaging products into deals, building
          the relationships that turn Atlas into revenue, and making the calls
          on which markets we serve next.
        </p>
        <p>What you&apos;ll likely be doing:</p>
        <ul>
          <li>Lead pricing, packaging, and go-to-market for the eight products on Atlas.</li>
          <li>Run partnerships — installers, counselors, lenders, funds, infrastructure operators.</li>
          <li>Drive the seed raise alongside the founder and own investor relations after.</li>
          <li>Hire the first commercial and operations team once cash is in the bank.</li>
          <li>Set quarterly priorities and make the trade-offs the founder can&apos;t see from inside the engine.</li>
        </ul>
        <p>
          <strong>Compensation:</strong> equity-only pre-raise (4–7%). Cash
          compensation activates at funding close.
        </p>
      </>
    ),
  },
  {
    slug: "head-of-platform",
    title: "Head of Platform",
    equity: "2–3.5%",
    summary:
      "Own Atlas and everything built on top of it. Source coverage, signal quality, the API, the products. Senior engineer who codes daily with Claude and treats AI-native development as the default — not a buzzword.",
    details: (
      <>
        <p>
          <strong>Placeholder copy — finalized JD coming in a separate pass.</strong>
        </p>
        <p>
          You&apos;ll be the technical owner of Atlas and every product on it.
          That means setting the architecture, prioritizing what gets built
          next, and shipping daily alongside Claude. You&apos;re comfortable
          being deeply technical and deeply commercial at the same time — what
          we build is the same conversation as what we sell.
        </p>
        <p>What you&apos;ll likely be doing:</p>
        <ul>
          <li>Run the data pipeline: 500+ Python runners, 800+ sources, nightly refresh.</li>
          <li>Set signal quality standards and ship new composite scores end-to-end.</li>
          <li>Lead AI-native development practice — Claude Code in the loop on every commit.</li>
          <li>Own the API surface and developer experience for everyone building on Atlas.</li>
          <li>Hire and lead the engineering team once cash is in the bank.</li>
        </ul>
        <p>
          <strong>Compensation:</strong> equity-only pre-raise (2–3.5%). Cash
          compensation activates at funding close.
        </p>
      </>
    ),
  },
];

function formatRecords(total: number | null): {
  text: string;
  accent: string;
} {
  if (total == null || total < 1_000_000) {
    return { text: "Over million records", accent: "Hundreds" };
  }
  const millions = Math.floor(total / 1_000_000);
  return { text: " million records", accent: `${millions}` };
}

export default async function CareersPage() {
  let totalRecords: number | null = null;
  let activeSources: number | null = null;
  let runnersTotal: number | null = null;
  try {
    const data = await getAtlasLive();
    totalRecords = data.total_records;
    activeSources = data.active_sources > 0 ? data.active_sources : null;
    runnersTotal = data.runners_total;
  } catch {
    // fall through to placeholders
  }

  const recs = formatRecords(totalRecords);
  const sourcesText =
    activeSources != null
      ? new Intl.NumberFormat("en-US").format(activeSources)
      : "—";
  const runnersText =
    runnersTotal != null
      ? new Intl.NumberFormat("en-US").format(runnersTotal)
      : "Hundreds of";

  return (
    <>
      <Header />
      <main>
        {/* 1. HERO */}
        <section className="careers-hero">
          <svg
            className="careers-hero-svg"
            viewBox="0 0 1600 700"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="careers-grid"
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
            <rect width="1600" height="700" fill="url(#careers-grid)" />
            <g stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none">
              <path d="M 0 180 Q 200 160, 400 200 T 800 180 T 1200 220 T 1600 200" />
              <path d="M 0 360 Q 200 340, 400 380 T 800 360 T 1200 400 T 1600 380" />
              <path d="M 0 540 Q 200 520, 400 560 T 800 540 T 1200 580 T 1600 560" />
            </g>
          </svg>
          <div className="careers-hero-vignette" />

          <div className="container careers-hero-content">
            <div
              className="eyebrow reveal reveal-1"
              style={{ marginBottom: 28 }}
            >
              Red Planet · Careers
            </div>
            <h1 className="reveal reveal-2">
              Building the data infrastructure layer for{" "}
              <span className="accent">real estate</span>,{" "}
              <span className="accent-2">finance</span>, energy, and the
              industries connected to them.
            </h1>

            <div className="careers-hero-stats reveal reveal-3">
              <div className="careers-stat">
                <span className="careers-stat-value">
                  <span className="accent">{recs.accent}</span>
                  {recs.text}
                </span>
                <span className="careers-stat-label">Verified, joined</span>
              </div>
              <div className="careers-stat">
                <span className="careers-stat-value">
                  <span className="accent">{sourcesText}</span> active sources
                </span>
                <span className="careers-stat-label">Refreshing nightly</span>
              </div>
              <div className="careers-stat">
                <span className="careers-stat-value">
                  <span className="accent-2">{runnersText}</span> autonomous runners
                </span>
                <span className="careers-stat-label">Self-correcting</span>
              </div>
            </div>

            <p className="careers-hero-sub reveal reveal-3">
              Atlas — the autonomous data engine — runs on its own and gets
              better every night. Eight products are already built on top of
              it. We&apos;re hiring two people to help turn it into a company.
            </p>

            <div className="hero-actions reveal reveal-4">
              <a href="#roles" className="btn-primary">
                See open roles
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M9 1L13 5L9 9M13 5H1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              <a href="#substance" className="btn-text">
                What&apos;s actually here
              </a>
            </div>
          </div>
        </section>

        {/* 2. SUBSTANCE */}
        <section className="careers-section" id="substance">
          <div className="container">
            <div className="careers-section-header">
              <div className="careers-section-eyebrow">§ 01 — The platform</div>
              <h2>
                What&apos;s <span className="accent">actually here</span>.
              </h2>
              <p className="careers-section-lede">
                Two things matter when you&apos;re considering a small company:
                whether the thing being built is real, and whether you can
                verify it for yourself. Both are true here.
              </p>
            </div>

            <div className="careers-substance-body">
              <div>
                <p>
                  <strong>Atlas is the autonomous data engine.</strong> It pulls
                  property, ownership, debt, court, entity, and energy data
                  from {sourcesText !== "—" ? sourcesText : "hundreds of"}{" "}
                  jurisdictions and national datasets, normalizes it, and joins
                  it into a single coherent asset. Over 500 Python runners
                  ingest and refresh nightly. When a source breaks, the engine
                  detects it and self-heals. When new data appears, it gets
                  added.
                </p>
                <p>
                  What that engine powers, today, is eight products serving
                  installers, housing counselors, developers, lenders, and
                  funds. Each one would have taken a legacy data company months
                  to build. Each one was shipped on Atlas in days.
                </p>
              </div>
              <div>
                <p>
                  <strong>You can verify both before applying.</strong> The
                  documentation is public at{" "}
                  <a
                    href="https://docs.redplanetdata.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    docs.redplanetdata.com
                  </a>{" "}
                  — the full platform thesis, data model, signal architecture,
                  and roadmap.
                </p>
                <p>
                  The Atlas API is live at{" "}
                  <a
                    href="https://api.redplanetdata.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    api.redplanetdata.com
                  </a>{" "}
                  — the engine itself, exposed. Hit the public endpoints and
                  see real records come back. The numbers in this page are read
                  directly from Atlas; nothing is hardcoded.
                </p>
              </div>
              <div className="callout">
                <strong>Both are live.</strong> Look around before applying.
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRODUCTS GRID */}
        <section className="careers-section alt" id="products">
          <div className="container">
            <div className="careers-section-header">
              <div className="careers-section-eyebrow">§ 02 — The portfolio</div>
              <h2>
                Eight products built on <span className="accent">Atlas</span>.
              </h2>
              <p className="careers-section-lede">
                Each one runs against the same underlying data asset. Each one
                ships faster than the one before it. That&apos;s the platform
                model in practice.
              </p>
            </div>
            <div className="products-grid">
              {PRODUCTS.map((p, i) => (
                <article key={p.name} className="product-card">
                  <span className="product-card-tag">
                    {String(i + 1).padStart(2, "0")} /{" "}
                    {i === 0 ? "Platform" : "Built on Atlas"}
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.oneLiner}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. WHY THIS IS DIFFERENT */}
        <section className="careers-why" id="why">
          <div className="container">
            <div className="careers-section-header">
              <div className="careers-section-eyebrow">§ 03 — Why this is different</div>
              <h2>
                Why this isn&apos;t another{" "}
                <span className="accent">AI startup post</span>.
              </h2>
            </div>
            <div className="careers-why-grid">
              <p>
                The market is saturated with equity-only AI startup posts. Most
                of them are a thin wrapper around someone else&apos;s LLM, a
                deck, and a hope. This isn&apos;t that. Atlas is real,
                operating data infrastructure with hundreds of millions of
                joined records and a public API you can hit right now. The
                products on top of it have real users. The thing being asked of
                you is to help turn a working system into a real company —
                not to help build something that might exist if the round
                closes.
              </p>
              <p>
                The capital efficiency story is unusual. <strong>Atlas
                itself was built in three months for under $2,500</strong> of
                infrastructure and tooling — because AI-native development
                changes what one person can ship. The equivalent build at a
                traditional data firm is <strong>$2.4M–$4.2M</strong> in
                payroll, infrastructure, and time. We are not raising to build.
                We are raising to grow what already runs.
              </p>
            </div>
            <div className="careers-why-numbers">
              <div className="stat">
                <div className="stat-number">
                  <span className="accent">3 months</span>
                </div>
                <div className="stat-label">to build Atlas from scratch.</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  &lt;<span className="accent">$2,500</span>
                </div>
                <div className="stat-label">total infrastructure cost to date.</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  <span className="accent-2">$2.4M–$4.2M</span>
                </div>
                <div className="stat-label">traditional firm equivalent.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. OPEN ROLES */}
        <section className="careers-section" id="roles">
          <div className="container">
            <div className="careers-section-header">
              <div className="careers-section-eyebrow">§ 04 — Hiring</div>
              <h2>
                Open <span className="accent">roles</span>.
              </h2>
              <p className="careers-section-lede">
                Two roles, both reporting to the founder. Both are equity-only
                today; cash compensation activates at funding close. Both are
                remote-first.
              </p>
            </div>
            <RoleCards roles={ROLES} />
          </div>
        </section>

        {/* 6. HOW WE WORK */}
        <section className="careers-section alt" id="how">
          <div className="container">
            <div className="careers-section-header">
              <div className="careers-section-eyebrow">§ 05 — How we work</div>
              <h2>
                How we <span className="accent">work</span>.
              </h2>
            </div>
            <div className="how-blocks">
              <div className="how-block">
                <div className="how-block-num">01 / AI-native</div>
                <h3>Claude is core to how we ship.</h3>
                <p>
                  Every meaningful change to Atlas, the products, and the
                  marketing site goes through Claude Code. It isn&apos;t a
                  productivity hack — it&apos;s the reason a one-person team
                  ships eight products. You&apos;ll use it daily.
                </p>
              </div>
              <div className="how-block">
                <div className="how-block-num">02 / Remote-first</div>
                <h3>Wherever you do your best work.</h3>
                <p>
                  No office, no commute, no theater. We move on async writing
                  and short, deliberate calls. Time-zone overlap with U.S.
                  East Coast for a few hours a day is enough.
                </p>
              </div>
              <div className="how-block">
                <div className="how-block-num">03 / Small team</div>
                <h3>Solo founder, building the first team.</h3>
                <p>
                  Today it&apos;s one person plus the engine. The two roles on
                  this page are the first hires. You&apos;ll have direct
                  ownership of an entire function from day one, with the
                  responsibility that comes with it.
                </p>
              </div>
              <div className="how-block">
                <div className="how-block-num">04 / Equity now, cash later</div>
                <h3>Equity-only pre-raise. Cash at close.</h3>
                <p>
                  Compensation is meaningful equity today, with cash
                  compensation activating the day the seed round closes. The
                  raise is in motion. Equity ranges per role are listed above.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. APPLY */}
        <section className="apply-section" id="apply">
          <div className="container">
            <div className="careers-section-header">
              <div className="careers-section-eyebrow">§ 06 — Apply</div>
              <h2>
                <span className="accent">Apply</span>.
              </h2>
              <p className="careers-section-lede">
                One form, read personally, every time. We reply to every
                application.
              </p>
            </div>
            <div className="apply-grid">
              <ApplyForm />
              <aside className="apply-aside">
                <div className="apply-aside-block">
                  <h4>Or book a call directly</h4>
                  <a
                    href="https://calendly.com/redplanetdata/careers"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Schedule a 30-min call
                  </a>
                  <p>
                    Calendly link — placeholder until the live booking page is
                    wired up.
                  </p>
                </div>
                <div className="apply-aside-block">
                  <h4>Or apply via LinkedIn</h4>
                  <a
                    href="https://www.linkedin.com/jobs/redplanet-ops"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Operations &amp; Strategy
                  </a>
                  <a
                    href="https://www.linkedin.com/jobs/redplanet-platform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Platform
                  </a>
                  <p>
                    LinkedIn job postings — placeholders until the listings
                    are published.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ContactDialog />
    </>
  );
}
