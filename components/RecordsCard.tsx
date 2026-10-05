"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "@/lib/in-view";
import { prefersReducedMotion } from "@/lib/tick";
import { useRelative } from "@/lib/relative";

const NF = new Intl.NumberFormat("en-US");

/**
 * "540.7M" / "1.0B" -- the subline's existing shape ("+275.5M archived ·
 * 777.9M all-time"), now computed instead of typed in.
 */
function compact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return NF.format(n);
}

/**
 * "Sep 6" from a "YYYY-MM-DD" day key. Built from the parts rather than
 * Date.parse so the label cannot slide a day in a west-of-UTC timezone.
 */
function axisLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return day;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * The series was a hard-coded array of y positions in the 1000x180 viewBox
 * ("wire it to an endpoint when one exists"). It is now the real 30-day
 * history, mapped into exactly the same visual band the design used -- the
 * lowest point at y=168, the highest at y=16 -- so the chart keeps its shape
 * and proportions while the values underneath it are live.
 */
const Y_FLOOR = 168;
const Y_CEIL = 16;

function chartGeometry(points: { total: number }[]) {
  if (points.length < 2) return null;
  const totals = points.map((p) => p.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const span = max - min;
  const ys = totals.map((t) =>
    span === 0
      ? (Y_FLOOR + Y_CEIL) / 2
      : Y_FLOOR - ((t - min) / span) * (Y_FLOOR - Y_CEIL)
  );
  const line = ys
    .map((y, i) => `${((i * 1000) / (ys.length - 1)).toFixed(0)},${y.toFixed(1)}`)
    .join(" ");
  return { line, area: `0,180 ${line} 1000,180` };
}

type Props = {
  /** Verified records live -- the same figure Mission Control headlines. */
  total: number;
  /** Rows in verified cold storage. */
  stored: number;
  /** verified + stored. */
  allTime: number;
  /** Last night's measured ingest. */
  latestIngest: number | null;
  /** When the counts above were last recomputed. Drives the "N ago" label. */
  dataAsOf: string | null;
  /** Server-rendered "N ago" label, so the first paint is not a placeholder. */
  relInitial: string;
  /** The 30 days ending today. */
  history: { day: string; total: number }[];
};

export function RecordsCard({
  total,
  stored,
  allTime,
  latestIngest,
  dataAsOf,
  relInitial,
  history,
}: Props) {
  const [shown, setShown] = useState(total);
  const [drawn, setDrawn] = useState(false);
  const raf = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(cardRef);
  const rel = useRelative(dataAsOf, relInitial);

  const geo = useMemo(() => chartGeometry(history), [history]);
  // The count-up covers last night's ingest, as it always has -- just the
  // measured figure now instead of a constant.
  const delta = latestIngest != null && latestIngest > 0 ? latestIngest : 0;

  useEffect(() => {
    if (!inView) return;
    const drawT = setTimeout(() => setDrawn(true), 150);
    return () => clearTimeout(drawT);
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion() || delta <= 0) {
      setShown(total);
      return;
    }
    const from = total - delta;
    const t0 = performance.now();
    const dur = 2600;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (total - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [total, delta, inView]);

  return (
    <div id="records" ref={cardRef} className="rph-records">
      <div className="rph-records__head">
        <span className="rph-records__label">
          <span className="rph-dot" />
          Verified property and data records:
        </span>
        <span className="rph-records__rel" suppressHydrationWarning>
          {rel}
        </span>
      </div>

      <div className="rph-records__count">{NF.format(shown)}</div>
      <div className="rph-records__meta">
        +{compact(stored)} archived &middot; {compact(allTime)} all-time
      </div>

      <div className="rph-records__span">
        <span>Last 30 days</span>
      </div>
      <svg
        viewBox="0 0 1000 180"
        preserveAspectRatio="none"
        className="rph-chart"
        aria-label="Verified records over the last 30 days"
      >
        <line
          x1="0"
          y1="179"
          x2="1000"
          y2="179"
          stroke="var(--rph-rule-chart)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {geo && (
          <>
            <polygon
              points={geo.area}
              fill="var(--rph-chart-line)"
              fillOpacity={drawn ? 0.08 : 0}
              style={{ transition: "fill-opacity 1.2s ease .6s" }}
            />
            <polyline
              points={geo.line}
              fill="none"
              stroke="var(--rph-chart-line)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={drawn ? 0 : 1}
              style={{
                transition: "stroke-dashoffset 2.4s cubic-bezier(.3,.7,.3,1)",
              }}
            />
          </>
        )}
      </svg>
      <div className="rph-chart__axis">
        <span>{history.length > 0 ? axisLabel(history[0].day) : ""}</span>
        <span>
          {history.length > 0 ? axisLabel(history[history.length - 1].day) : ""}
        </span>
      </div>

      <div className="rph-records__foot">
        <span className="rph-records__foot-label">Latest Update:</span>
        <span className="rph-records__delta">
          {delta > 0 ? `+${NF.format(delta)}` : "—"}
        </span>
      </div>
    </div>
  );
}
