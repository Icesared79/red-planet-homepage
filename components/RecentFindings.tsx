import { getAtlasLive, type Category, type LiveEvent } from "@/lib/atlas-live";

const CATEGORY_LABEL: Record<Category, string> = {
  court: "court",
  property: "property",
  entity: "entity",
  distress: "distress",
  tax: "tax",
  energy: "energy",
  ownership: "ownership",
};

// US tile-grid map. Each state placed at [row, col] in a 12-col × 8-row grid
// to form a recognizable US silhouette without using a real geo map library.
const STATE_GRID: Record<string, [number, number]> = {
  AK: [1, 1],
  ME: [1, 11],
  WI: [2, 7],
  VT: [2, 10], NH: [2, 11],
  WA: [3, 2], ID: [3, 3], MT: [3, 4], ND: [3, 5], MN: [3, 6],
  IL: [3, 7], MI: [3, 8], NY: [3, 9], MA: [3, 10],
  OR: [4, 2], NV: [4, 3], WY: [4, 4], SD: [4, 5], IA: [4, 6],
  IN: [4, 7], OH: [4, 8], PA: [4, 9], NJ: [4, 10], CT: [4, 11], RI: [4, 12],
  CA: [5, 2], UT: [5, 3], CO: [5, 4], NE: [5, 5], MO: [5, 6],
  KY: [5, 7], WV: [5, 8], VA: [5, 9], MD: [5, 10],
  AZ: [6, 3], NM: [6, 4], KS: [6, 5], AR: [6, 6], TN: [6, 7],
  NC: [6, 8], SC: [6, 9], DC: [6, 10], DE: [6, 11],
  HI: [7, 1], OK: [7, 5], LA: [7, 6], MS: [7, 7], AL: [7, 8], GA: [7, 9],
  TX: [8, 4], FL: [8, 9],
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--:--";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function relativeTime(iso: string): string {
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

type StateAggregate = {
  category: Category;
  count: number;
  mostRecent: string;
};

function aggregateByState(events: LiveEvent[]): Map<string, StateAggregate> {
  const map = new Map<string, StateAggregate>();
  for (const ev of events) {
    if (!ev.state) continue;
    const existing = map.get(ev.state);
    if (!existing) {
      map.set(ev.state, {
        category: ev.category,
        count: ev.count,
        mostRecent: ev.timestamp,
      });
    } else {
      existing.count += ev.count;
      if (ev.timestamp > existing.mostRecent) {
        existing.mostRecent = ev.timestamp;
        existing.category = ev.category;
      }
    }
  }
  return map;
}

function dotSizeFromCount(count: number): number {
  // Subtle scale: 4px → 10px, log-ish.
  if (count <= 0) return 4;
  const v = Math.log10(count);
  return Math.min(10, Math.max(4, Math.round(4 + v * 1.4)));
}

export async function RecentFindings() {
  let events: LiveEvent[] = [];
  try {
    const data = await getAtlasLive();
    events = data.recent_events;
  } catch {
    events = [];
  }

  const stateAggregates = aggregateByState(events);
  const newestState = events[0]?.state ?? null;
  const stateCount = stateAggregates.size;

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

          <div className="findings-map-wrap">
            <div className="findings-map-label">GEOGRAPHIC DISTRIBUTION</div>
            <div className="findings-map" aria-hidden="true">
              {Object.entries(STATE_GRID).map(([code, [row, col]]) => {
                const agg = stateAggregates.get(code);
                const active = !!agg;
                const isNewest = code === newestState;
                const dotSize = agg ? dotSizeFromCount(agg.count) : 0;
                const cls = [
                  "findings-tile",
                  active ? "findings-tile-active" : "",
                  active ? `findings-tile-${agg!.category}` : "",
                  isNewest ? "findings-tile-pulse" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={code}
                    className={cls}
                    style={{
                      gridRow: row,
                      gridColumn: col,
                    }}
                    title={
                      agg
                        ? `${code} · ${formatCount(agg.count)} records · ${CATEGORY_LABEL[agg.category]}`
                        : code
                    }
                  >
                    <span className="findings-tile-code">{code}</span>
                    {active && (
                      <span
                        className="findings-tile-dot"
                        style={{ width: `${dotSize}px`, height: `${dotSize}px` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="findings-map-caption">
              {stateCount} state{stateCount === 1 ? "" : "s"} with activity in the last 48 hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
