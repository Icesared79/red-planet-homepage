import {
  getAtlasLive,
  type Category,
  type LiveEvent,
  type RecentFinding,
} from "@/lib/atlas-live";

const CATEGORY_LABEL: Record<Category, string> = {
  court: "court",
  property: "property",
  entity: "entity",
  distress: "distress",
  tax: "tax",
  energy: "energy",
  ownership: "ownership",
};

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 6) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return "earlier today";
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

const STATIC_COVERAGE_LABELS = [
  "Real estate",
  "Solar",
  "Distress",
  "Outreach",
  "Energy",
];

export async function RecentFindings() {
  let events: LiveEvent[] = [];
  let findings: RecentFinding[] = [];
  let lastUpdated: string | null = null;
  try {
    const data = await getAtlasLive();
    events = data.recent_events;
    findings = data.recent_findings ?? [];
    lastUpdated = data.last_updated;
  } catch {
    /* fall through */
  }

  const realEstateFindings = findings.filter((f) => f.category === "real_estate");
  const solarFindings = findings.filter((f) => f.category === "solar");
  const showStaticFallback = findings.length === 0;

  return (
    <section className="findings" id="findings">
      <div className="container">
        <div className="findings-header">
          <div className="eyebrow on-light">§ 04 — Activity</div>
          <h2>
            What Atlas <span className="accent">found this week.</span>
          </h2>
          <p>Recent ingestion activity from the engine, filtered to events that move deals.</p>
        </div>

        <div className="findings-grid">
          <div className="findings-feed">
            <div className="findings-feed-bar">
              <span className="findings-feed-dot" aria-hidden="true" />
              <span className="findings-feed-title">ATLAS · RECENT FINDINGS</span>
            </div>
            <div className="findings-feed-rows">
              {events.length === 0 && (
                <div className="findings-row findings-row-empty">
                  No recent events match the current filter. Check back tomorrow.
                </div>
              )}
              {events.map((ev, i) => {
                const isFresh = i === 0;
                return (
                  <div
                    key={`${ev.timestamp}-${i}`}
                    className={`findings-row${isFresh ? " findings-row-fresh" : ""}`}
                  >
                    <span
                      className={`findings-cat findings-cat-${ev.category}`}
                      aria-label={CATEGORY_LABEL[ev.category]}
                      title={CATEGORY_LABEL[ev.category]}
                    />
                    <span className="findings-jur" title={ev.jurisdiction}>
                      {ev.jurisdiction}
                    </span>
                    <span className="findings-evt">{ev.event_type}</span>
                    <span className="findings-delta">+{formatCount(ev.count)}</span>
                    <span className="findings-rel">{relativeTime(ev.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="findings-summary">
            <div className="findings-summary-bar">
              <span className="findings-summary-title">ATLAS · RECENT FINDINGS</span>
            </div>
            <div className="findings-summary-body">
              {showStaticFallback ? (
                <div className="findings-summary-group">
                  <div className="findings-summary-group-label">Coverage</div>
                  {STATIC_COVERAGE_LABELS.map((l) => (
                    <div key={l} className="findings-summary-line findings-summary-line-static">
                      {l}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {realEstateFindings.length > 0 && (
                    <div className="findings-summary-group">
                      <div className="findings-summary-group-label">Real estate</div>
                      {realEstateFindings.map((f, i) => (
                        <div key={`re-${i}`} className="findings-summary-line">
                          <span className="findings-summary-count">
                            {formatCount(f.count)}
                          </span>{" "}
                          <span className="findings-summary-label">
                            {f.label} {f.scope}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {solarFindings.length > 0 && (
                    <div className="findings-summary-group">
                      <div className="findings-summary-group-label">Solar</div>
                      {solarFindings.map((f, i) => (
                        <div key={`solar-${i}`} className="findings-summary-line">
                          <span className="findings-summary-count">
                            {formatCount(f.count)}
                          </span>{" "}
                          <span className="findings-summary-label">
                            {f.label} {f.scope}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="findings-summary-foot">
              Updated {relativeTime(lastUpdated)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
