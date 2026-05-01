"use client";

import { useEffect, useRef, useState } from "react";

type IngestEvent = {
  timestamp: string;
  source_name: string;
  county: string | null;
  state: string | null;
  record_delta: number;
};

type LivePayload = {
  total_records: number;
  active_sources: number;
  last_ingest: IngestEvent | null;
  recent_activity: IngestEvent[];
};

const POLL_INTERVAL_MS = 10_000;

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

export function LiveStatus() {
  const [data, setData] = useState<LivePayload | null>(null);
  const [recordsKey, setRecordsKey] = useState(0);
  const [sourcesKey, setSourcesKey] = useState(0);
  const [, force] = useState(0);
  const lastRecordsRef = useRef<number | null>(null);
  const lastSourcesRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetch("/api/atlas-live", { cache: "no-store" });
        if (!alive) return;
        if (res.ok) {
          const json: LivePayload = await res.json();
          setData((prev) => {
            if (
              prev &&
              prev.total_records === json.total_records &&
              prev.active_sources === json.active_sources &&
              prev.last_ingest?.timestamp === json.last_ingest?.timestamp
            ) {
              return prev;
            }
            if (
              lastRecordsRef.current !== null &&
              lastRecordsRef.current !== json.total_records
            ) {
              setRecordsKey((k) => k + 1);
            }
            if (
              lastSourcesRef.current !== null &&
              lastSourcesRef.current !== json.active_sources
            ) {
              setSourcesKey((k) => k + 1);
            }
            lastRecordsRef.current = json.total_records;
            lastSourcesRef.current = json.active_sources;
            return json;
          });
        }
      } catch {
        // Keep last good values; do not flash an error state.
      } finally {
        if (alive) timer = setTimeout(tick, POLL_INTERVAL_MS);
      }
    }

    tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const total = data?.total_records;
  const sources = data?.active_sources;
  const lastIngestIso = data?.last_ingest?.timestamp ?? null;

  return (
    <section className="live-status" aria-label="Live engine status">
      <div className="container live-status-inner">
        <div className="live-status-pulse" aria-hidden="true">
          <span className="live-status-dot" />
        </div>
        <div className="live-status-stats">
          <div className="live-status-stat">
            <span key={recordsKey} className="live-status-num live-status-num-flash">
              {total !== undefined ? formatNumber(total) : " "}
            </span>
            <span className="live-status-label">records</span>
          </div>
          <span className="live-status-divider" aria-hidden="true" />
          <div className="live-status-stat">
            <span key={sourcesKey} className="live-status-num live-status-num-flash">
              {sources !== undefined ? formatNumber(sources) : " "}
            </span>
            <span className="live-status-label">sources active</span>
          </div>
          <span className="live-status-divider" aria-hidden="true" />
          <div className="live-status-stat live-status-stat-time">
            <span className="live-status-label">Last ingest:</span>
            <span className="live-status-num">{relativeTime(lastIngestIso)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
