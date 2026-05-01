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

const POLL_INTERVAL_MS = 5_000;
const VISIBLE_ROWS = 6;

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--:--";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatLocation(ev: IngestEvent): string {
  if (ev.county && ev.state) return `${ev.county}, ${ev.state}`;
  if (ev.state) return ev.state;
  if (ev.county) return ev.county;
  return "";
}

function formatDelta(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function LiveActivity() {
  const [events, setEvents] = useState<IngestEvent[] | null>(null);
  const [enteringTs, setEnteringTs] = useState<string | null>(null);
  const seenTsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetch("/api/atlas-live", { cache: "no-store" });
        if (!alive) return;
        if (res.ok) {
          const json: LivePayload = await res.json();
          const incoming = json.recent_activity ?? [];
          setEvents((prev) => {
            if (!prev) {
              for (const ev of incoming) seenTsRef.current.add(ev.timestamp);
              return incoming;
            }
            const newestPrevTs = prev[0]?.timestamp;
            const topIncoming = incoming[0];
            if (
              topIncoming &&
              topIncoming.timestamp !== newestPrevTs &&
              !seenTsRef.current.has(topIncoming.timestamp)
            ) {
              setEnteringTs(topIncoming.timestamp);
              setTimeout(() => setEnteringTs(null), 700);
            }
            for (const ev of incoming) seenTsRef.current.add(ev.timestamp);
            return incoming;
          });
        }
      } catch {
        // Keep last good values.
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

  const visible = (events ?? []).slice(0, VISIBLE_ROWS);
  const showEmpty = events !== null && visible.length === 0;
  const showLoading = events === null;

  return (
    <section className="live-activity" id="live">
      <div className="container">
        <div className="live-activity-header">
          <div className="eyebrow on-light">§ 04 — Live</div>
          <h2>
            Atlas, <span className="accent">right now.</span>
          </h2>
          <p>Live ingestion activity from the engine.</p>
        </div>

        <div className="live-activity-panel" role="log" aria-live="polite">
          <div className="live-activity-panel-header">
            <span className="live-activity-panel-dot" aria-hidden="true" />
            <span className="live-activity-panel-label">atlas:ingest</span>
            <span className="live-activity-panel-meta">stream</span>
          </div>
          <div className="live-activity-rows">
            {showLoading && (
              <div className="live-activity-row live-activity-row-empty">
                Connecting to engine…
              </div>
            )}
            {showEmpty && (
              <div className="live-activity-row live-activity-row-empty">
                Pipeline idle. Next ingestion scheduled.
              </div>
            )}
            {!showLoading &&
              !showEmpty &&
              visible.map((ev, i) => {
                const isFreshest = i === 0;
                const isEntering =
                  isFreshest && enteringTs === ev.timestamp;
                const location = formatLocation(ev);
                const classes = [
                  "live-activity-row",
                  isFreshest ? "live-activity-row-fresh" : "",
                  isEntering ? "live-activity-row-enter" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div key={ev.timestamp} className={classes}>
                    <span className="lar-time">{formatTime(ev.timestamp)}</span>
                    <span className="lar-source" title={ev.source_name}>
                      {ev.source_name}
                    </span>
                    <span className="lar-loc">{location}</span>
                    <span className="lar-delta">
                      +{formatDelta(ev.record_delta)} records
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
