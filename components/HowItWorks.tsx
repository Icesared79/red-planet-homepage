"use client";

import { useSharedTick } from "@/lib/tick";

/**
 * Stage copy is the design's, with two speed claims removed under the standing
 * rule that speed is stated only as a measured figure (the design package says
 * the same: "never 'real time', 'instant' or 'live as it happens'").
 *   03 was "Records get synced instantly."
 *   04 was "Changes monitored in real time."
 * The descriptions are verbatim, including the trailing space on 03.
 */
const STAGES = [
  {
    num: "01",
    kicker: "Discovery",
    title: "AI Agents find sources.",
    desc: "Jurisdiction by jurisdiction, automatically.",
  },
  {
    num: "02",
    kicker: "Extraction",
    title: "They write their own logic.",
    desc: "The agent derives how to read a source, then validates the output.",
  },
  {
    num: "03",
    kicker: "Resolution",
    title: "Records get synced.",
    desc: "Ownership chains that were previously overlooked. ",
  },
  {
    num: "04",
    kicker: "Signals",
    title: "Changes are monitored.",
    desc: "Data is recomputed as records come in, not next quarter.",
  },
];

export function HowItWorks() {
  const { tick, motion } = useSharedTick();
  const active = motion ? tick % STAGES.length : STAGES.length - 1;

  return (
    <section id="engine" className="rph-band rph-band--moss">
      <div className="rph-engine__head">
        <div>
          <div className="rph-kicker rph-kicker--moss">
            &sect; 04 &mdash; How it works
          </div>
          <h2 className="rph-h2 rph-engine__h2">
            Atlas uses AI agents to capture and maintain every source.
          </h2>
        </div>
        <div className="rph-engine__aside">
          <p>
            Sources include county recorders, courts, tax collectors, and county
            and city governing bodies. Every property record resolves to one
            connected record, and local government decisions are linked to the
            body that made them.
          </p>
          <a
            href="https://docs.redplanetdata.com"
            className="rph-underline--moss"
          >
            Read the documentation
          </a>
        </div>
      </div>

      <div className="rph-stages">
        {STAGES.map((s, i) => (
          <div
            key={s.num}
            className="rph-stage"
            style={{ opacity: i <= active ? 1 : 0.5 }}
          >
            <div className="rph-stage__track">
              <div
                className="rph-stage__fill"
                style={{ width: i <= active ? "100%" : "0%" }}
              />
            </div>
            <div className="rph-stage__body">
              <div className="rph-stage__num">
                {s.num} {s.kicker}
              </div>
              <h3 className="rph-h3">{s.title}</h3>
              <p className="rph-stage__desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
