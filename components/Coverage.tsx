"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/tick";

const COV_TYPES = [
  {
    label: "Property records",
    desc: "Parcels, ownership, deeds, mortgages and assessments, resolved to one record per parcel.",
    places: [
      "Connecticut",
      "Florida",
      "North Carolina",
      "Upstate New York",
      "New York City · Manhattan",
    ],
  },
  {
    label: "Court and tax",
    desc: "Foreclosure filings, liens, tax delinquency and code enforcement, each with its filing date.",
    places: ["Connecticut", "Florida", "North Carolina", "Upstate New York"],
  },
  {
    label: "Local government",
    desc: "Meetings, agendas and formal decisions of county and city governing bodies, with the source document.",
    places: ["Florida"],
  },
];

const EXPAND = [
  {
    num: "01",
    title: "A market is requested",
    desc: "A customer or partner asks about a county, city or state Atlas does not yet cover.",
  },
  {
    num: "02",
    title: "Sources are found",
    desc: "Agents identify the county and city offices that publish records for that market.",
  },
  {
    num: "03",
    title: "Records are captured",
    desc: "Each source is collected and resolved into the same connected records as every other market.",
  },
  {
    num: "04",
    title: "History starts building",
    desc: "From the first night, Atlas keeps every version it captures, so the market's history grows each night.",
  },
];

const NIGHTS = 40;

function nightHeight(i: number): string {
  return `${38 + Math.round(22 * Math.sin(i * 1.7) ** 2 + i * 1.0)}%`;
}

export function Coverage() {
  const [type, setType] = useState(0);
  const [filled, setFilled] = useState(NIGHTS);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setFilled(0);
    const id = setInterval(() => {
      setFilled((n) => (n >= 52 ? 0 : n + 1));
    }, 160);
    return () => clearInterval(id);
  }, []);

  const current = COV_TYPES[type];

  return (
    <section id="coverage" className="rph-coverage">
      <div className="rph-coverage__inner">
        <div>
          <div className="rph-kicker">&sect; 06 &mdash; Coverage</div>
          <h2 className="rph-h2 rph-coverage__h2">
            Coverage grows market by market, on request.
          </h2>
          <p className="rph-intro rph-coverage__intro">
            Coverage in any market can be expanded on request.
          </p>

          <div role="tablist" aria-label="Type of record" className="rph-tabs">
            {COV_TYPES.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={i === type}
                className="rph-tab"
                onClick={() => setType(i)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <p className="rph-coverage__desc">{current.desc}</p>
          <div className="rph-coverage__listhead">Current markets</div>
          {current.places.map((name) => (
            <div key={name} className="rph-coverage__item">
              {name}
            </div>
          ))}
        </div>

        <div className="rph-expand">
          <div className="rph-expand__title">How a new market is added</div>
          {EXPAND.map((x) => (
            <div key={x.num} className="rph-expand__step">
              <span className="rph-expand__num">{x.num}</span>
              <div>
                <div className="rph-expand__step-title">{x.title}</div>
                <div className="rph-expand__step-desc">{x.desc}</div>
              </div>
            </div>
          ))}

          <div className="rph-nights-wrap">
            <div
              className="rph-nights"
              role="img"
              aria-label="History accumulating night by night from the first night a market is captured"
            >
              {Array.from({ length: NIGHTS }, (_, i) => {
                const on = i < filled;
                return (
                  <i
                    key={i}
                    style={{
                      height: on ? nightHeight(i) : "14%",
                      background: on
                        ? "var(--forest-800)"
                        : "var(--rph-rule-card)",
                    }}
                  />
                );
              })}
            </div>
            <div className="rph-nights__axis">
              <span>First night</span>
              <span>Each night adds to the history</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
