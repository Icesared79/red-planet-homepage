// Ported from atlas-dash lib/county-catalog/report-types.ts (atlas-dashboard d320772, 2026-10-18) for the Red Planet
// website (LAND-5.3, 2026-10-23). Same shapes, so a county report exported by atlas-dash
// scripts/_land53_county_report_export.ts is drawn here by the same components. One addition: ReportMap.marks, points
// the exporter projected with the map's own projection (a parcel group's centroid, say), which the website draws as
// a highlight mark. Keep this file in step with the atlas-dash original rather than editing it on its own.
//
// The visual county report (CRE-17, 2026-10-16): the shapes lib/county-catalog/report.ts builds and
// lib/county-catalog/report-view.tsx draws, on the client offer page (/o/<token>) and the operator
// county page (/county-catalog/<fips>). Everything is computed on the server from live Atlas reads;
// the map arrives as finished SVG path strings, so neither page loads map code in the browser.
//
// A missing value is null and renders as an em dash.

// One small chart: the county against the national median, year by year, in plain units.
export type ReportChart = {
  factor_key: string
  title: string
  // What the numbers are, in words: "Percent change since 2020", "Dollars", "Per 100,000 residents".
  unit_note: string
  // level: the factor's own value each year. growth: percent change from the first year shown.
  kind: 'level' | 'growth'
  // How to print a value: 'pct' (already a percent), 'usd', 'count', 'pct_change'.
  format: 'pct' | 'usd' | 'count' | 'pct_change'
  years: number[]
  // COUNTY-3: a chart whose points are not years (months) carries its own x labels; points then sit evenly.
  labels?: string[]
  county: (number | null)[]
  // Empty of numbers when there is no national comparison (the residential record's own counts).
  national: (number | null)[]
  // Operator page only: where the pick came from (the analysis text, or the strongest factors).
  basis: 'cited' | 'strongest'
}

export type MapCounty = {
  fips: string
  name: string
  role: 'county' | 'neighbor' | 'context'
  d: string
  label: { x: number; y: number } | null
}

export type ReportMap = {
  width: number
  height: number
  counties: MapCounty[]
  // Transmission lines in view, heaviest first; high = 345 kV and above.
  lines: { d: string; high: boolean }[]
  substations: { x: number; y: number; high: boolean }[]
  // Interstates in view (TIGER primary roads, route type I), as path data.
  interstates: string[]
  // Main and industrial rail lines in view (BTS NTAD rail network), as path data.
  rail: string[]
  // Operational public-use airports in view (FAA); certificated = holds a Part 139 certificate
  // (scheduled airline service), the ones labelled with their code.
  airports: { x: number; y: number; code: string; name: string; certificated: boolean }[]
  // The county's own infrastructure figures (the catalog's measured miles and counts).
  facts: { label: string; value: string }[]
  // LAND-5.3 (website only): points projected by the exporter, drawn as highlight marks with a label.
  marks?: { lon: number; lat: number; label: string | null; x: number; y: number }[]
}

export const COMPARE_KEYS = ['pop_growth', 'migration', 'income', 'income_growth', 'permits', 'job_growth'] as const
export type CompareKey = (typeof COMPARE_KEYS)[number]

export type CompareColumn = { key: CompareKey; label: string; years: string; format: 'pct_change' | 'usd' | 'rate' }

export type CompareRow = {
  fips: string | null
  name: string
  kind: 'county' | 'neighbor' | 'area'
  values: Record<CompareKey, number | null>
}

export type ReportComparison = {
  columns: CompareColumn[]
  rows: CompareRow[]
  caption: string | null
  note: string | null
}

export const FOUND_KINDS = ['sales', 'loans', 'permits', 'liens', 'court', 'owners'] as const
export type FoundKind = (typeof FOUND_KINDS)[number]

export type FoundItem = {
  kind: FoundKind
  label: string
  count: number | null
  // counted: collected here and current into the window. not_collected / not_current: no count is shown
  // to a client, because a zero would be a gap in the record rather than a fact about the county.
  status: 'counted' | 'not_collected' | 'not_current'
  latest: string | null
}

export type ReportFound = {
  window_start: string
  window_end: string
  items: FoundItem[]
}

export type CountyReport = {
  fips: string
  name: string
  short: string
  // COUNTY-3: the name on a chart's end label when the short name is too long to sit beside the line
  chart_name?: string
  charts: ReportChart[]
  map: ReportMap | null
  comparison: ReportComparison | null
  // null when Atlas has not published the commercial property record for the county.
  found: ReportFound | null
  built_at: string
}

// ── COUNTY-3: the residential county report ───────────────────────────────────────────────
// The county page with Residential chosen: the residential analysis, residential charts (households, median
// household income, home sales, foreclosure filings), the map with housing-relevant layers only, the neighbors on
// residential measures, and the residential "what we found" (Atlas atlas_county_catalog_residential_profile.found).

export const RES_PARTS = ['setting', 'moving', 'distress', 'watch', 'provide'] as const
export type ResPart = (typeof RES_PARTS)[number]
export const RES_PART_TITLES: Record<ResPart, string> = {
  setting: 'The setting',
  moving: 'What is moving in housing',
  distress: 'Distress activity',
  watch: 'What to watch',
  provide: 'What Red Planet Data can provide',
}

export type ResidentialNarrative = Record<ResPart, string> & {
  words: number | null
  written_at: string
  written_by: string
  model: string
  prompt_version: string
  // the county's inputs have changed since it was written (rewritten by the next nightly run)
  inputs_changed: boolean
}

export type ResidentialFoundItem = {
  kind: string
  label: string
  status: 'collected' | 'not_collected'
  first: string | null
  latest: string | null
  note?: string | null
  d90: number | null
  d365: number | null
  d90_status: 'counted' | 'not_current' | 'not_collected'
  d365_status: 'counted' | 'not_current' | 'not_collected'
}

export type ResidentialFound = {
  d90: [string, string]
  d365: [string, string]
  items: ResidentialFoundItem[]
}

export type ResidentialReport = CountyReport & {
  track: 'residential'
  narrative: ResidentialNarrative | null
  residential_found: ResidentialFound | null
  // when Atlas last rebuilt the county's residential profile
  profile_built_at: string | null
}
