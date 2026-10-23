// LAND-5.3 (2026-10-23): build public/how-atlasland-works.html and public/how-atlasland-works/coverage.html from the
// Wilson County snapshot, as a county story in the County Catalog's own components.
//
//   npx tsx --tsconfig scripts/tsconfig.land53.json scripts/_land53_how_atlasland_works.tsx [--snapshot public/data/wilson-county-tn-YYYY-MM-DD.json]
//
// Every number, date, body, item, chart, map path and paragraph on the two pages is read from the newest
// public/data/wilson-county-tn-*.json (written by Levelpie atlas/ops/_land52_wilson_snapshot.py, whose `catalog` part is
// the County Catalog's report exported by atlas-dash scripts/_land53_county_report_export.ts). Typed in here: the
// section headings, the one or two sentences under each, the "How the record is built" lines (LAND-5.3.1), the Today
// and With AtlasLand items, the Intake steps and the Terms.
//
// The components are the catalog's, ported to components/county-report/ (report-view.tsx, score-block.tsx, report.css);
// the head is the Red Planet design package in Git (C:/rpd/packages/red-planet-design: Plat tokens, self-hosted fonts
// embedded, components.css), so each page is one self-contained file served raw from public/ (next.config.mjs rewrites).
// Rendered with react-dom/server; no script runs in the browser.
//
// Rules applied here: the developer is never named (the snapshot carries no applicant); at most two sentences of prose
// per section (an analysis paragraph longer than two sentences is cut to its first two); no table longer than ten rows;
// the word "public" never appears in the pages' own copy, proper names excepted (PROPER_NAMES), and the build asserts it;
// carbon and blueline surfaces once each; red nowhere; the highlight for the marked parcels and the deciding votes.
// LAND-5.2.1/5.2.2 rulings carried over: proper names of boards and statutes keep their wording; Atlas's coverage
// generator keeps the word out of the statement at the source, so the statement is quoted as stored.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import type { CountyReport } from '@/components/county-report/report-types'
import { ReportCharts, ReportComparisonView, ReportMapView } from '@/components/county-report/report-view'
import { ScoreBlock, type CatalogLicense, type CatalogScore, fmtInt } from '@/components/county-report/score-block'

const REPO = process.cwd()
if (!existsSync(path.join(REPO, 'package.json')) || !existsSync(path.join(REPO, 'public'))) throw new Error('run from the red-planet-homepage root')
const DESIGN = 'C:/rpd/packages/red-planet-design'
const PAGE = path.join(REPO, 'public', 'how-atlasland-works.html')
const COVERAGE = path.join(REPO, 'public', 'how-atlasland-works', 'coverage.html')
const FEED_ROWS = 10
const PER_BODY = 3
const TIMELINE_MIN = 6, TIMELINE_MAX = 8

// ── snapshot shapes (the parts this page reads) ───────────────────────────────────────────

type Body = {
  body_id: string; name: string; body_type: string; jurisdiction: string; jurisdiction_kind: string; group: string
  decides_land_use: boolean; captured: boolean; capture_status: string; capture_reason: string | null
  earliest_record: string | null; meetings: number
  posting_lag: { agendas_with_posted_at: number; median_agenda_lead_days: number | null; minutes_with_posted_at: number; median_minutes_lag_days: number | null }
}
type Event = {
  date: string; body: string; kind: string; kind_label: string; action: string | null; action_label: string | null; vote: string | null
  case_type: string; case_type_label: string; request: string | null; acreage: number | null; lots: number | null; parcels: number; deciding: boolean
}
type Item = { date: string; body: string; jurisdiction: string; type: string; description: string; status: string }
type Snapshot = {
  as_of: string
  county: { name: string; state: string; fips: string }
  bodies: Body[]
  totals: { bodies: number; captured: number; not_captured: number; land_use_bodies: number; land_use_captured: number; jurisdictions: number; meetings: number; items: number; documents: number; pages: number; years: { from: string; to: string }; cases: number; case_events: number }
  coverage: { statement: string; opening_paragraph: string } | null
  case: { label: string; jurisdiction: string; parcel_group: string; parcels: number; roll_acreage: number; acreage_stated: number | null; cases: number; events: number; bodies: string[]; first_date: string; last_date: string; elapsed_months: number; timeline: Event[] }
  recent_items: { window: { from: string; to: string }; total: number; items: Item[] }
  upcoming_items: { window: { from: string; to: string }; total: number; items: Item[]; meetings: { date: string; body: string; items: number; agenda_posted_at: string | null }[] }
  monitoring: { parcel_group: { label: string; parcels: number; jurisdiction: string; roll_acreage: number }; window: { from: string; to: string }; neighbour_m: number; near_text_m: number
    items: { date: string; body: string; jurisdiction: string; kind: string; description: string; action: string; vote: string | null; relation: string; distance_m: number }[] }
  catalog: {
    name: string; short: string; score: CatalogScore | null; license: CatalogLicense | null
    narrative: { setting: string; moving: string; favors: string; watch: string; provide: string; written_at: string } | null
    report: CountyReport
  } | null
}

// ── small helpers ─────────────────────────────────────────────────────────────────────────

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dLong = (iso: string) => `${MON[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`
const dShort = (iso: string) => `${MON[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`
const n = (v: number) => v.toLocaleString('en-US')
const g = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100))

// Proper names that happen to contain the word; the check never counts them (LAND-5.2.1 ruling).
const PROPER_NAMES = /\bPublic Infrastructure Committee\b|\bTennessee Public Chapter \d+\b/g
const hasWord = (text: string) => /public/i.test(text.replace(PROPER_NAMES, ''))

/** The first `count` sentences of a paragraph (a sentence ends at . ! or ? followed by a space and a capital, digit or $). */
function sentences(text: string, count: number): string {
  const parts = text.trim().split(/(?<=[.!?])\s+(?=[A-Z$0-9])/)
  return parts.slice(0, count).join(' ')
}

function shortBody(name: string, jurisdiction: string): string {
  let s = name
  for (const p of [`${jurisdiction} `, `City of ${jurisdiction} `]) if (s.startsWith(p)) s = s.slice(p.length)
  return s
}

function shortName(b: Body): string {
  let s = b.name
  for (const p of [`${b.jurisdiction} `, `City of ${b.jurisdiction} `, 'Wilson County Mt. Juliet ']) if (s.startsWith(p)) s = s.slice(p.length)
  s = s.replace(' (County Meetings category: GIS Committee)', ' (GIS)')
    .replace(/^Wilson County Joint Economic and Community Development Board$/, 'Joint Economic Development Board')
    .replace(/^Water & Wastewater Authority of Wilson County Board of Commissioners$/, 'Water and Wastewater Authority')
    .replace(/^Lebanon Special School District Board of Education$/, 'Special School District Board')
    .replace(/^Wilson County Board of Education$/, 'Board of Education (county schools)')
  if (b.jurisdiction_kind === 'utility_district') s = `${b.jurisdiction} Board`
  return s.replace('committees (GIS)', 'GIS Committee').replace('&', 'and')
}

// ── head: fonts and the design package ────────────────────────────────────────────────────

function fontFace(family: string, weight: number, file: string): string {
  const data = readFileSync(path.join(DESIGN, 'fonts', file)).toString('base64')
  return `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url("data:font/woff2;base64,${data}") format("woff2"); }`
}

function designCss(): string {
  const sha = execSync(`git -C "${DESIGN}" rev-parse --short HEAD`, { encoding: 'utf8' }).trim()
  const parts = [`/* Red Planet Data design system, Plat palette, from Icesared79/rpd@${sha} packages/red-planet-design: tokens/colors.css, typography.css, spacing.css, effects.css, components/components.css. Fonts are self-hosted and embedded; nothing loads from the network. */`]
  for (const rel of ['tokens/colors.css', 'tokens/typography.css', 'tokens/spacing.css', 'tokens/effects.css', 'components/components.css']) {
    parts.push(readFileSync(path.join(DESIGN, rel), 'utf8').replace(/\r\n/g, '\n'))
  }
  parts.push('/* County report components, ported from atlas-dash (components/county-report/report.css) */')
  parts.push(readFileSync(path.join(REPO, 'components', 'county-report', 'report.css'), 'utf8').replace(/\r\n/g, '\n'))
  return parts.join('\n')
}

const markDataUri = () => 'data:image/svg+xml;base64,' + readFileSync(path.join(DESIGN, 'assets', 'red-planet-mark.svg')).toString('base64')

const PAGE_CSS = `
body { margin: 0; background: var(--paper-100); }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
.om { --section-pad-y: clamp(36px, 4.5vw, 64px); }
.om .rp-section { border-radius: 0; }
.om .rp-section + .rp-section { border-top: 1px solid var(--rule); }
.om .rp-section[data-surface="carbon"], .om .rp-section[data-surface="blueline"] { border-radius: var(--radius-lg); border-top: 0; }
.om-head { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 16px 64px; align-items: end; margin-bottom: 32px; }
.om-head > div { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.om-head .rp-display-m { font-size: clamp(26px, 2.8vw, 38px); }
.om-head .rp-body-l { font-size: 17px; color: var(--fg-2); }
.om-cap { font: 400 13px/1.5 var(--font-sans); color: var(--fg-3); margin: 18px 0 0; }
.om-prose { font: 400 17px/1.55 var(--font-sans); color: var(--fg-1); margin: 0; max-width: 76ch; text-wrap: pretty; }

/* § 01 the county: the region map as the hero, the score block beside it */
.om-hero { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 32px 48px; align-items: start; }
.om-hero .om-prose { margin-top: 28px; }
.cr-score { display: flex; flex-direction: column; gap: 24px; padding-top: 4px; }
.cr-score__metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 20px 24px; }   /* "16 of 3,222" at 28 px mono needs about 200 px */
.cr-score__metrics .rp-metric__value { font-size: 28px; }
.cr-score__metrics .rp-metric__label { font-size: 13px; color: var(--fg-3); }
.cr-score__groups { --row-h: 36px; --cell-px: 0px; --fs-cell: 14px; }
.cr-score__groups caption { padding-left: 0; padding-right: 0; }
.cr-score__groups td { white-space: normal; }

/* § 02 what is moving: the charts, then the neighbors */
.om-moving { display: flex; flex-direction: column; gap: 36px; }
.om-moving .cr-compare__table th:first-child { min-width: 11em; }

/* § 03 the project: eight decisive points on one line, a list below 1000 px */
.om-tl { display: grid; grid-template-columns: repeat(var(--tl-n, 8), minmax(0, 1fr)); gap: 0 10px; margin-top: 12px; position: relative; }
.om-tl::before { content: ""; position: absolute; left: 0; right: 0; top: 7px; border-top: 1.5px solid var(--fg-2); }
.om-tl__pt { position: relative; min-width: 0; padding-top: 26px; font: 400 12.5px/1.4 var(--font-sans); color: var(--fg-1); }
.om-tl__pt::before { content: ""; position: absolute; left: 0; top: 2px; width: 11px; height: 11px; box-sizing: border-box; border-radius: 50%; background: var(--bg); border: 1.5px solid var(--fg-2); }
.om-tl__pt.is-vote::before { background: var(--fg-1); border-color: var(--fg-1); }
.om-tl__pt.is-deciding::before { background: var(--highlight-stroke); border-color: var(--highlight-stroke); box-shadow: 0 0 0 4px var(--highlight-bg); }
.om-tl__pt .tl-role { display: block; font: 400 11px/1.3 var(--font-mono); color: var(--fg-3); margin-bottom: 6px; }
.om-tl__pt .tl-date { display: block; font: 400 12px/1.3 var(--font-mono); color: var(--fg-1); }
.om-tl__pt .tl-body { display: block; color: var(--fg-2); }
.om-tl__pt .tl-act { display: block; margin-top: 4px; }
.om-tl__pt.is-deciding .tl-act { color: var(--highlight); font-weight: 500; }
.om-tl__pt .tl-vote { display: block; font: 400 12px/1.3 var(--font-mono); color: var(--fg-2); margin-top: 2px; }
.om-tl-v { display: none; list-style: none; margin: 8px 0 0; padding: 0; position: relative; }
.om-tl-v::before { content: ""; position: absolute; left: 7px; top: 8px; bottom: 8px; border-left: 1.5px solid var(--fg-2); }
.om-tl-v li { position: relative; padding: 0 0 16px 30px; font: 400 14px/1.4 var(--font-sans); }
.om-tl-v li::before { content: ""; position: absolute; left: 2px; top: 5px; width: 11px; height: 11px; box-sizing: border-box; border-radius: 50%; background: var(--bg); border: 1.5px solid var(--fg-2); }
.om-tl-v li.is-vote::before { background: var(--fg-1); border-color: var(--fg-1); }
.om-tl-v li.is-deciding::before { background: var(--highlight-stroke); border-color: var(--highlight-stroke); box-shadow: 0 0 0 4px var(--highlight-bg); }
.om-tl-v li .tl-role { display: block; font: 400 11px/1.3 var(--font-mono); color: var(--fg-3); }
.om-tl-v li .tl-date { font-family: var(--font-mono); font-size: 13px; }
.om-tl-v li .tl-body { color: var(--fg-2); }
.om-tl-v li.is-deciding .tl-act { color: var(--highlight); font-weight: 500; }
.om-tl-v li .tl-vote { font: 400 12px/1.3 var(--font-mono); color: var(--fg-2); }

/* § 04 the first screen: one Atlas panel, compact */
.om-screen .rp-panel { background: var(--bg-raised); }
.om-screen .rp-panel__head { padding: 12px 16px; }
.om-screen .rp-panel__title { font-size: 15px; }
.om-screen .rp-panel__meta { font: 400 11px/1.3 var(--font-mono); color: var(--fg-3); }
.om-screen .rp-table td { white-space: normal; height: auto; padding: 9px 10px; vertical-align: top; font-size: 13px; line-height: 1.35; }   /* compact density sets nowrap; these cells wrap */
.om-screen .rp-table th { height: 30px; }
.om-screen .rp-table .is-date { white-space: nowrap; }
.om-screen .rp-table .is-status { white-space: nowrap; }
.om-screen .rp-panel__foot { font: 400 12px/1.4 var(--font-sans); color: var(--fg-3); }

/* § 05 watching a parcel */
.om-mark { display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: baseline; padding: 12px 16px; margin-bottom: 4px; background: var(--highlight-bg); box-shadow: inset 2px 0 0 var(--highlight-stroke); border-radius: var(--radius-xs); }
.om-mark .rp-title-s { color: var(--highlight); font-size: 15px; }
.om-mon { list-style: none; margin: 0; padding: 0; }
.om-mon li { display: grid; grid-template-columns: 110px minmax(0, 1fr) 150px; gap: 6px 20px; padding: 12px 0; border-bottom: 1px solid var(--rule); font: 400 14px/1.4 var(--font-sans); align-items: baseline; }
.om-mon li .mon-body { color: var(--fg-2); display: block; font-size: 13px; }
.om-mon li .mon-right { text-align: right; }
.om-mon li .mon-right .rp-label { display: block; font-size: 11px; }

/* § 06 who decides: counts by jurisdiction and type */
.om-who { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 24px 28px; }
.om-who__group { min-width: 0; border-top: 1px solid var(--rule-ink); padding-top: 12px; }
.om-who__group .rp-title-s { font-size: 15px; }
.om-who__count { font: 400 12px/1.3 var(--font-mono); color: var(--fg-3); margin: 4px 0 10px; }
.om-who__types { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.om-who__types li { display: flex; align-items: center; gap: 8px; font: 400 13px/1.3 var(--font-sans); color: var(--fg-1); }
.om-who__types li svg { width: 12px; height: 12px; flex: none; display: block; }
.om-who__types li svg * { fill: var(--fg-1); stroke: var(--fg-1); stroke-width: 1.25; }
.om-who__types li .rp-mono { color: var(--fg-3); font-size: 12px; margin-left: auto; }
.om-nocap { list-style: none; margin: 28px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 32px; }
.om-nocap li { padding: 12px 0; border-top: 1px solid var(--rule); font: 400 14px/1.45 var(--font-sans); }
.om-nocap li .rp-label { display: block; margin-top: 2px; font-size: 12px; }
.om-more { margin: 24px 0 0; font: 400 14px/1.5 var(--font-sans); color: var(--fg-2); }
.om-more a { color: var(--fg-1); text-decoration: underline; text-underline-offset: 3px; }

/* § 07 today and with AtlasLand */
.om-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 48px; }
.om-col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.om-col .rp-title { font-size: 19px; }
.om-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.om-list li { padding: 11px 0; border-top: 1px solid var(--rule); font: 400 16px/1.45 var(--font-sans); color: var(--fg-1); }
.om-list li:last-child { border-bottom: 1px solid var(--rule); }
.om-list li .rp-label { display: block; margin-top: 2px; }

/* § 08 how the record is built */
.om-built { list-style: none; margin: 0; padding: 0; counter-reset: built; }
.om-built li { display: grid; grid-template-columns: 2.5em minmax(0, 1fr); gap: 0 12px; padding: 14px 0; border-top: 1px solid var(--rule); font: 400 16px/1.5 var(--font-sans); color: var(--fg-1); counter-increment: built; }
.om-built li:last-child { border-bottom: 1px solid var(--rule); }
.om-built li::before { content: counter(built, decimal-leading-zero); font: 400 13px/1.9 var(--font-mono); color: var(--fg-3); }
.om-built li b { font-weight: 500; }

/* § 09 intake and terms, close */
.om-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0 28px; }
.om-step { position: relative; padding-top: 32px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.om-step::before { content: ""; position: absolute; top: 8px; left: 18px; right: -28px; border-top: 1px solid var(--rule-strong); }
.om-step:last-child::before { display: none; }
.om-node { position: absolute; left: 0; top: 0; width: 17px; height: 17px; border-radius: 50%; box-sizing: border-box; background: var(--bg); border: 1.5px solid var(--fg-2); }
.om-step .rp-figure-s { font-size: 14px; }
.om-step .rp-title { font-size: 16px; line-height: 1.3; }
.om-step .rp-body { font-size: 14px; line-height: 1.5; }
.om-terms { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 28px; margin-top: 44px; }
.om-term { border-top: 1px solid var(--rule-ink); padding-top: 14px; min-width: 0; }
.om-close { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--rule-ink); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; }
.om-row { display: flex; align-items: center; gap: 14px; min-width: 0; }

/* the coverage page */
.om-cov { margin-top: 8px; }
.om-cov .rp-table td { white-space: normal; height: 34px; font-size: 13px; }
.om-cov .rp-table th { height: 30px; }
.om-cov .rp-table td.is-right, .om-cov .rp-table th.is-right { text-align: right; }
.om-cov .cov-j { color: var(--fg-3); font-size: 12px; display: block; }
.om-back { font: 400 13px/1.3 var(--font-mono); color: var(--fg-2); text-decoration: none; }
.om-back:hover { color: var(--fg-1); }

@media (max-width: 1000px) {
  .om-tl { display: none; }
  .om-tl-v { display: block; }
  .om-who { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .om-head, .om-two, .om-hero, .om-nocap { grid-template-columns: minmax(0, 1fr); }
  .om-head { margin-bottom: 24px; }
  .om-terms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .om-steps { grid-template-columns: minmax(0, 1fr); row-gap: 0; }
  .om-step { padding: 0 0 24px 40px; }
  .om-step::before { top: 22px; bottom: 0; left: 8px; right: auto; border-top: 0; border-left: 1px solid var(--rule-strong); }
  .om-step:last-child::before { display: none; }
}
@media (max-width: 700px) {
  .om-who { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .om-screen .rp-table thead { display: none; }
  .om-screen .rp-table, .om-screen .rp-table tbody, .om-screen .rp-table tr, .om-screen .rp-table td { display: block; width: 100%; box-sizing: border-box; }
  .om-screen .rp-table tr { padding: 10px 12px; border-bottom: 1px solid var(--rule); }
  .om-screen .rp-table td { padding: 1px 0; border: 0; }
  .om-screen .rp-table td.is-meta { display: inline; padding-right: 10px; }
  .om-mon li { grid-template-columns: minmax(0, 1fr); gap: 2px; }
  .om-mon li .mon-right { text-align: left; }
  .om-mon li .mon-right .rp-label { display: inline; margin-left: 8px; }
  .om-cov .rp-table thead { display: none; }
  .om-cov .rp-table, .om-cov .rp-table tbody, .om-cov .rp-table tr, .om-cov .rp-table td, .om-cov .rp-table caption { display: block; width: 100%; box-sizing: border-box; }
  .om-cov .rp-table tr { padding: 10px 0; border-bottom: 1px solid var(--rule); }
  .om-cov .rp-table td { height: auto; padding: 1px 0; border: 0; font-size: 13px; }
  .om-cov .rp-table td.is-mono, .om-cov .rp-table td.is-lag { display: inline; padding-right: 10px; }
  .om-cov .rp-table td.is-right { text-align: left; }
  .om-cov .rp-table td[data-l]::before { content: attr(data-l) " "; color: var(--fg-3); font-family: var(--font-mono); font-size: 11px; }
  .om-cov .rp-table caption { padding: 12px 0 0; }
}
@media (max-width: 560px) { .om-terms { grid-template-columns: minmax(0, 1fr); } .om-who { grid-template-columns: minmax(0, 1fr); }
  .cr-score__metrics { grid-template-columns: minmax(0, 1fr); }   /* two 167 px cells cannot hold "16 of 3,222" at 30 px; one column can */
  .cr-score__metrics .rp-metric__value { font-size: 26px; } }
`

// ── the sections ──────────────────────────────────────────────────────────────────────────

function Section({ num, surface, id, title, lead, children }: { num: number; surface: 'paper' | 'carbon' | 'blueline'; id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="rp-section" data-surface={surface === 'paper' ? undefined : surface} id={id}>
      <div className="rp-section__inner">
        <div className="om-head">
          <div>
            <span className="rp-eyebrow rp-eyebrow--muted">§ {String(num).padStart(2, '0')}</span>
            <h2 className="rp-display-m" style={{ margin: 0 }}>{title}</h2>
          </div>
          {lead && <p className="rp-body-l" style={{ margin: 0 }}>{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

/** The mark's label on the map is the parcel group's first part ("Tax Map 68"), so it does not run across the county's own label. */
const shortMarks = (r: CountyReport): CountyReport =>
  r.map?.marks ? { ...r, map: { ...r.map, marks: r.map.marks.map((k) => ({ ...k, label: k.label ? k.label.split(',')[0] : k.label })) } } : r

/** § 01: the region map as the hero, the catalog's score, rank and band beside it, the setting paragraph under it. */
function TheCounty({ snap }: { snap: Snapshot }) {
  const c = snap.catalog!
  return (
    <Section num={1} surface="paper" id="county" title="The county.">
      <div className="om-hero">
        <div className="om-hero__map"><ReportMapView report={shortMarks(c.report)} /></div>
        <aside className="om-hero__side" aria-label="Score, rank and band">
          <ScoreBlock score={c.score} license={c.license} name={c.short} />
        </aside>
      </div>
      {c.narrative && <p className="om-prose" data-om="setting">{sentences(c.narrative.setting, 2)}</p>}
    </Section>
  )
}

/** § 02: the catalog's charts and the what-is-moving paragraph, then the county beside its neighbors. */
function WhatIsMoving({ snap }: { snap: Snapshot }) {
  const c = snap.catalog!
  return (
    <Section num={2} surface="paper" id="moving" title="What is moving.">
      <div className="om-moving">
        {c.narrative && <p className="om-prose" data-om="moving">{sentences(c.narrative.moving, 2)}</p>}
        <ReportCharts report={c.report} note={`${c.short} against the median US county for the same years, as the County Catalog charts it.`} />
        <ReportComparisonView report={c.report} />
      </div>
    </Section>
  )
}

type Point = { role: string; ev: Event }

/** The decisive events only: six to eight points chosen by rule from the full timeline, which stays in the snapshot. */
export function decisiveEvents(tl: Event[]): Point[] {
  const first = (f: (e: Event) => boolean) => tl.find(f)
  const last = (f: (e: Event) => boolean) => [...tl].reverse().find(f)
  const picks: [string, Event | undefined][] = [
    ['First planning recommendation', first((e) => e.kind === 'recommendation')],
    ['Council first reading', first((e) => /council/i.test(e.body) && e.kind === 'first_reading')],
    ['Council vote on the rezoning', first((e) => /council/i.test(e.body) && (e.action ?? '').startsWith('approved'))],
    ['Plan amendment recommended', first((e) => e.kind === 'recommendation' && /land use plan amendment/i.test(e.request ?? ''))],
    ['Preliminary plat approved', first((e) => e.deciding && e.case_type === 'preliminary_plat')],
    ['Final plat approved', first((e) => e.deciding && e.case_type === 'final_plat')],
    ['Plan amendment to the SP recommended', last((e) => e.kind === 'recommendation' && /SP amendment/i.test(e.request ?? ''))],
    ['Latest reading', tl[tl.length - 1]],
  ]
  const seen = new Set<Event>()
  const out: Point[] = []
  for (const [role, ev] of picks) {
    if (!ev || seen.has(ev)) continue
    seen.add(ev)
    out.push({ role, ev })
  }
  out.sort((a, b) => a.ev.date.localeCompare(b.ev.date))
  if (out.length < TIMELINE_MIN || out.length > TIMELINE_MAX) throw new Error(`timeline has ${out.length} points; six to eight are required`)
  return out
}

function actionText(e: Event): string {
  const act = e.action_label ?? e.kind_label
  if (e.kind === 'first_reading' || e.kind === 'second_reading' || e.kind === 'consent' || e.kind === 'recommendation') {
    if (e.action_label && e.action_label.toLowerCase() !== e.kind_label.toLowerCase()) return `${e.kind_label} · ${e.action_label}`
  }
  return act
}

const requestText = (e: Event) => `${e.case_type_label}${e.acreage ? ` · ${g(e.acreage)} ac` : ''}${e.lots ? ` · ${e.lots} lots` : ''}`

/** § 03: the project as its decisive events; the parcels are marked on the hero map. */
function OneProject({ snap, points }: { snap: Snapshot; points: Point[] }) {
  const c = snap.case
  const cls = (e: Event) => (e.deciding ? 'is-deciding' : e.vote ? 'is-vote' : '')
  const deciding = points.filter((p) => p.ev.deciding).length
  return (
    <Section num={3} surface="paper" id="project" title="One project, followed."
      lead={`A residential project on ${c.parcel_group.replace(', three parcels', '')} in ${c.jurisdiction}, marked on the map above, through the ${points.length} events that decided it.`}>
      <div className="om-tl" data-om="timeline" style={{ ['--tl-n' as string]: points.length }}>
        {points.map((p) => (
          <div key={p.ev.date + p.role} className={`om-tl__pt ${cls(p.ev)}`} data-om="timeline-point" data-date={p.ev.date}>
            <span className="tl-role">{p.role}</span>
            <span className="tl-date">{dLong(p.ev.date)}</span>
            <span className="tl-body">{shortBody(p.ev.body, c.jurisdiction)}</span>
            <span className="tl-act">{actionText(p.ev)}</span>
            <span className="tl-vote">{p.ev.vote ? `Vote ${p.ev.vote}` : 'No tally in the agenda'} · {requestText(p.ev)}</span>
          </div>
        ))}
      </div>
      <ol className="om-tl-v" data-om="timeline-list">
        {points.map((p) => (
          <li key={p.ev.date + p.role} className={cls(p.ev)} data-date={p.ev.date}>
            <span className="tl-role">{p.role}</span>
            <span className="tl-date">{dLong(p.ev.date)}</span> · <span className="tl-body">{shortBody(p.ev.body, c.jurisdiction)}</span> · <span className="tl-act">{actionText(p.ev)}</span>
            <br /><span className="tl-vote">{p.ev.vote ? `Vote ${p.ev.vote}` : 'No tally in the agenda'} · {requestText(p.ev)}</span>
          </li>
        ))}
      </ol>
      <p className="om-cap" data-om="timeline-caption">
        {g(c.elapsed_months)} months from {dLong(c.first_date)} to {dLong(c.last_date)}; {points.length} of the {c.events} dated events shown, {deciding} of them deciding votes in the highlight, the whole list in the snapshot.
      </p>
    </Section>
  )
}

/** The ten feed lines: last 30 and next 30 days together, newest first, at most PER_BODY per body, none carrying the word. */
export function feedRows(snap: Snapshot): { rows: Item[]; bodies: number } {
  const all = [...snap.recent_items.items, ...snap.upcoming_items.items]
  const ordered = [...all].sort((a, b) => b.date.localeCompare(a.date) || a.body.localeCompare(b.body))
  const per = new Map<string, number>()
  const rows: Item[] = []
  for (const it of ordered) {
    if (hasWord(it.description)) continue
    if ((per.get(it.body) ?? 0) >= PER_BODY) continue
    per.set(it.body, (per.get(it.body) ?? 0) + 1)
    rows.push(it)
    if (rows.length === FEED_ROWS) break
  }
  return { rows, bodies: new Set(all.map((i) => i.body)).size }
}

/** § 04: the AtlasLand feed, one compact Atlas panel. */
function FirstScreen({ snap, feed }: { snap: Snapshot; feed: { rows: Item[]; bodies: number } }) {
  const rc = snap.recent_items, up = snap.upcoming_items
  return (
    <Section num={4} surface="carbon" id="screen" title="The first screen."
      lead="AtlasLand opens on what the county decided in the last 30 days and what is scheduled in the next 30, across every captured body.">
      <div className="om-screen" data-product="atlas" data-density="compact">
        <div className="rp-panel">
          <div className="rp-panel__head">
            <div className="rp-panel__titles">
              <h3 className="rp-panel__title">AtlasLand · {snap.county.name}, {snap.county.state}</h3>
              <span className="rp-panel__meta">{dShort(rc.window.from)} to {dLong(up.window.to)} · newest first</span>
            </div>
          </div>
          <div className="rp-panel__body is-flush">
            <div className="rp-table-wrap">
              <table className="rp-table" data-om="feed">
                <thead><tr><th>Date</th><th>Body</th><th>Item</th><th>Status</th></tr></thead>
                <tbody>
                  {feed.rows.map((r, i) => (
                    <tr key={i}>
                      <td className="is-mono is-date is-meta">{r.date}</td>
                      <td className="is-meta">{r.body}</td>
                      <td>{r.description}</td>
                      <td className="is-mono is-status">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rp-panel__foot" data-om="feed-totals">
            {n(rc.total)} land-use items in the last 30 days and {n(up.total)} scheduled for the next 30, from {feed.bodies} bodies; {feed.rows.length} shown.
          </div>
        </div>
      </div>
    </Section>
  )
}

/** § 05: the marked parcel group and the dated items that touched it. */
function WatchingAParcel({ snap }: { snap: Snapshot }) {
  const m = snap.monitoring
  const pg = m.parcel_group
  return (
    <Section num={5} surface="paper" id="parcel" title="Watching a parcel."
      lead="Mark the parcels you are pursuing and AtlasLand lists every item that names them or a parcel beside them, the day it appears on an agenda.">
      <div className="om-mark">
        <span className="rp-title-s">{pg.label}, {pg.jurisdiction}</span>
        <span className="rp-label">{pg.parcels} parcels · {snap.case.acreage_stated ? `${g(snap.case.acreage_stated)} acres stated` : `${g(pg.roll_acreage)} acres on the roll`} · marked</span>
      </div>
      <ul className="om-mon" data-om="monitoring">
        {m.items.map((it, i) => (
          <li key={i}>
            <span className="rp-label">{dLong(it.date)}</span>
            <span>{it.description}<span className="mon-body">{it.body} · {it.kind}</span></span>
            <span className="mon-right">{it.action}{it.vote ? ` ${it.vote}` : ''}<span className="rp-label">{it.distance_m === 0 ? 'the parcel group itself' : `${n(it.distance_m)} m away`}</span></span>
          </li>
        ))}
      </ul>
      <p className="om-cap">{m.items.length} items between {dLong(m.window.from)} and {dLong(m.window.to)}: every case on the marked parcels, every case on a parcel within {n(m.neighbour_m)} m, and every agenda item naming a parcel within {n(m.near_text_m)} m.</p>
    </Section>
  )
}

const SHAPES: Record<string, string> = {
  elected_board: 'square', planning_commission: 'circle', board_of_zoning_appeals: 'diamond',
  utility_board: 'triangle', school_board: 'bar', economic_development_board: 'bar', technical_review_committee: 'dot', other: 'dot',
}
const TYPE_LABEL: Record<string, string> = {
  elected_board: 'Elected board', planning_commission: 'Planning commission', board_of_zoning_appeals: 'Zoning appeals',
  technical_review_committee: 'Committee', utility_board: 'Utility board', economic_development_board: 'Development board', school_board: 'School board', other: 'Board',
}
const TYPE_ORDER = ['elected_board', 'planning_commission', 'board_of_zoning_appeals', 'technical_review_committee', 'utility_board', 'school_board', 'economic_development_board', 'other']
const GROUPS = ['Wilson County', 'Lebanon', 'Mt. Juliet', 'Watertown', 'Utilities and districts']

function Shape({ kind }: { kind: string }) {
  const s = 4.2, cx = 6, cy = 6
  if (kind === 'square') return <svg viewBox="0 0 12 12" aria-hidden="true"><rect x={cx - s} y={cy - s} width={2 * s} height={2 * s} /></svg>
  if (kind === 'circle') return <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx={cx} cy={cy} r={s} /></svg>
  if (kind === 'diamond') return <svg viewBox="0 0 12 12" aria-hidden="true"><path d={`M${cx} ${cy - s - 1} L${cx + s + 1} ${cy} L${cx} ${cy + s + 1} L${cx - s - 1} ${cy} Z`} /></svg>
  if (kind === 'triangle') return <svg viewBox="0 0 12 12" aria-hidden="true"><path d={`M${cx} ${cy - s - 1} L${cx + s + 1} ${cy + s} L${cx - s - 1} ${cy + s} Z`} /></svg>
  if (kind === 'bar') return <svg viewBox="0 0 12 12" aria-hidden="true"><rect x={cx - s - 1} y={cy - 2.5} width={2 * s + 2} height="5" /></svg>
  return <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx={cx} cy={cy} r={s - 2} /></svg>
}

/** § 06: the board diagram reduced to counts by jurisdiction and type, the four not-captured bodies named, the coverage link. */
function WhoDecides({ snap }: { snap: Snapshot }) {
  const t = snap.totals
  const notCaptured = snap.bodies.filter((b) => !b.captured)
  return (
    <Section num={6} surface="paper" id="who" title="Who decides."
      lead={`${n(t.bodies)} bodies in ${n(t.jurisdictions)} jurisdictions decide or shape land in the county and its towns; ${n(t.captured)} are captured and ${n(t.land_use_captured)} of the ${n(t.land_use_bodies)} that decide land use are among them.`}>
      <div className="om-who" data-om="who">
        {GROUPS.map((gname) => {
          const bodies = snap.bodies.filter((b) => b.group === gname)
          const cap = bodies.filter((b) => b.captured).length
          const types = TYPE_ORDER.filter((k) => bodies.some((b) => b.body_type === k))
          return (
            <div key={gname} className="om-who__group" data-group={gname}>
              <h3 className="rp-title-s">{gname}</h3>
              <p className="om-who__count">{cap} of {bodies.length} captured</p>
              <ul className="om-who__types">
                {types.map((k) => (
                  <li key={k}><Shape kind={SHAPES[k]} />{TYPE_LABEL[k]}<span className="rp-mono">{bodies.filter((b) => b.body_type === k).length}</span></li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      <ul className="om-nocap" data-om="not-captured">
        {notCaptured.map((b) => (
          <li key={b.body_id}>{b.name}<span className="rp-label">{b.capture_status === 'not_located' ? 'not located' : 'records request'} · {b.capture_reason ?? ''}</span></li>
        ))}
      </ul>
      <p className="om-more">The full coverage statement, body by body with earliest record, meetings held and posting lag, is at <a href="/how-atlasland-works/coverage">/how-atlasland-works/coverage</a>.</p>
    </Section>
  )
}

/** § 07: the two-column comparison, shorter. */
function TodayAndWith({ snap }: { snap: Snapshot }) {
  const t = snap.totals
  const today: [string, string][] = [
    ['The attorney\u2019s memory of the board', 'how it voted on requests like yours'],
    ['The engineer\u2019s call to the utility', 'whether capacity exists'],
    ['One portal at a time', 'each board\u2019s agendas, read by hand'],
    ['After the contract', 'when the questions are already expensive'],
  ]
  const withAtlas: [string, string][] = [
    ['The whole county\u2019s record', `${n(t.captured)} of ${n(t.bodies)} bodies, every agenda, packet and minutes document`],
    ['Before the contract', 'any tract checked against the cases most like it'],
    ['Kept current', 'each agenda read the day the clerk posts it'],
  ]
  const list = (items: [string, string][]) => <ul className="om-list">{items.map(([a, b]) => <li key={a}>{a}<span className="rp-label">{b}</span></li>)}</ul>
  return (
    <Section num={7} surface="paper" id="today" title="Today and with AtlasLand."
      lead="A land deal is decided by the county, one board at a time; the record above is the county's own, held whole.">
      <div className="om-two">
        <div className="om-col"><h3 className="rp-title" style={{ margin: 0 }}>Today</h3>{list(today)}</div>
        <div className="om-col"><h3 className="rp-title" style={{ margin: 0 }}>With AtlasLand</h3>{list(withAtlas)}
          <p className="om-cap">{n(t.meetings)} meetings, {n(t.documents)} documents, {n(t.pages)} pages read; {snap.county.name}, {snap.county.state}, {t.years.from.slice(0, 4)} to {dLong(snap.as_of)}.</p>
        </div>
      </div>
    </Section>
  )
}

/** § 08 (LAND-5.3.1): how the record is built, seven lines, as written. */
const BUILT: [string, string][] = [
  ['Intake.', 'One process brings any county online: a registry of every board that decides land, readers for 14 meeting platforms, and a nightly watch that records when each clerk posts.'],
  ['Local reading.', 'Scanned documents and meeting recordings are read by Red Planet Data\u2019s own OCR and speech-to-text, on its own machines.'],
  ['Cases with proof.', 'Every value in a case is tied to the document, page and passage it came from, and a field is shown only after it clears an accuracy bar against a hand-read reference set.'],
  ['The owners behind the owners.', 'Parcels are linked to the companies that hold them and the people behind those companies.'],
  ['Assembly detection.', 'Adjacent parcels bought by related entities within a window are flagged as a possible assembly.'],
  ['The County Catalog.', 'Every US county profiled and scored, with a record of what can be obtained there and how fast.'],
  ['Coverage and lag.', 'Every county states what is captured and how quickly, measured.'],
]

function HowBuilt() {
  return (
    <Section num={8} surface="paper" id="built" title="How the record is built.">
      <ol className="om-built" data-om="built">
        {BUILT.map(([head, line]) => <li key={head}><span><b>{head}</b> {line}</span></li>)}
      </ol>
    </Section>
  )
}

/** § 09: intake and terms, as on the previous page, with the closing row. */
function IntakeAndTerms({ mark }: { mark: string }) {
  const steps: [string, string][] = [
    ['Map the county', 'Every board that decides land, in the county and its towns.'],
    ['Collect the record', 'Several years of agendas, packets and minutes, plus the land records.'],
    ['Read it into cases', 'Each value tied to its document and page.'],
    ['Add what is coming', 'Road funding, capacity decisions, annexations, fee studies, rule changes.'],
    ['State the coverage', 'Which boards are in, from when, and what is not available.'],
  ]
  const terms = ['Per county, same price built or not.', 'Seats in blocks of 10, or one seat for an individual.', 'Twelve months, paid in advance, renewing annually.',
    'First 30 days of a new county included in full, agreement and price stated on day one.', 'Red Planet Data owns the data; agreements are with Red Planet Data, Inc.']
  return (
    <Section num={9} surface="blueline" id="intake" title="Intake and terms." lead="Every county goes through the same five steps, so a new county is online in days to weeks.">
      <ol className="om-steps">
        {steps.map(([a, b], i) => (
          <li key={a} className="om-step"><span className="om-node" aria-hidden="true"></span><span className="rp-figure-s" style={{ color: 'var(--fg-3)' }}>{i + 1}</span>
            <h3 className="rp-title" style={{ margin: 0 }}>{a}</h3><p className="rp-body" style={{ margin: 0, color: 'var(--fg-2)' }}>{b}</p></li>
        ))}
      </ol>
      <div className="om-terms">{terms.map((t) => <div key={t} className="om-term"><p className="rp-body" style={{ margin: 0 }}>{t}</p></div>)}</div>
      <Close mark={mark} />
    </Section>
  )
}

function Close({ mark }: { mark: string }) {
  return (
    <div className="om-close">
      <div className="om-row"><img src={mark} alt="" style={{ width: 32, height: 32, display: 'block', flex: 'none' }} /><span className="rp-title-s">Red Planet Data, Inc.</span></div>
      <a href="mailto:hello@redplanetdata.com" className="rp-label" style={{ color: 'var(--fg-1)', textDecoration: 'underline', textUnderlineOffset: 3 }}>hello@redplanetdata.com</a>
    </div>
  )
}

// ── the coverage page ─────────────────────────────────────────────────────────────────────

function lagCell(v: number | null, before: boolean, stated: boolean): ReactNode {
  if (!stated || v === null) return <span className="is-muted">not stated</span>
  const a = g(Math.abs(v))
  if (before) return v >= 0 ? `${a} days before` : `${a} days after`
  return v >= 0 ? `${a} days after` : `${a} days before`
}

function CoverageBody({ snap }: { snap: Snapshot }) {
  const typeRank = (k: string) => TYPE_ORDER.indexOf(k)
  const rows = GROUPS.flatMap((gname) => snap.bodies.filter((b) => b.group === gname && b.captured).sort((a, b) => typeRank(a.body_type) - typeRank(b.body_type) || a.name.localeCompare(b.name)))
  const notCaptured = snap.bodies.filter((b) => !b.captured)
  return (
    <>
      {snap.coverage && <p className="rp-body" style={{ margin: '0 0 28px', maxWidth: '76ch' }} data-om="coverage-opening">{snap.coverage.opening_paragraph}</p>}
      <div className="om-cov" data-product="atlas" data-density="compact">
        <div className="rp-table-wrap">
          <table className="rp-table" data-om="coverage-table">
            <thead><tr><th>Body</th><th>Earliest record</th><th className="is-right">Meetings</th><th>Agenda posted</th><th>Minutes posted</th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.body_id}>
                  <td>{shortName(b)}<span className="cov-j">{b.jurisdiction}</span></td>
                  <td className="is-mono" data-l="from">{b.earliest_record ?? ''}</td>
                  <td className="is-mono is-right" data-l="meetings">{n(b.meetings)}</td>
                  <td className="is-lag" data-l="agenda">{lagCell(b.posting_lag.median_agenda_lead_days, true, b.posting_lag.agendas_with_posted_at > 0)}</td>
                  <td className="is-lag" data-l="minutes">{lagCell(b.posting_lag.median_minutes_lag_days, false, b.posting_lag.minutes_with_posted_at > 0)}</td>
                </tr>
              ))}
            </tbody>
            <caption>Posting lag is the median, measured where the platform states a posting time; &ldquo;not stated&rdquo; means the platform gives none. {rows.length} captured bodies as of {dLong(snap.as_of)}.</caption>
          </table>
        </div>
      </div>
      <ul className="om-nocap" data-om="not-captured">
        {notCaptured.map((b) => <li key={b.body_id}>{b.name}<span className="rp-label">{b.capture_status === 'not_located' ? 'not located' : 'records request'} · {b.capture_reason ?? ''}</span></li>)}
      </ul>
    </>
  )
}

// ── documents ─────────────────────────────────────────────────────────────────────────────

function Head({ title, description, mark, css }: { title: string; description: string; mark: string; css: string }) {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="noindex, nofollow" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href={mark} />
      <style dangerouslySetInnerHTML={{ __html: [fontFace('Geist', 400, 'geist-latin-400-normal.woff2'), fontFace('Geist', 500, 'geist-latin-500-normal.woff2'), fontFace('Fragment Mono', 400, 'fragment-mono-latin-400-normal.woff2')].join('\n') }} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
    </head>
  )
}

function Header({ mark, title, right }: { mark: string; title: string; right: ReactNode }) {
  return (
    <header style={{ padding: 'clamp(28px, 3.5vw, 48px) var(--page-gutter) clamp(20px, 2.5vw, 32px)' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px' }}>
        <img src={mark} alt="Red Planet Data" style={{ width: 48, height: 48, display: 'block', flex: 'none' }} />
        <h1 className="rp-display-l" style={{ margin: 0, flex: '1 1 420px', fontSize: 'clamp(34px, 4.4vw, 56px)', color: 'var(--fg-1)' }}>{title}</h1>
        {right}
      </div>
    </header>
  )
}

const ROOT_STYLE = { minHeight: '100%', padding: 8, display: 'flex', flexDirection: 'column' as const, gap: 8, background: 'var(--bg)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)' }

function MainPage({ snap, mark, css, points, feed }: { snap: Snapshot; mark: string; css: string; points: Point[]; feed: { rows: Item[]; bodies: number } }) {
  const asOf = snap.as_of
  return (
    <html lang="en">
      <Head title="How AtlasLand Works | Red Planet Data" mark={mark} css={css}
        description={`${snap.county.name}, Tennessee as AtlasLand holds it: the county and its region, what is moving, one project followed through the record, the first screen, a watched parcel, who decides, and how the record is built.`} />
      <body>
        <div className="rp-root om" data-product="red-planet" style={ROOT_STYLE}>
          <Header mark={mark} title="How AtlasLand Works" right={<p className="rp-label" style={{ margin: 0, flex: '0 1 auto', minWidth: 0 }}>{MONTH[Number(asOf.slice(5, 7)) - 1]} {asOf.slice(0, 4)} · as of {asOf}</p>} />
          <TheCounty snap={snap} />
          <WhatIsMoving snap={snap} />
          <OneProject snap={snap} points={points} />
          <FirstScreen snap={snap} feed={feed} />
          <WatchingAParcel snap={snap} />
          <WhoDecides snap={snap} />
          <TodayAndWith snap={snap} />
          <HowBuilt />
          <IntakeAndTerms mark={mark} />
        </div>
      </body>
    </html>
  )
}

function CoveragePage({ snap, mark, css }: { snap: Snapshot; mark: string; css: string }) {
  return (
    <html lang="en">
      <Head title="AtlasLand coverage, Wilson County | Red Planet Data" mark={mark} css={css}
        description={`The coverage statement for ${snap.county.name}, Tennessee: every body registered, which are captured, from when, and how quickly each clerk posts.`} />
      <body>
        <div className="rp-root om" data-product="red-planet" style={ROOT_STYLE}>
          <Header mark={mark} title="Coverage, stated." right={<a className="om-back" href="/how-atlasland-works">← How AtlasLand Works</a>} />
          <section className="rp-section" id="coverage"><div className="rp-section__inner">
            <div className="om-head"><div><span className="rp-eyebrow rp-eyebrow--muted">{snap.county.name}, {snap.county.state}</span>
              <h2 className="rp-display-m" style={{ margin: 0 }}>Every body, and what Atlas holds of it.</h2></div></div>
            <CoverageBody snap={snap} />
            <Close mark={mark} />
          </div></section>
        </div>
      </body>
    </html>
  )
}

// ── build ─────────────────────────────────────────────────────────────────────────────────

function assertNoWord(html: string, what: string) {
  const text = html.replace(/url\("data:[^"]+"\)/g, '').replace(/href="data:[^"]+"|src="data:[^"]+"/g, '')
  if (hasWord(text)) {
    const i = text.replace(PROPER_NAMES, '').search(/public/i)
    throw new Error(`${what} carries the word near: ${text.replace(PROPER_NAMES, '').slice(Math.max(0, i - 80), i + 40)}`)
  }
}

function main() {
  const argIdx = process.argv.indexOf('--snapshot')
  const snapshotPath = argIdx > -1 ? path.resolve(process.argv[argIdx + 1])
    : path.join(REPO, 'public', 'data', readdirSync(path.join(REPO, 'public', 'data')).filter((f) => /^wilson-county-tn-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().at(-1)!)
  const snap = JSON.parse(readFileSync(snapshotPath, 'utf8')) as Snapshot
  if (!snap.catalog) throw new Error(`${path.basename(snapshotPath)} has no catalog part; rerun atlas/ops/_land52_wilson_snapshot.py with the catalog exporter`)
  const mark = markDataUri()
  const css = designCss()
  const points = decisiveEvents(snap.case.timeline)
  const feed = feedRows(snap)
  if (snap.catalog.report.comparison && snap.catalog.report.comparison.rows.length > 10) throw new Error('the comparison table has more than ten rows')
  if (snap.monitoring.items.length > 10) throw new Error('the monitoring list has more than ten rows')

  const page = '<!doctype html>\n' + renderToStaticMarkup(<MainPage snap={snap} mark={mark} css={css} points={points} feed={feed} />) + '\n'
  const coverage = '<!doctype html>\n' + renderToStaticMarkup(<CoveragePage snap={snap} mark={mark} css={css} />) + '\n'
  assertNoWord(page, 'the page')
  assertNoWord(coverage, 'the coverage page')
  mkdirSync(path.dirname(COVERAGE), { recursive: true })
  writeFileSync(PAGE, page, 'utf8')
  writeFileSync(COVERAGE, coverage, 'utf8')

  console.log(`wrote ${path.relative(REPO, PAGE)} (${Buffer.byteLength(page).toLocaleString('en-US')} bytes, ${(page.match(/<section class="rp-section"/g) ?? []).length} sections) and ${path.relative(REPO, COVERAGE)} (${Buffer.byteLength(coverage).toLocaleString('en-US')} bytes) from ${path.basename(snapshotPath)} as of ${snap.as_of}`)
  console.log(`timeline: ${points.length} of ${snap.case.timeline.length} events`)
  for (const p of points) console.log(`  ${p.ev.date}  ${p.role}: ${shortBody(p.ev.body, snap.case.jurisdiction)} · ${actionText(p.ev)} · ${p.ev.vote ?? 'no tally'} · ${requestText(p.ev)}${p.ev.deciding ? '  DECIDING' : ''}`)
  console.log(`feed: ${feed.rows.length} rows from ${feed.bodies} bodies (${snap.recent_items.total} recent + ${snap.upcoming_items.total} upcoming)`)
  for (const r of feed.rows) console.log(`  ${r.date}  ${r.body} | ${r.status} | ${r.description.slice(0, 90)}`)
  const c = snap.catalog
  console.log(`catalog: score ${c.score?.overall_score} rank ${c.score?.overall_rank} of ${fmtInt(c.score?.counties_ranked ?? null)}, band ${c.license?.band}, charts ${c.report.charts.map((x) => x.title).join(' / ')}, map marks ${c.report.map?.marks?.length ?? 0}, comparison ${c.report.comparison?.rows.length ?? 0} rows`)
}

main()
