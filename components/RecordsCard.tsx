"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/tick";
import { useRelative } from "@/lib/relative";

/** The nightly delta the card reports, and the distance the count-up covers. */
const LATEST_DELTA = 424968;

/**
 * The 30-day series. Hard-coded in the design; wire it to an endpoint when one
 * exists. Values are y positions in the 1000x180 viewBox.
 */
const YS = [
  168, 165, 163, 161, 160, 158, 157, 155, 153, 152, 150, 148, 147, 120, 82, 60,
  52, 50, 48, 47, 46, 45, 44, 43, 42, 40, 30, 26, 24, 20, 16,
];

const LINE_POINTS = YS.map(
  (y, i) => `${((i * 1000) / (YS.length - 1)).toFixed(0)},${y}`
).join(" ");
const AREA_POINTS = `0,180 ${LINE_POINTS} 1000,180`;

const NF = new Intl.NumberFormat("en-US");

type Props = {
  total: number;
  updatedIso: string | null;
};

export function RecordsCard({ total, updatedIso }: Props) {
  const [shown, setShown] = useState(total);
  const [drawn, setDrawn] = useState(false);
  const raf = useRef<number | null>(null);
  const rel = useRelative(updatedIso);

  useEffect(() => {
    const drawT = setTimeout(() => setDrawn(true), 150);
    return () => clearTimeout(drawT);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(total);
      return;
    }
    const from = total - LATEST_DELTA;
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
  }, [total]);

  return (
    <div id="records" className="rph-records">
      <div className="rph-records__head">
        <span className="rph-records__label">
          <span className="rph-dot" />
          Verified property and data records:
        </span>
        <span className="rph-records__rel">{rel}</span>
      </div>

      <div className="rph-records__count">{NF.format(shown)}</div>
      <div className="rph-records__meta">
        +275.5M archived &middot; 777.9M all-time
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
        <polygon
          points={AREA_POINTS}
          fill="var(--forest-800)"
          fillOpacity={drawn ? 0.08 : 0}
          style={{ transition: "fill-opacity 1.2s ease .6s" }}
        />
        <polyline
          points={LINE_POINTS}
          fill="none"
          stroke="var(--forest-800)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={drawn ? 0 : 1}
          style={{
            transition: "stroke-dashoffset 2.4s cubic-bezier(.3,.7,.3,1)",
          }}
        />
      </svg>
      <div className="rph-chart__axis">
        <span>Aug 27</span>
        <span>Sep 26</span>
      </div>

      <div className="rph-records__foot">
        <span className="rph-records__foot-label">Latest Update:</span>
        <span className="rph-records__delta">
          +{NF.format(LATEST_DELTA)}
        </span>
      </div>
    </div>
  );
}
