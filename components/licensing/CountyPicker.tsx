"use client";

import { useMemo, useState } from "react";

export type PickCounty = { fips: string; state: string; name: string };

const STATE_NAMES: Record<string, string> = { CT: "Connecticut", FL: "Florida" };

/** A searchable list of the licensable counties, grouped by state, with a whole-state toggle per state. */
export function CountyPicker({
  counties,
  value,
  onChange,
  id,
}: {
  counties: PickCounty[];
  value: string[];
  onChange: (next: string[]) => void;
  id: string;
}) {
  const [q, setQ] = useState("");
  const picked = useMemo(() => new Set(value), [value]);
  const needle = q.trim().toLowerCase();
  const states = useMemo(() => [...new Set(counties.map((c) => c.state))], [counties]);

  const toggle = (fips: string) => {
    const next = new Set(picked);
    if (next.has(fips)) next.delete(fips);
    else next.add(fips);
    onChange([...next]);
  };
  const toggleState = (st: string) => {
    const all = counties.filter((c) => c.state === st).map((c) => c.fips);
    const every = all.every((f) => picked.has(f));
    const next = new Set(picked);
    for (const f of all) {
      if (every) next.delete(f);
      else next.add(f);
    }
    onChange([...next]);
  };

  return (
    <div className="rpl-picker">
      <input
        id={id}
        type="search"
        className="rpl-picker__search"
        placeholder="Search counties"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search counties"
      />
      <div className="rpl-picker__list" role="group" aria-label="Counties">
        {states.map((st) => {
          const rows = counties.filter((c) => c.state === st && (!needle || c.name.toLowerCase().includes(needle)));
          if (!rows.length) return null;
          const all = counties.filter((c) => c.state === st);
          const every = all.every((c) => picked.has(c.fips));
          return (
            <div key={st} className="rpl-picker__state">
              <div className="rpl-picker__state-head">
                <span>{STATE_NAMES[st] ?? st}</span>
                <button type="button" className="rpl-picker__all" onClick={() => toggleState(st)} data-licensing="pick-state" data-state={st}>
                  {every ? "Clear all" : `All ${all.length}`}
                </button>
              </div>
              {rows.map((c) => (
                <label key={c.fips} className="rpl-picker__row">
                  <input type="checkbox" checked={picked.has(c.fips)} onChange={() => toggle(c.fips)} data-fips={c.fips} />
                  <span>{c.name.replace(/, (Connecticut|Florida)$/, "")}</span>
                </label>
              ))}
            </div>
          );
        })}
      </div>
      <p className="rpl-picker__count" data-licensing="picked-count">
        {value.length === 0 ? "No counties chosen" : value.length === 1 ? "1 county chosen" : `${value.length} counties chosen`}
      </p>
    </div>
  );
}
