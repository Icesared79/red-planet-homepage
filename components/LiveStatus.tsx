import { getAtlasLive } from "@/lib/atlas-live";

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

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

export async function LiveStatus() {
  let total: number | null = null;
  let sources: number | null = null;
  let lastUpdated: string | null = null;

  try {
    const data = await getAtlasLive();
    total = data.total_records;
    sources = data.active_sources;
    lastUpdated = data.last_updated;
  } catch {
    // Render the strip with placeholders rather than blowing up the page.
  }

  return (
    <section className="live-status" aria-label="Live engine status">
      <div className="container live-status-inner">
        <div className="live-status-pulse" aria-hidden="true">
          <span className="live-status-dot" />
        </div>
        <div className="live-status-stats">
          <div className="live-status-stat">
            <span className="live-status-num">
              {total !== null ? formatNumber(total) : "—"}
            </span>
            <span className="live-status-label">records</span>
          </div>
          <span className="live-status-divider" aria-hidden="true" />
          <div className="live-status-stat">
            <span className="live-status-num">
              {sources !== null ? formatNumber(sources) : "—"}
            </span>
            <span className="live-status-label">sources active</span>
          </div>
          <span className="live-status-divider" aria-hidden="true" />
          <div className="live-status-stat live-status-stat-time">
            <span className="live-status-label">Updated</span>
            <span className="live-status-num">{relativeTime(lastUpdated)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
