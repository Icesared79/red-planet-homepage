"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/in-view";
import { prefersReducedMotion } from "@/lib/tick";
import { useRelative } from "@/lib/relative";

const STEPS = 127;
/** The one step of last night's run that was flagged for retry. */
const FLAGGED = 99;

type Props = {
  updatedIso: string | null;
  /** Server-computed "N ago" label, so the first paint is the real value. */
  relInitial?: string;
};

export function MissionControl({ updatedIso, relInitial }: Props) {
  const [done, setDone] = useState(0);
  const stripRef = useRef<HTMLDivElement | null>(null);
  // The run strip reads as last night's pipeline working through its steps, so
  // it is worth watching again: re-arm it each time the band comes into view.
  const inView = useInView(stripRef, { once: false });
  const rel = useRelative(updatedIso, relInitial);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setDone(STEPS);
      return;
    }
    setDone(0);
    const id = setInterval(() => {
      setDone((d) => {
        if (d >= STEPS) {
          clearInterval(id);
          return d;
        }
        return d + 1;
      });
    }, 45);
    return () => clearInterval(id);
  }, [inView]);

  const doneCount = done - (done > FLAGGED ? 1 : 0);

  return (
    <section id="atlas" className="rph-band rph-band--moss">
      <div className="rph-kicker rph-kicker--moss">
        &sect; 02 &mdash; Mission control
      </div>
      <h2 className="rph-h2 rph-mission__h2">
        We watch everything Atlas collects, from one place.
      </h2>
      <p className="rph-intro rph-intro--moss rph-mission__intro">
        It also lets us build any number of products on top.
      </p>

      <div className="rph-runhead">
        <span className="rph-runhead__title">Last night</span>
        <span className="rph-runhead__rel" suppressHydrationWarning>
          Updated {rel}
        </span>
      </div>

      <div
        ref={stripRef}
        className="rph-runstrip"
        role="img"
        aria-label={`Last night: ${doneCount} of ${STEPS} checks completed, 1 needs another attempt`}
      >
        {Array.from({ length: STEPS }, (_, i) => {
          const complete = i < done;
          const flagged = i === FLAGGED;
          return (
            <i
              key={i}
              style={{
                height: complete ? (flagged ? "100%" : "62%") : "18%",
                background: complete
                  ? flagged
                    ? "var(--red-400)"
                    : "var(--green-300)"
                  : "var(--rph-rule-moss)",
              }}
            />
          );
        })}
      </div>

      <div className="rph-runstats">
        <div>
          <div className="rph-runstats__label">Checks completed</div>
          <div className="rph-runstats__value">
            {doneCount} of {STEPS}
          </div>
        </div>
        <div>
          <div className="rph-runstats__label">Needs another attempt</div>
          <div className="rph-runstats__value rph-runstats__value--flag">1</div>
        </div>
      </div>
    </section>
  );
}
