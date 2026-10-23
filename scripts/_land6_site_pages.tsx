// LAND-6 (2026-10-23): build the company page and the three view pages from the dated snapshots under public/data.
//
//   npx tsx --tsconfig scripts/tsconfig.land53.json scripts/_land6_site_pages.tsx
//
//   public/how-red-planet-works.html   the company page: what Red Planet Data is (a hero diagram in SVG: county records
//                                      into Atlas, four views out), every county looked at (the County Catalog's national
//                                      map shaded by score, from national-map-<as_of>.json), what a license includes,
//                                      intake, terms
//   public/how-atlascre-works.html     AtlasCRE: what it is for, Broward County's commercial record (the catalog's region
//                                      map and the 90-day counts, from broward-county-fl-commercial-<as_of>.json), license
//   public/how-atlasprop-works.html    AtlasProp: Broward's residential record (the residential charts and filings, from
//                                      broward-county-fl-residential-<as_of>.json)
//   public/how-atlastrade-works.html   AtlasTrade: the Capitol Region's homes (the housing map and the trade figures, from
//                                      capitol-region-ct-trade-<as_of>.json)
//
// The snapshots are written by scripts/_land6_snapshot.py; nothing numeric is typed in here. The strip, head, header and
// closing row are scripts/_land6_shared.tsx, shared with the AtlasLand page; the map, charts, figures and found counts are
// the County Catalog's components ported to components/county-report/. Rendered with react-dom/server; no script runs in
// the browser.
//
// Rules applied: at most two sentences of prose per section; the word "public" never appears in the pages' own copy
// (asserted); no customer named; red nowhere; carbon once (the Atlas node of the diagram and one panel) and blueline once
// (intake and terms) on the company page, each view page's closing section on blueline.

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import type { CountyReport, ResidentialFound } from '@/components/county-report/report-types'
import { ReportCharts, ReportFoundView, ReportMapView } from '@/components/county-report/report-view'
import type { CatalogLicense, CatalogScore } from '@/components/county-report/score-block'
import { REPO, Head, Header, TabStrip, Section, Close, ROOT_STYLE, designCss, markDataUri, assertNoWord, newest, dLong, monthYear, n } from './_land6_shared'

// ── snapshot shapes ───────────────────────────────────────────────────────────────────────

type National = {
  as_of: string; width: number; height: number; counties_profiled: number; counties_scored: number; counties_drawn: number; computed_at: string | null
  classes: { cls: number; lo: number; hi: number }[]; states: string
  counties: { fips: string; name: string; state: string; score: number | null; rank: number | null; cls: number; d: string }[]
}
type CountyBase = { as_of: string; view: string; fips: string; name: string; short: string; score: CatalogScore | null; license: CatalogLicense | null; report: CountyReport }
type Commercial = CountyBase & { commercial_record: { properties: number; owner_entities: number; source: string } }
type Residential = CountyBase & { residential_found: ResidentialFound | null; profile_built_at: string | null }
type Trade = Residential & { trade: { homes: number; single_family: number; roof_over_25: number; roof_prime_20_25: number; roof_recently_replaced: number; new_owners: number; towns: number; source: string; filters: string[] } }

const DATA = path.join(REPO, 'public', 'data')
function load<T>(prefix: string): T {
  const f = newest(DATA, prefix)
  if (!f) throw new Error(`no ${prefix}-<date>.json under public/data; run scripts/_land6_snapshot.py`)
  return JSON.parse(readFileSync(f, 'utf8')) as T
}

// ── page styles ───────────────────────────────────────────────────────────────────────────

const COMPANY_CSS = `
/* § 01 the diagram */
.om-dg { margin: 0; display: flex; flex-direction: column; gap: 12px; }
.om-dg svg { display: block; width: 100%; height: auto; }
.om-dg svg.om-dg__tall { display: none; }
.om-dg .dg-col { font: 400 11px/1 var(--font-mono); fill: var(--fg-3); letter-spacing: 0.04em; }
.om-dg .dg-box { fill: var(--bg-raised); stroke: var(--rule-strong); stroke-width: 1; }
.om-dg .dg-atlas { fill: var(--carbon-800); stroke: none; }
.om-dg .dg-t { font: 400 14px/1 var(--font-sans); fill: var(--fg-1); }
.om-dg .dg-t.is-view { font-weight: 500; }
.om-dg .dg-m { font: 400 10.5px/1 var(--font-mono); fill: var(--fg-3); }
.om-dg .dg-atlas-t { font: 500 20px/1 var(--font-sans); fill: var(--paper-100); }
.om-dg .dg-atlas-m { font: 400 11px/1 var(--font-mono); fill: var(--blueline-300); }
.om-dg .dg-edge { fill: none; stroke: var(--rule-strong); stroke-width: 1.25; }
.om-dg .dg-edge.is-in { marker-end: url(#dg-arrow); }
.om-dg .dg-edge.is-out { marker-end: url(#dg-arrow); }
.om-dg .dg-arrow { fill: var(--fg-2); }

/* § 02 the national map */
.nm { margin: 0; display: flex; flex-direction: column; gap: 14px; }
.nm__frame { position: relative; width: 100%; overflow: hidden; border: 1px solid var(--rule); border-radius: var(--radius-md); background: var(--bg-sunken); }
.nm__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.nm__c { stroke: color-mix(in oklab, var(--ink-900) 32%, transparent); stroke-width: 0.45; vector-effect: non-scaling-stroke; }
.nm__c.s0 { fill: color-mix(in oklab, var(--fg-1) 9%, var(--bg-raised)); }
.nm__c.s1, .nm-sw.s1 { fill: var(--green-100); }
.nm__c.s2, .nm-sw.s2 { fill: color-mix(in oklab, var(--green-300) 75%, var(--green-100)); }
.nm__c.s3, .nm-sw.s3 { fill: color-mix(in oklab, var(--green-600) 44%, var(--green-300)); }
.nm__c.s4, .nm-sw.s4 { fill: color-mix(in oklab, var(--green-700) 26%, var(--green-600)); }
.nm__c.s5, .nm-sw.s5 { fill: color-mix(in oklab, var(--ink-900) 38%, var(--green-700)); }
.nm__states { fill: none; stroke: var(--fg-1); stroke-width: 1; vector-effect: non-scaling-stroke; }
.nm__caption { display: flex; flex-direction: column; gap: 10px; }
.nm__line { margin: 0; font: 400 14px/1.5 var(--font-sans); color: var(--fg-1); }
.nm__key { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; font: 400 var(--fs-micro)/1.4 var(--font-mono); color: var(--fg-2); }
.nm__key li { display: inline-flex; align-items: center; gap: 6px; }
.nm-sw { stroke: color-mix(in oklab, var(--ink-900) 32%, transparent); stroke-width: 1; }

/* § 03 what a license includes */
.om-lic { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px 28px; }
.om-lic li { border-top: 1px solid var(--rule-ink); padding-top: 14px; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.om-lic .rp-title { font-size: 19px; }
.om-lic .rp-body { color: var(--fg-2); }

/* § 04 intake: the five steps, then price, sign and go live */
.om-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0 28px; }
.om-step { position: relative; padding-top: 32px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.om-step::before { content: ""; position: absolute; top: 8px; left: 18px; right: -28px; border-top: 1px solid var(--rule-strong); }
.om-step:last-child::before { display: none; }
.om-node { position: absolute; left: 0; top: 0; width: 17px; height: 17px; border-radius: 50%; box-sizing: border-box; background: var(--bg); border: 1.5px solid var(--fg-2); }
.om-step.is-then .om-node { background: var(--fg-1); border-color: var(--fg-1); }
.om-step .rp-figure-s { font-size: 14px; }
.om-step .rp-title { font-size: 16px; line-height: 1.3; }
.om-step .rp-body { font-size: 14px; line-height: 1.5; }
.om-then { list-style: none; margin: 36px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 28px; }
.om-then .om-step::before { border-top-color: var(--fg-2); }

/* § 05 terms */
.om-terms { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px 28px; }
.om-term { border-top: 1px solid var(--rule-ink); padding-top: 14px; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.om-term .rp-title-s { font-size: 15px; }
.om-term .rp-body { font-size: 15px; color: var(--fg-1); }
.om-term .rp-body + .rp-body { color: var(--fg-2); }

@media (max-width: 900px) {
  .om-lic { grid-template-columns: minmax(0, 1fr); }
  .om-steps, .om-then { grid-template-columns: minmax(0, 1fr); row-gap: 0; }
  .om-then { margin-top: 8px; }
  .om-step { padding: 0 0 24px 40px; }
  .om-step::before { top: 22px; bottom: 0; left: 8px; right: auto; border-top: 0; border-left: 1px solid var(--rule-strong); }
  .om-step:last-child::before { display: none; }
  .om-terms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) { .om-dg svg.om-dg__wide { display: none; } .om-dg svg.om-dg__tall { display: block; } }
@media (max-width: 560px) { .om-terms { grid-template-columns: minmax(0, 1fr); } }
`

const VIEW_CSS = `
/* § 01 what the view is for: the record it reads, who uses it */
.om-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 48px; }
.om-col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.om-col .rp-title { font-size: 19px; }
.om-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.om-list li { padding: 11px 0; border-top: 1px solid var(--rule); font: 400 16px/1.45 var(--font-sans); color: var(--fg-1); }
.om-list li:last-child { border-bottom: 1px solid var(--rule); }
.om-list li .rp-label { display: block; margin-top: 2px; }

/* § 02 one county: the figure beside the figures */
.om-ex { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 32px 48px; align-items: start; }
.om-ex__side { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.om-ex__side .rp-title-s { font-size: 15px; }
.om-ex .cr-facts dt { font-size: var(--fs-small); }
.om-ex .cr-facts dd { font-size: var(--fs-small); }
.om-ex .cr-found__window { color: var(--fg-2); }
.om-ex .cr-charts { gap: 20px 24px; }

/* § 03 license and terms */
.om-lic { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px 28px; }
.om-lic li { border-top: 1px solid var(--rule-ink); padding-top: 14px; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.om-lic .rp-title { font-size: 19px; }
.om-lic .rp-body { color: var(--fg-2); }
.om-more { margin: 28px 0 0; font: 400 15px/1.5 var(--font-sans); color: var(--fg-2); }
.om-more a { color: var(--fg-1); text-decoration: underline; text-underline-offset: 3px; }

@media (max-width: 900px) { .om-two, .om-ex, .om-lic { grid-template-columns: minmax(0, 1fr); } }
`

// ── the company page ──────────────────────────────────────────────────────────────────────

const RECORDS = ['Boards and meetings', 'Land and owners', 'Infrastructure and growth']
const VIEWS: [string, string][] = [['AtlasLand', 'land and jurisdiction records'], ['AtlasCRE', 'commercial property and deals'], ['AtlasProp', 'residential ownership and filings'], ['AtlasTrade', 'residential suitability for trades']]

/** § 01: county records into Atlas, four views out. Two drawings, one for wide screens and one for a phone. */
function Diagram() {
  const aria = `County records (${RECORDS.join(', ')}) flow into Atlas, the platform, and out of it as four views: ${VIEWS.map((v) => v[0]).join(', ')}.`
  const arrow = <defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path className="dg-arrow" d="M0 0 L10 5 L0 10 z" /></marker></defs>
  const wide = (() => {
    const rec = RECORDS.map((_, i) => 62 + i * 88)
    const views = VIEWS.map((_, i) => 53 + i * 72)
    return (
      <svg className="om-dg__wide" viewBox="0 0 960 300" aria-hidden="true">
        {arrow}
        <text className="dg-col" x="20" y="18">COUNTY RECORDS</text>
        <text className="dg-col" x="400" y="18">ATLAS</text>
        <text className="dg-col" x="700" y="18">VIEWS</text>
        {rec.map((cy, i) => <path key={`e${i}`} className="dg-edge is-in" d={`M270 ${cy} C335 ${cy} 335 150 400 150`} />)}
        {views.map((cy, i) => <path key={`o${i}`} className="dg-edge is-out" d={`M570 150 C635 150 635 ${cy} 700 ${cy}`} />)}
        {rec.map((cy, i) => (
          <g key={RECORDS[i]}>
            <rect className="dg-box" x="20" y={cy - 26} width="250" height="52" rx="3" />
            <text className="dg-t" x="36" y={cy + 5}>{RECORDS[i]}</text>
          </g>
        ))}
        <rect className="dg-atlas" x="400" y="90" width="170" height="120" rx="4" />
        <text className="dg-atlas-t" x="485" y="146" textAnchor="middle">Atlas</text>
        <text className="dg-atlas-m" x="485" y="172" textAnchor="middle">the platform</text>
        {views.map((cy, i) => (
          <g key={VIEWS[i][0]}>
            <rect className="dg-box" x="700" y={cy - 23} width="240" height="46" rx="3" />
            <text className="dg-t is-view" x="716" y={cy - 1}>{VIEWS[i][0]}</text>
            <text className="dg-m" x="716" y={cy + 15}>{VIEWS[i][1]}</text>
          </g>
        ))}
      </svg>
    )
  })()
  const tall = (() => {
    const rec = RECORDS.map((_, i) => 52 + i * 54)
    const views = VIEWS.map((_, i) => 390 + i * 60)
    return (
      <svg className="om-dg__tall" viewBox="0 0 360 620" aria-hidden="true">
        {arrow}
        <text className="dg-col" x="20" y="16">COUNTY RECORDS</text>
        {rec.map((cy, i) => (
          <g key={RECORDS[i]}>
            <rect className="dg-box" x="20" y={cy - 22} width="320" height="44" rx="3" />
            <text className="dg-t" x="36" y={cy + 5}>{RECORDS[i]}</text>
          </g>
        ))}
        <path className="dg-edge is-in" d="M180 182 L180 228" />
        <text className="dg-col" x="20" y="222">ATLAS</text>
        <rect className="dg-atlas" x="20" y="232" width="320" height="86" rx="4" />
        <text className="dg-atlas-t" x="180" y="270" textAnchor="middle">Atlas</text>
        <text className="dg-atlas-m" x="180" y="296" textAnchor="middle">the platform</text>
        <path className="dg-edge is-out" d="M180 318 L180 364" />
        <text className="dg-col" x="20" y="358">VIEWS</text>
        {views.map((cy, i) => (
          <g key={VIEWS[i][0]}>
            <rect className="dg-box" x="20" y={cy - 22} width="320" height="44" rx="3" />
            <text className="dg-t is-view" x="36" y={cy + 1}>{VIEWS[i][0]}</text>
            <text className="dg-m" x="36" y={cy + 16}>{VIEWS[i][1]}</text>
          </g>
        ))}
      </svg>
    )
  })()
  return (
    <figure className="om-dg" data-om="diagram" role="img" aria-label={aria}>
      {wide}
      {tall}
    </figure>
  )
}

function WhatItIs() {
  return (
    <Section num={1} surface="paper" id="what" title="What Red Planet Data is."
      lead="Red Planet Data brings counties online and licenses the county record through Atlas, its platform. Four views read that record; AtlasLand and AtlasCRE first.">
      <Diagram />
    </Section>
  )
}

/** § 02: the County Catalog's national map, shaded by overall score, as the catalog draws it. */
function EveryCounty({ nat }: { nat: National }) {
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`
  void pct
  const computed = nat.computed_at ? nat.computed_at.slice(0, 10) : null
  const aria = `Map of the United States with every county shaded by its County Catalog score, in five classes from ${nat.classes[0]?.lo} to ${nat.classes[nat.classes.length - 1]?.hi}.`
  return (
    <Section num={2} surface="paper" id="counties" title="Every county, looked at."
      lead="The County Catalog profiles and scores every county, so a license can begin anywhere.">
      <figure className="nm" data-om="national-map">
        <div className="nm__frame" style={{ aspectRatio: `${nat.width} / ${nat.height}` }} role="img" aria-label={aria}>
          <svg className="nm__svg" viewBox={`0 0 ${nat.width} ${nat.height}`} aria-hidden="true">
            {nat.counties.map((c) => <path key={c.fips} className={`nm__c s${c.cls}`} d={c.d} data-fips={c.fips} />)}
            <path className="nm__states" d={nat.states} />
          </svg>
        </div>
        <figcaption className="nm__caption">
          <p className="nm__line" data-om="national-caption">{n(nat.counties_profiled)} counties profiled and scored by the County Catalog{computed ? `; scores computed ${dLong(computed)}` : ''}.</p>
          <ul className="nm__key" aria-label="Overall score" data-om="national-key">
            {nat.classes.map((c) => (
              <li key={c.cls}><svg width="16" height="10" aria-hidden="true"><rect className={`nm-sw s${c.cls}`} x="1" y="1" width="14" height="8" /></svg>{Math.round(c.lo)} to {Math.round(c.hi)}</li>
            ))}
            <li>overall score, 0 to 100</li>
          </ul>
        </figcaption>
      </figure>
    </Section>
  )
}

function LicenseIncludes() {
  const items: [string, string][] = [
    ['The county record', 'Every record Atlas holds for the county: boards and meetings, land and owners, infrastructure and growth.'],
    ['Every view that applies', 'AtlasLand, AtlasCRE, AtlasProp and AtlasTrade, each where it applies to the county, at no extra charge.'],
    ['Seats', 'In blocks of 10 for an organization, or one seat for an individual; each seat is a company email.'],
  ]
  return (
    <Section num={3} surface="paper" id="license" title="What a license includes."
      lead="A license names counties and seats. Everything that applies to those counties comes with it.">
      <ul className="om-lic" data-om="license">
        {items.map(([a, b]) => <li key={a}><h3 className="rp-title" style={{ margin: 0 }}>{a}</h3><p className="rp-body" style={{ margin: 0 }}>{b}</p></li>)}
      </ul>
    </Section>
  )
}

const STEPS: [string, string][] = [
  ['Map the county', 'Every board that decides land, in the county and its towns.'],
  ['Collect the record', 'Several years of agendas, packets and minutes, plus the land records.'],
  ['Read it into cases', 'Each value tied to its document and page.'],
  ['Add what is coming', 'Road funding, capacity decisions, annexations, fee studies, rule changes.'],
  ['State the coverage', 'Which boards are in, from when, and what is not available.'],
]
const THEN: [string, string][] = [
  ['Price', 'Atlas prices the license by county and seats; the same price built or not.'],
  ['Sign', 'Twelve months, paid in advance, with Red Planet Data, Inc.'],
  ['Go live', 'Access opens in days to weeks; the first 30 days of a new county are included in full.'],
]

function Intake() {
  const step = (a: string, b: string, i: number, then: boolean) => (
    <li key={a} className={`om-step${then ? ' is-then' : ''}`}><span className="om-node" aria-hidden="true"></span><span className="rp-figure-s" style={{ color: 'var(--fg-3)' }}>{then ? `then ${i + 1}` : i + 1}</span>
      <h3 className="rp-title" style={{ margin: 0 }}>{a}</h3><p className="rp-body" style={{ margin: 0, color: 'var(--fg-2)' }}>{b}</p></li>
  )
  return (
    <Section num={4} surface="blueline" id="intake" title="Intake."
      lead="Every county goes through the same five steps, so almost any county is online in days to weeks. Then price, sign and go live.">
      <ol className="om-steps" data-om="steps">{STEPS.map(([a, b], i) => step(a, b, i, false))}</ol>
      <ol className="om-then" data-om="then">{THEN.map(([a, b], i) => step(a, b, i, true))}</ol>
    </Section>
  )
}

const TERMS: [string, string, string][] = [
  ['Ownership', 'Red Planet Data owns all data', 'Customers license the data, never own it. Every agreement is signed with Red Planet Data, Inc.'],
  ['Term', '12-month minimum, paid up front', 'The license renews each year, and customers can add counties or seats at any time.'],
  ['Seats', 'One company email per seat', 'Seats can be shared or charged for inside the organization, but never resold outside it.'],
  ['Coverage', 'Almost any county, online in days to weeks', 'Every county is priced the same way, built or not.'],
]

function Terms({ mark }: { mark: string }) {
  return (
    <Section num={5} surface="paper" id="terms" title="Terms." lead="One seat or hundreds, every agreement follows the same four rules.">
      <div className="om-terms" data-om="terms">
        {TERMS.map(([h, a, b]) => <div key={h} className="om-term"><span className="rp-title-s">{h}</span><p className="rp-body" style={{ margin: 0 }}>{a}</p><p className="rp-body" style={{ margin: 0 }}>{b}</p></div>)}
      </div>
      <Close mark={mark} />
    </Section>
  )
}

function CompanyPage({ nat, mark, css }: { nat: National; mark: string; css: string }) {
  const asOf = nat.as_of
  return (
    <html lang="en">
      <Head title="How Red Planet Works | Red Planet Data" mark={mark} css={css} pageCss={COMPANY_CSS}
        description="Red Planet Data brings counties online and licenses the county record through Atlas, its platform: every county profiled, what a license includes, intake and terms." />
      <body>
        <div className="rp-root om" data-product="red-planet" style={ROOT_STYLE}>
          <Header mark={mark} title="How Red Planet Works" right={<p className="rp-label" style={{ margin: 0, flex: '0 1 auto', minWidth: 0 }}>{monthYear(asOf)} · as of {asOf}</p>} />
          <TabStrip current="/how-red-planet-works" />
          <WhatItIs />
          <EveryCounty nat={nat} />
          <LicenseIncludes />
          <Intake />
          <Terms mark={mark} />
        </div>
      </body>
    </html>
  )
}

// ── the view pages ────────────────────────────────────────────────────────────────────────

type ViewSpec = {
  view: string; href: string; title: string; description: string
  forLead: string; reads: [string, string][]; users: [string, string][]
  county: string; exampleLead: string; figure: ReactNode; figures: ReactNode; caption: string
  licenseLead: string
}

function Figures({ rows, title }: { rows: [string, string][]; title: string }) {
  return (
    <div>
      <h3 className="rp-title-s" style={{ margin: '0 0 8px' }}>{title}</h3>
      <dl className="cr-facts" data-om="figures">
        {rows.map(([a, b]) => <div key={a} className="cr-facts__row"><dt>{a}</dt><dd>{b}</dd></div>)}
      </dl>
    </div>
  )
}

const LICENSE_ITEMS: [string, string][] = [
  ['The county record', 'Every record Atlas holds for the county comes with the license.'],
  ['Every view that applies', 'This view and the other three, each where it applies, at no extra charge.'],
  ['Seats', 'In blocks of 10 for an organization, or one seat for an individual.'],
]

function ViewPage({ s, mark, css }: { s: ViewSpec; mark: string; css: string }) {
  const list = (items: [string, string][]) => <ul className="om-list">{items.map(([a, b]) => <li key={a}>{a}<span className="rp-label">{b}</span></li>)}</ul>
  return (
    <html lang="en">
      <Head title={`${s.title} | Red Planet Data`} mark={mark} css={css} pageCss={VIEW_CSS} description={s.description} />
      <body>
        <div className="rp-root om" data-product="red-planet" style={ROOT_STYLE}>
          <Header mark={mark} title={s.title} right={<p className="rp-label" style={{ margin: 0, flex: '0 1 auto', minWidth: 0 }}>{monthYear(s.caption.slice(-10))} · as of {s.caption.slice(-10)}</p>} />
          <TabStrip current={s.href} />
          <Section num={1} surface="paper" id="for" title={`What ${s.view} is for.`} lead={s.forLead}>
            <div className="om-two">
              <div className="om-col"><h3 className="rp-title" style={{ margin: 0 }}>What it reads</h3>{list(s.reads)}</div>
              <div className="om-col"><h3 className="rp-title" style={{ margin: 0 }}>Who uses it</h3>{list(s.users)}</div>
            </div>
          </Section>
          <Section num={2} surface="paper" id="county" title={`${s.county}, as Atlas holds it.`} lead={s.exampleLead}>
            <div className="om-ex">
              <div className="om-ex__figure">{s.figure}</div>
              <aside className="om-ex__side" aria-label="Figures">{s.figures}</aside>
            </div>
            <p className="om-cap" data-om="example-caption">{s.caption}</p>
          </Section>
          <Section num={3} surface="blueline" id="license" title="License and terms." lead={s.licenseLead}>
            <ul className="om-lic" data-om="license">
              {LICENSE_ITEMS.map(([a, b]) => <li key={a}><h3 className="rp-title" style={{ margin: 0 }}>{a}</h3><p className="rp-body" style={{ margin: 0 }}>{b}</p></li>)}
            </ul>
            <p className="om-more">What a license includes, intake and the terms are on the company page: <a href="/how-red-planet-works#license">what a license includes</a> and <a href="/how-red-planet-works#terms">terms</a>.</p>
            <Close mark={mark} />
          </Section>
        </div>
      </body>
    </html>
  )
}

const d365 = (f: ResidentialFound | null, kind: string) => f?.items.find((i) => i.kind === kind && i.d365_status === 'counted')?.d365 ?? null
const d90 = (f: ResidentialFound | null, kind: string) => f?.items.find((i) => i.kind === kind && i.d90_status === 'counted')?.d90 ?? null

function creSpec(c: Commercial): ViewSpec {
  const found = c.report.found
  const counted = found?.items.filter((i) => i.status === 'counted') ?? []
  if (!found || counted.length < 3) throw new Error('the commercial record snapshot has fewer than three counted items; choose another county')
  const rec = c.commercial_record
  return {
    view: 'AtlasCRE', href: '/how-atlascre-works', title: 'How AtlasCRE Works',
    description: `${c.name} as AtlasCRE holds it: commercial property, owners, sales and the deal pipeline.`,
    forLead: 'AtlasCRE is the county record read for commercial property: the parcels, the owners behind them, the sales, and the deal pipeline of loans, liens, court filings and permits as each is recorded.',
    reads: [['Commercial parcels', 'every commercial property on the roll, with its use and its value'], ['Owners', 'the companies that hold them and the people behind those companies, grouped'], ['Sales', 'each recorded sale with its price, the day the clerk records it'], ['The deal pipeline', 'loans, liens, court filings and permits as they are recorded']],
    users: [['Lenders', 'who is borrowing, against what, and what is going into default'], ['Investors and developers', 'what traded, for how much, and who is assembling'], ['Brokers and REITs', 'owners with activity on more than one property']],
    county: c.name.replace(', Florida', ', Florida').replace(' County, Florida', ' County, FL'),
    exampleLead: `${c.short} County holds the deepest commercial record Atlas has built: ${n(rec.properties)} commercial properties, and the sales, loans, liens and court filings against them, read as each is recorded.`,
    figure: <ReportMapView report={c.report} />,
    figures: (
      <>
        <Figures title="The record" rows={[['Commercial properties', n(rec.properties)], ['Owner entities on the roll', n(rec.owner_entities)]]} />
        <div><h3 className="rp-title-s" style={{ margin: '0 0 8px' }}>The last 90 days</h3><ReportFoundView report={c.report} /></div>
      </>
    ),
    caption: `Figures from the County Catalog's report for ${c.short} County and Atlas's commercial property record, taken ${dLong(c.as_of)}; the 90-day window runs ${dLong(found.window_start)} to ${dLong(found.window_end)}. Snapshot as of ${c.as_of}`,
    licenseLead: 'AtlasCRE comes with the license for any county where Atlas holds the commercial record, at no extra charge.',
  }
}

function propSpec(r: Residential): ViewSpec {
  const f = r.residential_found
  const fc = d365(f, 'foreclosure'), li = d365(f, 'liens')
  if (fc === null || li === null) throw new Error('the residential snapshot has no twelve-month foreclosure or lien count; choose another county')
  const facts = r.report.map?.facts ?? []
  const fact = (label: string) => facts.find((x) => x.label === label)?.value ?? '—'
  return {
    view: 'AtlasProp', href: '/how-atlasprop-works', title: 'How AtlasProp Works',
    description: `${r.name} as AtlasProp holds it: residential ownership and filings.`,
    forLead: 'AtlasProp is the county record read for homes: who owns each one, when it changed hands, and the filings against it, from foreclosure to probate to liens.',
    reads: [['Residential parcels', 'every home on the roll, with its owner and its last sale'], ['Ownership changes', 'each recorded transfer, the day it is recorded'], ['Filings', 'foreclosure, probate, liens, tax certificates and code cases, where the county records them']],
    users: [['Brokerages and agents', 'which homes are changing hands, and which are about to'], ['Investors', 'filings that lead a sale, before the sale'], ['Installers and other vendors', 'new owners and homes with a filing, by town and street']],
    county: r.name.replace(' County, Florida', ' County, FL'),
    exampleLead: `${r.short} County holds the most residential filings in Atlas: ${n(fc)} foreclosure filings and ${n(li)} liens recorded in the last twelve months, each read the day it was recorded.`,
    figure: <ReportCharts report={r.report} note={`${r.short}'s residential record and survey figures, as the County Catalog charts them; the median US county where a comparison exists.`} />,
    figures: (
      <>
        <Figures title="The last twelve months" rows={[['Foreclosure filings', `${n(fc)}${d90(f, 'foreclosure') !== null ? ` (${n(d90(f, 'foreclosure')!)} in 90 days)` : ''}`], ['Liens recorded', `${n(li)}${d90(f, 'liens') !== null ? ` (${n(d90(f, 'liens')!)} in 90 days)` : ''}`]]} />
        <Figures title="The county" rows={[['Residential parcels', fact('Residential parcels')], ['Households', fact('Households')], ['Median home value', fact('Median home value')], ['Homes permitted', fact('Homes permitted')]]} />
      </>
    ),
    caption: `Figures from the County Catalog's residential report for ${r.short} County, taken ${dLong(r.as_of)}; the twelve-month window runs ${dLong(f!.d365[0])} to ${dLong(f!.d365[1])}. Snapshot as of ${r.as_of}`,
    licenseLead: 'AtlasProp comes with the license for any county where Atlas holds the residential record, at no extra charge.',
  }
}

function tradeSpec(t: Trade): ViewSpec {
  const tr = t.trade
  const facts = t.report.map?.facts ?? []
  const fact = (label: string) => facts.find((x) => x.label === label)?.value ?? '—'
  return {
    view: 'AtlasTrade', href: '/how-atlastrade-works', title: 'How AtlasTrade Works',
    description: `${t.name} as AtlasTrade holds it: residential suitability with trade filters for solar, roofing, pool, pest and HVAC.`,
    forLead: `AtlasTrade is the county record read for the trades: every home scored for suitability, with filters for ${tr.filters.slice(0, -1).join(', ')} and ${tr.filters[tr.filters.length - 1]}. A roofer sees the homes whose roofs are due; a solar installer the homes that fit.`,
    reads: [['Every home', 'the roll, the owner, the year built and the last sale'], ['Permits', 'roof, solar, pool and HVAC permits on record, by home'], ['Ownership', 'new owners, owner-occupied homes, individual owners']],
    users: [['Solar installers', 'homes that fit, with no solar permit on record'], ['Roofers', 'roofs past 25 years and roofs in the 20-to-25-year window'], ['Pool, pest and HVAC companies', 'the same homes, filtered for their trade']],
    county: t.name.replace(', Connecticut', ', CT'),
    exampleLead: `The Capitol Region, greater Hartford, holds the most homes AtlasTrade has scored in Connecticut: ${n(tr.homes)} homes across ${n(tr.towns)} towns, ${n(tr.single_family)} of them single-family.`,
    figure: <ReportMapView report={t.report} />,
    figures: (
      <>
        <Figures title="Homes scored" rows={[['Homes', n(tr.homes)], ['Single-family', n(tr.single_family)], ['Towns', n(tr.towns)]]} />
        <Figures title="Roofing and ownership filters" rows={[['Roof past 25 years', n(tr.roof_over_25)], ['Roof in the 20-to-25-year window', n(tr.roof_prime_20_25)], ['Roof recently replaced', n(tr.roof_recently_replaced)], ['New owners', n(tr.new_owners)]]} />
        <Figures title="The region" rows={[['Residential parcels', fact('Residential parcels')], ['Median home value', fact('Median home value')]]} />
      </>
    ),
    caption: `Figures from AtlasTrade's scored homes for the Capitol Planning Region's ${n(tr.towns)} towns and the County Catalog's residential report, taken ${dLong(t.as_of)}. Snapshot as of ${t.as_of}`,
    licenseLead: 'AtlasTrade comes with the license for any county where Atlas holds the residential record, at no extra charge.',
  }
}

// ── build ─────────────────────────────────────────────────────────────────────────────────

function main() {
  const nat = load<National>('national-map')
  const cre = load<Commercial>('broward-county-fl-commercial')
  const prop = load<Residential>('broward-county-fl-residential')
  const trade = load<Trade>('capitol-region-ct-trade')
  const mark = markDataUri()
  const css = designCss()

  const pages: [string, string][] = [
    ['how-red-planet-works.html', '<!doctype html>\n' + renderToStaticMarkup(<CompanyPage nat={nat} mark={mark} css={css} />) + '\n'],
    ['how-atlascre-works.html', '<!doctype html>\n' + renderToStaticMarkup(<ViewPage s={creSpec(cre)} mark={mark} css={css} />) + '\n'],
    ['how-atlasprop-works.html', '<!doctype html>\n' + renderToStaticMarkup(<ViewPage s={propSpec(prop)} mark={mark} css={css} />) + '\n'],
    ['how-atlastrade-works.html', '<!doctype html>\n' + renderToStaticMarkup(<ViewPage s={tradeSpec(trade)} mark={mark} css={css} />) + '\n'],
  ]
  for (const [name, html] of pages) {
    assertNoWord(html, name)
    const out = path.join(REPO, 'public', name)
    writeFileSync(out, html, 'utf8')
    console.log(`wrote public/${name} (${Buffer.byteLength(html).toLocaleString('en-US')} bytes, ${(html.match(/<section class="rp-section"/g) ?? []).length} sections)`)
  }
  console.log(`national map: ${n(nat.counties_profiled)} profiled, ${n(nat.counties_scored)} scored, ${n(nat.counties_drawn)} drawn, computed ${nat.computed_at}, classes ${nat.classes.map((c) => `${c.lo}-${c.hi}`).join(' / ')}, as of ${nat.as_of}`)
  const f = cre.report.found!
  console.log(`AtlasCRE ${cre.name}: ${n(cre.commercial_record.properties)} properties, ${n(cre.commercial_record.owner_entities)} owner entities; ${f.window_start} to ${f.window_end}: ${f.items.filter((i) => i.status === 'counted').map((i) => `${i.label} ${i.count}`).join(', ')}`)
  const pf = prop.residential_found!
  console.log(`AtlasProp ${prop.name}: foreclosure ${d365(pf, 'foreclosure')} / liens ${d365(pf, 'liens')} in ${pf.d365[0]}..${pf.d365[1]}; charts ${prop.report.charts.map((c) => c.title).join(' / ')}; facts ${prop.report.map?.facts.map((x) => `${x.label} ${x.value}`).join(', ')}`)
  console.log(`AtlasTrade ${trade.name}: ${JSON.stringify(trade.trade)}; facts ${trade.report.map?.facts.map((x) => `${x.label} ${x.value}`).join(', ')}`)
}

main()
