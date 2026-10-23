// Ported from atlas-dash lib/county-catalog/report-view.tsx (atlas-dashboard d320772, 2026-10-18) for the Red Planet
// website (LAND-5.3, 2026-10-23): the County Catalog's visual county report, drawn from what the catalog's builder
// (lib/county-catalog/report.ts, run by atlas-dash scripts/_land53_county_report_export.ts) produced. Plain markup with
// no state and no effects, so a static builder renders it with react-dom/server. Styles: ./report.css (cr- prefix),
// tokens only; the page inlines that sheet, which is why there is no CSS import here.
//
// Differences from the original, all deliberate: ReportMapView draws `marks` (points the exporter projected with the
// map's own projection) in the highlight with a label; the airport key and facts never say "public-use" (the website's
// own copy does not carry the word); the client audience is the only one, so the operator notes and links are gone.
//
// Charts follow the system's chart rules as far as a comparison allows: no gridlines, no legend, mono end labels. They
// carry two lines, the county and the national median, because the comparison is the point; the median is dashed and
// lighter so the county reads first. Labels sit in HTML beside and over the SVG so they stay a readable size when the
// figure shrinks to a phone's width.

import type { CompareColumn, CountyReport, ReportChart, ReportComparison, ReportMap } from './report-types'

const DASH = '—'
const MINUS = '−'

export function fmtChartValue(v: number | null, format: ReportChart['format']): string {
  if (v === null || !Number.isFinite(v)) return DASH
  const a = Math.abs(v)
  const sign = v < 0 ? MINUS : ''
  if (format === 'pct_change') return `${v > 0 ? '+' : sign}${a.toFixed(1)}%`
  if (format === 'pct') return `${sign}${a.toFixed(1)}%`
  if (format === 'usd') {
    if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(1)}B`
    if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}M`
    return `${sign}$${Math.round(a).toLocaleString('en-US')}`
  }
  return sign + (a >= 1000 ? Math.round(a).toLocaleString('en-US') : a.toFixed(1).replace(/\.0$/, ''))
}

// ── charts ────────────────────────────────────────────────────────────────────────────────

function Chart({ c, name }: { c: ReportChart; name: string }) {
  const vals = [...c.county, ...c.national].filter((v): v is number => v !== null)
  if (c.kind === 'growth') vals.push(0)
  let lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || Math.abs(hi) || 1
  lo -= span * 0.12
  hi += span * 0.12
  const y = (v: number) => 100 - ((v - lo) / (hi - lo)) * 100
  // Placed by year, so a year Atlas does not hold leaves its true width; that stretch is drawn dotted.
  const ya = c.years[0], yb = c.years[c.years.length - 1]
  const x = (i: number) => ((c.years[i] - ya) / Math.max(yb - ya, 1)) * 1000
  const hasUs = c.national.some((v) => v !== null)
  const line = (s: (number | null)[], gaps: boolean) => {
    let d = ''
    let prev = -1
    s.forEach((v, i) => {
      if (v === null) return
      const across = prev >= 0 && c.years[i] - c.years[prev] > 1
      if (prev >= 0 && across === gaps) d += `M${x(prev).toFixed(1)} ${y(s[prev]!).toFixed(2)} L${x(i).toFixed(1)} ${y(v).toFixed(2)} `
      prev = i
    })
    return d.trim()
  }
  const last = (s: (number | null)[]) => {
    for (let i = s.length - 1; i >= 0; i--) if (s[i] !== null) return s[i]
    return null
  }
  const lc = last(c.county), ln = last(c.national)
  // End labels: one per line, nudged apart when the lines finish close together.
  let tc = lc === null ? 50 : y(lc), tn = ln === null ? 50 : y(ln)
  if (hasUs && Math.abs(tc - tn) < 22) {
    const mid = (tc + tn) / 2
    const up = tc <= tn ? -11 : 11
    tc = mid + up
    tn = mid - up
  }
  const clamp = (v: number) => Math.min(96, Math.max(4, v))
  const y0 = c.labels ? c.labels[0] : c.years[0], y1 = c.labels ? c.labels[c.labels.length - 1] : c.years[c.years.length - 1]
  const gap = c.years.some((yr, i) => i > 0 && yr - c.years[i - 1] > 1)
  const summary = `${c.title}, ${c.unit_note.toLowerCase()}, ${y0} to ${y1}: ${name} ${fmtChartValue(lc, c.format)} in ${y1}`
    + (hasUs ? `; median US county ${fmtChartValue(ln, c.format)}.` : '.')
  return (
    <figure className="cr-chart" data-cr="chart" data-factor={c.factor_key}>
      <figcaption className="cr-chart__head">
        <span className="cr-chart__title">{c.title}</span>
        <span className="cr-chart__unit">{c.unit_note} · {y0} to {y1}{gap ? ' · dotted where a year has no figure' : ''}</span>
      </figcaption>
      <div className="cr-chart__body" role="img" aria-label={summary}>
        <svg className="cr-chart__plot" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
          {c.kind === 'growth' && <line className="cr-chart__zero" x1="0" x2="1000" y1={y(0)} y2={y(0)} />}
          {hasUs && <path className="cr-chart__us" d={line(c.national, false)} />}
          {hasUs && <path className="cr-chart__us is-gap" d={line(c.national, true)} />}
          <path className="cr-chart__county" d={line(c.county, false)} />
          <path className="cr-chart__county is-gap" d={line(c.county, true)} />
        </svg>
        <div className="cr-chart__ends" aria-hidden="true">
          <span className="cr-chart__end is-county" style={{ top: `${clamp(tc)}%` }}>{hasUs ? `${name} ` : ''}{fmtChartValue(lc, c.format)}</span>
          {hasUs && <span className="cr-chart__end is-us" style={{ top: `${clamp(tn)}%` }}>US median {fmtChartValue(ln, c.format)}</span>}
        </div>
      </div>
      <div className="cr-chart__years" aria-hidden="true">
        <span>{y0}</span>
        <span>{y1}</span>
      </div>
    </figure>
  )
}

export function ReportCharts({ report, note }: { report: CountyReport; note?: string }) {
  if (!report.charts.length) return null
  return (
    <div className="cr-charts-wrap">
      <div className="cr-charts" data-cr="charts">
        {report.charts.map((c) => <Chart key={c.factor_key} c={c} name={report.chart_name ?? report.short} />)}
      </div>
      <p className="cr-note">{note ?? `Each chart shows ${report.short} against the median US county for the same years.`}</p>
    </div>
  )
}

// ── map ───────────────────────────────────────────────────────────────────────────────────

// The website's own copy never carries the word "public"; the FAA's "public-use" airports are "airports" here.
const factLabel = (label: string) => (label === 'Public-use airports' ? 'Airports' : label)

export function ReportMapView({ report }: { report: CountyReport }) {
  const m: ReportMap | null = report.map
  if (!m) return null
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`
  const labels = m.counties.filter((c) => c.label)
  const neighbors = m.counties.filter((c) => c.role === 'neighbor').map((c) => c.name)
  const certified = m.airports.filter((a) => a.certificated)
  const otherAirports = m.airports.length - certified.length
  const marks = m.marks ?? []
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  const aria = `Map of ${report.name} and the counties around it${neighbors.length ? `: ${neighbors.join(', ')}` : ''}, with ${[
    count(m.interstates.length, 'interstate segment', 'interstate segments'),
    count(m.rail.length, 'rail line', 'rail lines'),
    count(m.lines.length, 'transmission line segment', 'transmission line segments'),
    count(m.substations.length, 'substation', 'substations'),
    count(certified.length, 'airport with airline service', 'airports with airline service'),
    count(otherAirports, 'other airport', 'other airports'),
  ].join(', ')} in view${marks.length ? `; marked: ${marks.map((k) => k.label ?? 'a parcel group').join(', ')}` : ''}.`
  return (
    <figure className="cr-map" data-cr="map">
      <div className="cr-map__frame" style={{ aspectRatio: `${m.width} / ${m.height}` }} role="img" aria-label={aria}>
        <svg className="cr-map__svg" viewBox={`0 0 ${m.width} ${m.height}`} aria-hidden="true">
          <rect className="cr-map__sea" x="0" y="0" width={m.width} height={m.height} />
          {m.counties.map((c) => <path key={c.fips} className={`cr-map__county is-${c.role}`} d={c.d} data-fips={c.fips} />)}
          <g className="cr-map__rail" data-cr="map-rail">
            {m.rail.map((d, i) => <path key={`t${i}`} className="is-ties" d={d} />)}
            {m.rail.map((d, i) => <path key={`r${i}`} className="is-track" d={d} />)}
          </g>
          <g className="cr-map__interstates" data-cr="map-interstates">
            {m.interstates.map((d, i) => <path key={`c${i}`} className="is-casing" d={d} />)}
            {m.interstates.map((d, i) => <path key={`i${i}`} className="is-core" d={d} />)}
          </g>
          <g className="cr-map__lines">
            {m.lines.map((l, i) => <path key={i} className={l.high ? 'is-high' : 'is-low'} d={l.d} />)}
          </g>
          <g className="cr-map__subs">
            {m.substations.map((s, i) => <circle key={i} className={s.high ? 'is-high' : 'is-low'} cx={s.x} cy={s.y} r={s.high ? 3.4 : 1.7} />)}
          </g>
          <g className="cr-map__airports" data-cr="map-airports">
            {m.airports.map((a) => a.certificated
              ? <rect key={a.code} className="is-cert" x={a.x - 4} y={a.y - 4} width="8" height="8" />
              : <rect key={a.code} className="is-open" x={a.x - 2.75} y={a.y - 2.75} width="5.5" height="5.5" />)}
          </g>
          {m.counties.filter((c) => c.role === 'county').map((c) => <path key={`o-${c.fips}`} className="cr-map__outline" d={c.d} />)}
          {marks.length > 0 && (
            <g className="cr-map__marks" data-cr="map-marks">
              {marks.map((k, i) => <circle key={`m${i}`} cx={k.x} cy={k.y} r="9" />)}
              {marks.map((k, i) => <circle key={`mc${i}`} className="is-core" cx={k.x} cy={k.y} r="3" />)}
            </g>
          )}
        </svg>
        {labels.map((c) => (
          <span key={c.fips} className={`cr-map__label is-${c.role}`} style={{ left: pct(c.label!.x, m.width), top: pct(c.label!.y, m.height) }}
            data-cr={c.role === 'neighbor' ? 'map-neighbor' : 'map-county'}>
            {c.name}
          </span>
        ))}
        {certified.map((a) => (
          <span key={`a-${a.code}`} className="cr-map__airport" style={{ left: pct(a.x + 7, m.width), top: pct(a.y, m.height) }} title={a.name}>{a.code}</span>
        ))}
        {marks.filter((k) => k.label).map((k, i) => (
          <span key={`ml${i}`} className="cr-map__mark-label" style={{ left: pct(k.x + 12, m.width), top: pct(k.y - 13, m.height) }} data-cr="map-mark-label">{k.label}</span>
        ))}
      </div>
      <figcaption className="cr-map__caption">
        <ul className="cr-map__key" aria-label="Map key" data-cr="map-key">
          <li><svg width="22" height="10" aria-hidden="true"><rect className="cr-key__county" x="1" y="1" width="20" height="8" /></svg>{report.short}</li>
          {marks.length > 0 && <li><svg width="22" height="10" aria-hidden="true"><circle className="cr-key__mark" cx="11" cy="5" r="3.5" /></svg>{marks[0].label ?? 'Marked parcels'}</li>}
          {m.interstates.length > 0 && <li><svg width="22" height="10" aria-hidden="true"><line className="cr-key__road-casing" x1="0" x2="22" y1="5" y2="5" /><line className="cr-key__road-core" x1="0" x2="22" y1="5" y2="5" /></svg>Interstate</li>}
          {m.rail.length > 0 && <li><svg width="22" height="10" aria-hidden="true"><line className="cr-key__rail-ties" x1="0" x2="22" y1="5" y2="5" /><line className="cr-key__rail-track" x1="0" x2="22" y1="5" y2="5" /></svg>Rail, main and industrial</li>}
          {m.lines.some((l) => l.high) && <li><svg width="22" height="10" aria-hidden="true"><line className="cr-key__high" x1="0" x2="22" y1="5" y2="5" /></svg>Transmission, 345 kV and above</li>}
          {m.lines.some((l) => !l.high) && <li><svg width="22" height="10" aria-hidden="true"><line className="cr-key__low" x1="0" x2="22" y1="5" y2="5" /></svg>Transmission, below 345 kV</li>}
          {m.substations.length > 0 && <li><svg width="22" height="10" aria-hidden="true"><circle className="cr-key__sub" cx="11" cy="5" r="3" /></svg>Substation</li>}
          {certified.length > 0 && <li><svg width="22" height="10" aria-hidden="true"><rect className="cr-key__airport" x="7" y="1" width="8" height="8" /></svg>Airport with airline service</li>}
          {otherAirports > 0 && <li><svg width="22" height="10" aria-hidden="true"><rect className="cr-key__airport-open" x="8.25" y="2.25" width="5.5" height="5.5" /></svg>Other airport</li>}
        </ul>
        {m.facts.length > 0 && (
          <dl className="cr-facts" data-cr="map-facts">
            {m.facts.map((f) => (
              <div key={f.label} className="cr-facts__row"><dt>{factLabel(f.label)}</dt><dd>{f.value}</dd></div>
            ))}
          </dl>
        )}
      </figcaption>
    </figure>
  )
}

// ── comparison ────────────────────────────────────────────────────────────────────────────

function fmtCell(v: number | null, col: CompareColumn): string {
  if (v === null || !Number.isFinite(v)) return DASH
  if (col.format === 'usd') return `$${Math.round(v).toLocaleString('en-US')}`
  if (col.format === 'pct_change') return `${v > 0 ? '+' : v < 0 ? MINUS : ''}${Math.abs(v).toFixed(1)}%`
  return `${v < 0 ? MINUS : ''}${Math.abs(v).toFixed(1)}`
}

export function ReportComparisonView({ report }: { report: CountyReport }) {
  const c: ReportComparison | null = report.comparison
  if (!c || c.rows.length < 2) return null
  return (
    <div className="cr-compare" data-cr="comparison">
      {c.caption && <p className="cr-compare__caption" data-cr="comparison-caption">{c.caption}</p>}
      <div className="cr-compare__scroll">
        <table className="cr-compare__table">
          <thead>
            <tr>
              <th scope="col">Place</th>
              {c.columns.map((col) => (
                <th key={col.key} scope="col" className="is-num">{col.label}{col.years && <span className="cr-compare__years">{col.years}</span>}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.rows.map((r) => (
              <tr key={r.fips ?? r.name} className={`is-${r.kind}`}>
                <th scope="row">{r.name}</th>
                {c.columns.map((col) => <td key={col.key} className="is-num">{fmtCell(r.values[col.key], col)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {c.note && <p className="cr-note">{c.note}</p>}
    </div>
  )
}

// ── what we found ─────────────────────────────────────────────────────────────────────────

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })

/** Counts only, and only for record types counted in the window: the client view. */
export function ReportFoundView({ report }: { report: CountyReport }) {
  const f = report.found
  if (!f) return null
  const items = f.items.filter((x) => x.status === 'counted')
  if (!items.length) return null
  return (
    <div className="cr-found" data-cr="found">
      <p className="cr-found__window">From {longDate(f.window_start)} to {longDate(f.window_end)}, in {report.short}&apos;s commercial property record.</p>
      <dl className="cr-facts cr-found__list">
        {items.map((x) => (
          <div key={x.kind} className="cr-facts__row" data-cr={`found-${x.kind}`}>
            <dt>{x.label}</dt>
            <dd>{(x.count ?? 0).toLocaleString('en-US')}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
