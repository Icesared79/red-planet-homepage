# red-planet-homepage — STATE

## Current phase: LAND-5.2.2 -- coverage wording at the source, no horizontal overflow (2026-10-23)

Session `cc-land522-20261023`.

- Atlas's coverage generator (`ops/_land3_coverage_statement.py`) now writes "Atlas holds the meeting record of ..."
  and asserts the word "public" is absent from its own wording (body names exempt). The Wilson statement was
  regenerated, the snapshot re-taken as `public/data/wilson-county-tn-2026-10-23.json`, and the page rebuilt from it.
  The builder no longer exempts the coverage statement from its word check; `PROPER_NAMES` stay exempt.
- Timeline (§ 03): cards 168 px wide on a track inset 16 px at each end; the vertical list now takes over at 1240 px
  and below (was 1100). Measured on the old page: the end cards ran past the viewport at every width from 1101 to
  1366 px, and same-lane cards overlapped below about 1240 px. Known, not touched: the May 23, 2023 card is six lines
  tall and touches the two cards under it by about 3 px, as it did before.
- County map (§ 02): a pending tag that does not fit beside its name goes on a line under it.
- Overflow check: `scrollWidth` == viewport at 390, 768, 1280 and 1440 with `isMobile: false`.

## Current phase: LAND-5.2.1 -- proper names on /how-atlasland-works (2026-10-22)

Session `cc-land521-20261022`. Operator ruling: the no-"public" rule is about Red Planet Data's own copy about its data
sources; it never applies to the proper name of a board, a document or a statute.

- `scripts/_land52_how_atlasland_works.py`: `PROPER_NAMES` (Public Infrastructure Committee, Tennessee Public Chapter
  <n>) are exempt from the word check, and the check also exempts the coverage statement, which is now quoted in its own
  wording ("Atlas holds the public meeting record of 31 of the 35 ..."). Lebanon's committee is shown as "Public
  Infrastructure Committee" on both county maps and in the coverage table.
- The three snapshot items citing Tennessee Public Chapter 1044 (Lebanon Planning Commission 2026-09-22, Lebanon City
  Council 2026-10-06 and 2026-10-20) are candidates again, but none is among the twelve shown: City Council already
  has its three newest 2026-10-20 items and the Planning Commission item is older than the twelfth row. The first
  screen is therefore unchanged; nothing else on the page changed (same 2026-10-22 snapshot).
- Known, not touched: at 1280px the timeline section is 6px wider than the viewport (a label and one card), as it was
  before this change.

## Current phase: LAND-5.2 -- /how-atlasland-works rebuilt from the Wilson County snapshot (2026-10-22)

Session `cc-land52-20261022`. Ships on push like everything here.

- `public/how-atlasland-works.html` now shows the county record instead of describing it. Eight sections: Today and
  with AtlasLand (two columns, type only); The county, mapped (two inline SVGs of the 35 bodies by jurisdiction, one
  wide and one tall, typed by shape, pending bodies outlined with "requested" / "not located"); One project, followed
  (the Tax Map 68 residential project: a staggered horizontal timeline above 1100px, a vertical one below, deciding
  votes in the blueprint highlight); The first screen (last 30 / next 30 days as two compact Atlas panels, twelve rows
  each with the total stated); Deal monitoring (the marked parcel group and the past year's items near it); Coverage,
  stated (the statement's opening paragraph, a compact table of the 31 captured bodies with earliest record, meetings
  and median posting lag, the four not captured with their reason); Intake; Terms. Header, closing row and noindex kept.
- Every figure comes from `public/data/wilson-county-tn-<as_of>.json`, written by Levelpie
  `atlas/ops/_land52_wilson_snapshot.py` (read-only against Atlas). `scripts/_land52_how_atlasland_works.py` builds the
  page from the newest snapshot and from the Red Planet design package in Git (`C:/rpd/packages/red-planet-design`: Plat
  tokens, embedded self-hosted fonts, components); it is no longer derived from the sibling page's head. To refresh:
  run the Atlas script with `--out-dir public/data`, then this one.
- Word rules in the builder: the applicant is never exported, so the developer cannot appear; the page never carries
  the word "public" (the builder asserts it): an item whose line carries it is left out of the twelve shown, Lebanon's
  "Public Infrastructure Committee" is shown as "Infrastructure Committee", and the coverage paragraph's one use is
  rendered as "the meeting record".
- Compact density sets every `.rp-table td` to `nowrap`; the page overrides it for its own tables, or the panels
  overflow. At 390px the page lays out at exactly 390px with no sideways scroll (checked with Playwright).
- The case record was being extended by LAND-4.1 (Lebanon City Council extraction) while the snapshot was taken, so
  the timeline runs 2021-06-22 to 2025-02-04 (25 verified events across 10 case rows); the LAND-4 document's last
  date, 2024-11-18, predates the council readings that session added.

## Current phase: LAND-5.1 -- AtlasLand reference copy, § 02 restored, CLI deploy check (2026-10-22)

Session `cc-land51-20261022`.

- `/how-atlasland-works`: the operator's shorter reference copy (787 words -> 409 visible words, no block over two
  sentences), same layout. Section titles are now The problem, What a license includes, Intake, Example, What
  AtlasLand does not do, Terms; § 02 and § 06 have no lead line; § 06 has five terms. Built by the same
  `scripts/_land5_how_atlasland_works.py`, which now only rewrites the sibling's AtlasLand line if the old text is
  still there, so it can be re-run safely.
- `/how-red-planet-works`: § 02 "Who Licenses It" is back (`scripts/_land51_restore_who_licenses.py`, structure from
  `a2a5753`): residential column (AtlasProp, AtlasTrade) and commercial column (AtlasCRE, AtlasLand), each under
  "Atlas views", then the closing bar. The § 01 Views box names the four views in small type; the stray fragment is
  gone, and the page's tags balance again (LAND-1 had left one extra `</div>`). Sections run § 01 to § 05.
- Deploy check: `scripts/verify_deploy.mjs` verifies a push deploy with the Vercel CLI only (`vercel api` for the
  deployment by commit, `vercel inspect` for the alias table, then live 200s). The stored REST token is rejected, so
  nothing here uses it. Pass page names without a leading slash (`--paths how-atlasland-works`); Git Bash rewrites `/x`.
- The LAND-5 "known issue" below is resolved by this phase.

## Current phase: LAND-5 -- /how-atlasland-works (2026-10-22)

Session `cc-land5-20261022`. Ships on push like everything here.

- `public/how-atlasland-works.html`, served at `/how-atlasland-works` by a rewrite in `next.config.mjs`. Unlisted and
  `noindex, nofollow`, like its sibling. Built by `scripts/_land5_how_atlasland_works.py` from the sibling's own head
  (self-hosted fonts, tokens, Plat palette, `om-*` components), so a design change to the sibling is re-run through
  the script to carry over. Six sections (§ 01 to § 06), the operator's copy verbatim; the only page-only CSS is
  `.om-terms--3`.
- `/how-red-planet-works`: the AtlasLand tile reads "AtlasLand covers land and jurisdiction records for any land use:
  decisions, hearings, land assemblies and meeting records", and the word AtlasLand links to the new page.
- Known issue, NOT fixed here: LAND-1's copy script (`317ea46`) deleted the sibling's § 02 "Who Licenses It" header
  and its residential column, so the live sibling runs § 01, § 03, § 04, § 05 and its "Views" box shows a stray small
  "AtlasProp" plus the AtlasProp and AtlasTrade lines that belonged to the residential column. `a2a5753` has the
  last whole version.

## Current phase: LAND-1 -- Atlas is the platform, four views, no product names (2026-10-20)

Session `cc-land1-20261020`. Operator decision: Red Planet Data is the company, Atlas is the single platform customers
sign in to, and the former products are four views on the county record (AtlasLand, AtlasCRE, AtlasProp, AtlasTrade).
Record: Levelpie `atlas/docs/atlas-consolidation-2026-10.md`. SHIPPED on push: main `8d164e4`, `dpl_FzFk4X21VLUitwA3St7RabZ6uvFc`
(rollback `dpl_5LnjGevzMs2nZGT4LzmhP4rnQ2mw`).

- `components/BuiltOnAtlas.tsx`: the section is "Atlas"; the heading says a license is counties and seats with every
  applying view included; four view cards, one plain sentence each, wordmarks set in the site's sans
  (`.rph-wordmark-atlas-view` in `app/globals.css`); the custom-platform offer ("We build new platforms...") is gone.
- `ContactDialog` topics and product list, `Header` nav ("Atlas"), `MissionControl`, terms, privacy and the legal footer
  name Atlas and its views only. `Marks.tsx` keeps the old marks as unused exports (nothing deleted).
- `public/how-red-planet-works.html` (Paul's VISUAL-1 export): copy only, by `scripts/_land1_how_it_works.py`: Atlas
  is the platform, the four views replace the product tiles and marks, "Views Included" replaces "Platform Optional",
  the custom platform and "custom package" lines are gone, pricing is by county and seats. Design untouched.
- Verified live 2026-10-20 16:02 ET: `/` and `/how-red-planet-works` return 200 with zero occurrences of Signal,
  SunScope, LeanCRE, TeleAcre, Brokeride, Rezoned, "custom" or "public", and the four view names present.
- Not changed: `app/_careers/` (unrouted) and `lib/atlas-live.ts` (the word "signals" as a noun, not the product).

## Earlier phase: COUNTY-10 -- /licensing taken down (2026-10-20)

Session `cc-county10-20261020` (#H8ZN-4CPW). Operator ruling: Red Planet Data sells custom license agreements built with
each customer, not a self-serve store for Florida and Connecticut. No price, pricing table, quote page or free-access
setting changed; those live in Atlas and atlas-dash, not here.

- Removed: `app/licensing/` (page + css), `components/licensing/Store.tsx`, `lib/licensing.ts`, both request-handling
  routes `app/api/licensing/price` and `app/api/licensing/request` (nothing else called either), `public/licensing/`
  (map.json, signal-map.png, signal-screenshot.png), `scripts/build_licensing_geo.mjs`, `scripts/verify_licensing.mjs`.
- `next.config.mjs` redirects `/licensing` and `/licensing/:path*` permanently (308) to `/`. The site has no sitemap or
  robots file, and nothing else on the site linked to the page.
- The homepage no longer refreshes `atlas_county_catalog_residential_activity` on views (that came from
  `lib/licensing.ts`); atlas-dash views still do.
- The phases below describe the removed page and are kept as history.

## Earlier phase: COUNTY-9.1 -- figures from the pricing table, state-aware wording, Florida on request (2026-10-20)

Session `cc-county91-20261020` (#K3VF-8DNQ). No price, calculation, seat rule or term changed.

- Every figure on the page (cards and questions: seats included, seat-pack size and %, multi-county minimum and %,
  whole-state %, white-label price and least people) is read straight from `atlas_county_catalog_pricing_inputs`
  (track residential) by `pricingTable()` in `lib/licensing.ts`; the request route rounds people to the same table's
  steps. (COUNTY-9's page already showed 40% for the whole-state discount; the 20% in its report was a typo there.)
- The header, the Individual and Firm cards and question 1 name the filing types with a current count (14-day rule)
  in the offered counties of the state viewed (`held`); before a state is chosen, the types held in every state.
  The store now starts with no state chosen. Header, cards and questions are drawn by `Store.tsx`.
- `OFFER_ONLY_WITH_CURRENT = { FL: "foreclosure" }`: a Florida county is offered only with a current foreclosure count;
  the rest are drawn shaded on the map, found by search as "on request", and "Other Florida counties are available on
  request." opens an on-request form (state, counties wanted as free text, license, people, contact). It posts
  `kind: "on_request"` to `/api/licensing/request`, which emails hello@ only. Connecticut offers all nine.
- Battery `scripts/verify_licensing.mjs` now reads the expected figures, filing types and Florida counties from the
  tables; `--submit <email>` sends one on-request submission.

## Earlier phase: COUNTY-9 -- /licensing rebuilt as a store (2026-10-20)

Session `cc-county9-20261020` (#W7DP-3HKZ). Operator ruling: the page is a store, not a reference document. Both county
tables and every per-county paragraph are gone. Order: (a) one-sentence header and the Signal screenshot; (b) three
pricing cards, Individual / Firm / Firm with your branding, each "from" the lowest county price read live (individual
and firm low prices, white-label price and least people from the pricing table); (c) the picker in
`components/licensing/Store.tsx`: Connecticut or Florida, counties by clicking the state map or by typing a town or
county (a town finds its county), Individual or Firm with people in steps of 25, an optional branding line for firms at
the white-label minimum, one line per county with its price and its current 90-day filing counts, discounts as their
own lines and a live total priced by `/api/licensing/price` (`?seats=` prices a firm through
`atlas_county_catalog_quote_residential`, the catalog quote tool's own function); (d) one "Request this license"
button that collects name, firm, email and phone and emails hello@ (`/api/licensing/request`, kinds `individual` and
`firm`); (e) six questions, closed. No price, calculation, seat rule or term changed. Still unlinked and `noindex`.

- Maps and town search: `public/licensing/map.json`, built by `scripts/build_licensing_geo.mjs` from atlas-dash's
  `public/geo/cb2023-500k.json`, the CT town-to-region crosswalk (`atlas_county_catalog_ct_crosswalk` rows as JSON)
  and the 2023 Census Gazetteer places file for Florida (internal point in county). Rebuild only if the boundaries or
  the crosswalk change.
- Filing counts show only while their as-of date is within 14 days (`COUNT_FRESH_DAYS` in `lib/licensing.ts`); the
  page also asks the catalog to rewrite counts over six hours old (waits at most 4 s). Same rule on atlas-dash's quote
  page and price list.
- Payment: COUNTY-2.1's checkout is not connected (no Stripe keys on atlas-dash), so the button reads "Request this
  license". If one is connected, `Store.tsx` is the one place to switch it to "Continue to payment".
- Battery: `scripts/verify_licensing.mjs [--base] [--out] [--submit <email>]`, with `NEXT_PUBLIC_SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` in the process env for the catalog comparison.

## Earlier phase: VISUAL-1 -- unlisted /how-red-planet-works document (2026-10-19)

Session `cc-visual1-20261019`. Paul's self-contained `how-red-planet-works.html` (styles, fonts and logos embedded)
is committed byte-for-byte as `public/how-red-planet-works.html` and served at `/how-red-planet-works` by a rewrite
in `next.config.mjs`, so Next serves the raw file with none of the site's layout, header or styles. Unlisted: no
nav, footer or sitemap entry (the site has no sitemap), and the file's own `noindex, nofollow` meta stays. To add
another standalone document the same way, drop it in `public/` and add one line to `rewrites()`. To change this
one, replace the file with Paul's new export; do not edit its design or copy here.

## Earlier phase: COUNTY-8 -- /licensing in the shared license page's design (2026-10-19)

Session `cc-county8-20261019`. main `08cfacc`, deployed on push: `dpl_97GVsGx8sVKWr9sAVas6hgLRq4Z4`. The page is drawn
like atlas-dash's shared Signal license page (`/o/<token>`, LICENSE-3): light document on paper in either theme (the
site's `rph-*` tokens the forms read are pinned to their light values inside `.lp`), the company's top bar instead of
the site header and footer, dark summary card, numbered cards, sticky panel. Order: 01 What Signal is (the license
page's screenshot, copied to `public/licensing/signal-screenshot.png`, and its three captions), 02 The license, 03/04
Connecticut and Florida in the shared price list's compact table (county, residential parcels, 90-day foreclosure and
probate filings, firm and individual price; as-of per state = earliest count shown), 05 Get a quote, 06 Request an
individual license. The catalog's calculation text and the "Level N" chips are gone: they speak in levels and bands.
No price, figure or term changed. Still unlinked and `noindex`.

- Battery `scripts/verify_licensing.mjs [--base] [--out]` (playwright-core loaded from the atlas-dashboard checkout).
  A local check works with `next dev` and `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` set in the process.
- Florida's earliest filing count is as of July 23, 2026 (2026-10-19 read); Connecticut's October 17.

## Earlier phase: COUNTY-7 -- /licensing leads with Signal (2026-10-18)

Session `cc-county7-20261018`. main `c781f7b`, deployed on push: `dpl_BJFvcipfWyn3PsGBbJLW8ygxj3kw`. Order now: what
Signal is and what agents do in it, with one screenshot (`public/licensing/signal-map.png`, names blurred); the
license (counties loaded into Signal, seats, individual licenses, white label for larger brokerages, its price and
least seats read live from the pricing table in `lib/licensing.ts`); the standing terms; the Connecticut and Florida
prices and the two forms as before. Still unlinked and `noindex`. A local `npm run build` has no database credentials
here, so it renders the fallback text and fails on `/` (the records ledger); Vercel's production build is unaffected.

## Earlier phase: COUNTY-4.2 — /licensing, Connecticut and Florida residential (2026-10-18)

### Completed in this phase

`/licensing` (session `cc-county42-20261018`): what a county license is (the eight residential record types by
name), what the records do inside Signal (only features Signal has; no bulk download), firm licenses (25 seats
included and the minimum, blocks of 25 at 25% of the county's license, the seat rule), individual licenses (one
named person, 20% of the firm price, $600 floor, no seats, same discounts), the standing terms for both, the
Connecticut (9 planning regions) and Florida (67 counties) price lists with each county's firm and individual
price, level and "How this price was calculated", and two actions: Get a quote and Buy an individual license.

Every figure is read live from the County Catalog in `lib/licensing.ts` (service role; revalidate 300 s):
`atlas_county_catalog_quote_individual` for the per-county firm and individual prices,
`atlas_county_catalog_quote_residential` for the seat terms, discounts and seat rule, and the individual terms text
from `atlas_county_catalog_pricing_terms`. `/api/licensing/price` prices a county selection live;
`/api/licensing/request` stores each request in `contact_submissions` (source `Licensing: ...`) and emails
hello@redplanetdata.com only, reply-to the person. Nothing is sent to the person.

### Decisions that affect later phases

- **The page is linked from nowhere and is `noindex`.** Linking it (header, footer, homepage) is the operator's
  step; drop the `robots` block in `app/licensing/page.tsx` at the same time.
- **Buying is a request, not a checkout.** COUNTY-2.1's accept-and-pay was not merged and no Stripe key exists
  on this host when this was built; the form tells the person an invoice follows and access is turned on when
  payment clears. When a checkout is connected, `components/licensing/IndividualBuy.tsx` is the one place to
  change.
- **Preview builds of this project fail on `/`** because the Preview-scoped `SUPABASE_SERVICE_ROLE_KEY` is
  refused (HTTP 401) by Supabase; Production's key works. Pre-existing, not changed here.

### Immediate next step

None pending.

## Current phase: LOGO-1.1 — the mark follows the surface, not the theme (2026-10-12)

### Completed in this phase

Paul saw the footer mark reading as a red smudge. `.rph-legal`'s floor is
forest-950 in BOTH themes, but `--rph-mark-band` followed the theme, so in the
light theme the mark stood on near-ink with ink bands: **1.02:1**, measured on
the live page. The bands are the mark, so what was left was a plain red disc.

The mark now has its own pair, `--rph-mark-disc` and `--rph-mark-band`, scoped
to the surface. The page ground sets them per theme as before; `.rph-legal`
overrides them to the on-dark values unconditionally, in the same rule that sets
that ground. The footer measures **15.47:1** after the change.

The favicon set and `og-image.png` came back from the brand folder with opaque
grounds — tab icons on paper-100, the OG card on ink. A transparent favicon lost
its bands on a browser's dark tab strip (1.06:1) and the transparent OG card
lost them on any client that composites link previews onto white (1.12:1).

Audited every mark on the live site in both themes by reading the computed fill
and the painted ground — `/`, `/privacy`, and every page carrying the standalone
footer. The footer was the only placement that failed; the header and the § 05
tier line were already right.

### Decisions that affect later phases

- **Scope the mark's tokens to the SURFACE, never the theme.** This is the whole
  lesson. A dark band inside a light page needs the on-dark values locally, and
  the only reliable place to put that override is the rule that paints the
  ground. Any new dark band carrying the mark needs the same two lines.
- **`--rph-mark-disc` is deliberately separate from `--rph-red`**, so re-inking
  the mark on a dark band does not re-ink everything else red on it.
- **Rasters we hand to someone else get an opaque ground.** A favicon and an OG
  card are read on a ground we do not choose, and this mark cannot survive that
  transparent.

### Immediate next step

None pending.

## Current phase: LOGO-1 — the new Red Planet Data logo (2026-10-12)

### Completed in this phase

The company mark changed from the notched disc to a banded disc — red above the
horizon, bands below it. The "Red Planet." wordmark is unchanged. Live at
redplanetdata.com on `94b5924` / `dpl_CDhRGiJZhEMHYuoed6LvNZ8CvSW8`, checked by
fetching each file from the live domain and comparing sha256 against the
canonical copy (all eight matched, and the served HTML carries the new inline
mark with no occurrence of the old path).

Replaced: `public/favicon.ico` (16/32/48), `favicon-16.png`, `favicon-32.png`,
`apple-touch-icon.png`, `og-image.png`, the three `public/brand` SVGs, the
design system's two raster assets, and the inline `RedPlanetMark` that
`Header` and `LegalFooter` mount.

### Decisions that affect later phases

- **The canonical logo lives in `rpd/packages/tokens/brand/`**, with the rules
  for picking a variant in its README. Everything in `public/` here is a
  byte-identical copy of a file there, because Next can only serve from
  `public/`. A future logo change edits the canonical folder and re-copies; the
  check is sha256, not eyeballs.
- **The mark is two colours now, which breaks any single-fill copy of it.**
  `RedPlanetMark` takes `--rph-red` for the disc and a new `--rph-mark-band`
  for the bands (ink-900 on paper, paper-100 on ink), so the dark theme renders
  the real on-dark variant rather than an approximation. A `fill="currentColor"`
  copy of this geometry draws a plain disc with the bands invisible.
- **The lockup SVGs set their wordmark as live `<text>` in Geist 400.** Loaded
  through `<img>` they cannot reach the page's webfont and fall back to
  `system-ui`. Inline them, or use a PNG, wherever the wordmark must be exact.
- **This repo has no web manifest.** Nothing was added; `icon-192`/`icon-512`
  exist in the canonical folder if one is ever wanted.

### Immediate next step

None pending.

## Current phase: COFOUNDER-2.3 — the cofounder-coo posting is a founder note (2026-10-10)

### Completed in this phase

The description of the `cofounder-coo` posting was replaced with the founder
note Paul wrote: a shorter piece that opens with "A note from the founder",
drops the paragraph about superseded filings and the docs.redplanetdata.com
pointer, and keeps the three "You are probably a fit if" bullets and the
equity paragraph as they were. Title, status, location, employment type,
`posted_at`, `sort_order` and all five screening questions are untouched, and
no page code changed.

The change was applied in two places that must agree: the live
`public.job_postings` row (one UPDATE, `updated_at` 2026-10-10 19:52:00Z) and
`scripts/jobs_seed_cofounder_coo.sql`, which is the seed of record. Both now
carry the same 1,897-character text — verified by `md5(description)` against
the file, `f89be9fb4dd925d9f1af1da19c73df00`.

### Decisions that affect later phases

- **`{records}` keeps its unit word.** The text Paul supplied read "more than
  {records} verified records". `lib/canonical-metrics.ts` floors the record
  figure to whole **millions** (`recordsMillions`), so the posting has always
  supplied the word "million" itself; rendering the token without it would have
  published "more than 780 verified records". The sentence shipped as "more
  than {records} million verified records from over {sources} unique sources",
  which is how the previous description used the tokens.
- **The description renderer has paragraphs and bullet lists, and nothing
  else** (`renderDescription` in `lib/jobs.ts`). "A note from the founder" is
  therefore a paragraph, not a heading. A posting that needs a real heading
  needs a renderer change first.

### Immediate next step

None pending. The posting re-reads from the database every 300 seconds, so a
further wording change is one UPDATE plus the same edit to the seed file.

## Current phase: RECORDS-6 — the homepage reads as one composition (2026-10-10)

### Completed in this phase

A layout pass over the whole page. No copy changed except the section 05
heading, and the record card's data wiring (RECORDS-5, `f624de6e`) was not
touched: `lib/records-ledger.ts`, `components/RecordsCard.tsx` and the figures
they publish are exactly as RECORDS-5 left them. What changed is where things
sit.

| Area | Was | Is |
|---|---|---|
| 01 Hero | flex row, `align-items:center`, card capped at 460px against an 820px copy column | the same two-column auto-fit grid as 03 and 04, `align-items:stretch`; the card fills its half and both columns start and finish on the same lines |
| 03 Why it's different | columns top-aligned, copy a third shorter than the card beside it; the filings card revealed one row per 2.8s tick | columns centred; all five filings on screen from the first paint |
| 04 How it works | `justify-content:space-between` with both columns capped, leaving ~418x183px of bare band between them | two-column grid, columns adjacent |
| 05 Built on Atlas | three platform cards and LeanCRE as a one-line strip | four equal-height cards, LeanCRE among them with its own lockup |
| Page rhythm | section 05 and 06 padded ~8px deeper than every band above them; four different card paddings | `--card-pad`, `--head-gap` and `--col-gap`, used everywhere |

**The empty dark box in section 04 was never a graphic.** `.rph-engine__head`
was `display:flex` with `justify-content:space-between` and both children
capped (`22ch` and `46ch`), so on a wide viewport a 513px heading and a 430px
paragraph were pushed to opposite ends of a 1328px row. The void between them
was bounded above by the band's top padding and below by the stages' red rule,
which is what made bare band read as a graphic that had failed to load. A DOM
scan of `#engine` found no empty element and no failed request. The design's
own section (`design-system/red-planet/ui_kits/red-planet/Sections.jsx`,
`HowItWorks`) is a two-column auto-fit grid — the `Col` primitive, the same one
sections 01 and 03 use — in which the columns sit next to each other. The fix
was to use it.

### Decisions that affect later phases

- **LeanCRE is a platform card now, and it carries LeanCRE's own logo.** The
  `.rph-licensees` strip it replaced carried a standing rule in its comment:
  "Red Planet never renders another company's logo or brand colour." The
  operator asked for the card and for the real mark, so that rule no longer
  holds for a licensee's own lockup. What it protected is carried instead by
  `.rph-platform__licence`, a line on the card itself reading "Run by a
  separate company that licenses Atlas. Not a Red Planet platform." Nothing
  else on the page uses a LeanCRE colour, font or token.
- **The lockup is LeanCRE's shipped file, not a recreation.**
  `public/brand/leancre-horizontal-{light,dark}.svg` are byte-identical to
  `C:\Users\Atlas\design\leancre\assets\logo\` and to
  `rpd/apps/leancre/public/brand/`, which are themselves identical to each
  other. They are rendered with `<img>` rather than inlined so they stay
  provably the same artwork. The theme picks the variant; neither is
  recoloured.
- **`.rph-platforms` sets its column count explicitly.** `auto-fit` on a 380px
  floor gives three columns at 1440 and would drop the fourth card onto a row
  of its own. Four above 1200px, two between 680 and 1200, one below. Rows are
  stretch, so a row's cards are equal height, and `.rph-platform__link` is
  `margin-top:auto` so every card's last line sits on the same baseline.
- **`.rph-bracket` is computed, not a percentage.** Its ends must land on the
  centres of the outer cards, so it is `calc((100% - 72px) / 8)` at four
  columns and `calc((100% - 24px) / 4)` at two, exact at every width. A fifth
  card would need both of these changed again.
- **Section 03 no longer uses the shared tick** and is a server component
  again. `lib/tick.ts` is still used by section 04.
- **Three tokens now own the page's spacing**: `--card-pad`, `--head-gap`,
  `--col-gap`. A new card or section should use them rather than hand-set
  numbers, which is how the rhythm drifted in the first place.

### Known issues left open

- At 1280 the four platform cards are 274px wide and the copy runs narrow
  (Signal's markets line wraps to two). It holds together and keeps the
  composition identical to 1440, but a fifth card would force the breakpoint
  up or the copy down.
- The section 05 intro still reads "These three are examples", which is still
  true of Red Planet's own three platforms; the sentence after it is what
  introduces a licensee. Left verbatim.

### Immediate next step

None pending.

## Current phase: COFOUNDER-2.2 — the job board at /jobs (2026-10-10)

### Completed in this phase

`redplanetdata.com/jobs` is the company's permanent careers page, and
`/jobs/<slug>` is one posting with its application form. The first posting is
`cofounder-coo`, Co-Founder & Chief Operating Officer.

**Nothing about a posting lives in page code.** Two tables carry it:

| Table | Holds |
|---|---|
| `public.job_postings` | slug, title, status (`open`/`closed`), location text, employment type, the description, and that posting's screening questions as `jsonb` |
| `public.job_applications` | one row per saved application: name, email, LinkedIn URL, note, the answers as asked, and the resume's path in storage |

**Adding a posting is one INSERT into `public.job_postings`** — see
`scripts/jobs_seed_cofounder_coo.sql` for the shape. The pages re-read every 300
seconds (`JOBS_REVALIDATE`), so a new row, or a status change to `closed`,
appears without a deploy. `scripts/jobs_schema.sql` is the DDL as applied.

Resumes go in the existing private `resumes` bucket (`public = false`, 10 MB
ceiling, PDF/.doc/.docx only — storage enforces all three independently). No
public URL for one is ever minted.

### Decisions that affect later phases

- **The record and source counts come from `lib/canonical-metrics.ts`, not from
  the posting text.** A description stores `{records}` and `{sources}` and the
  renderer substitutes them from `atlas_records_headline.records_held` and
  `atlas_stats_cache['active_sources_total']` — the same two canonical objects
  `redplanet-docs-site/scripts/build_atlas_snapshot.py` reads into its snapshot,
  which is what `redplanet-docs-site/lib/metrics.ts` serves. So this site and
  docs.redplanetdata.com cannot state different numbers. Both are floored, so a
  posting understates and never overstates. **With no reading at all the posting
  render throws**, and ISR goes on serving the last good render, for the same
  reason `lib/records-ledger.ts` carries no constant fallback: no page here
  publishes a figure nobody measured.
- **The screening rule is defined once, in `lib/jobs-screening.ts`, and applied
  twice.** The browser stops a disqualified applicant before anything is
  uploaded or saved and shows `DECLINE_NOTE`; `app/api/jobs/apply/route.ts`
  applies the same rule to the same answers and returns 422, because a
  hand-rolled POST walks straight past a client check. A 422 saves no row and
  deletes any resume already uploaded.
- **The route handler re-reads the questions from the posting row**, not from
  the payload, and matches answers onto them by key. An edited payload cannot
  invent a question, drop a required one or soften which answer disqualifies.
- **The resume never passes through the route handler.** A serverless request
  body is capped well below 10 MB, so `app/api/jobs/resume-url/route.ts` mints a
  one-time signed upload URL and the browser uploads straight to the bucket.
  The apply route then proves the object exists by signing a 30-day read URL for
  it, which is the link the notification email carries.
- **Both emails send from `hello@redplanetdata.com`** through the site's
  existing Resend setup (`redplanetdata.com` is a verified Resend domain). The
  applicant gets a short confirmation; `hello@redplanetdata.com` gets every
  answer, the LinkedIn URL, the resume attached when it is under 7 MB, and the
  30-day signed link either way. Both sends are best-effort: the application is
  saved first, so a mail failure never tells an applicant their application did
  not land.
- **Structured data is emitted only while a posting is open.** `JobPosting`
  JSON-LD on an open posting (full-time, `TELECOMMUTE`, United States
  applicants, the posting date, Red Planet Data as hiring organization, no
  salary). Closing the posting in the database removes the JSON-LD and
  `noindex`es the page, with no deploy.
- **Jobs is in the legal footer, not the header nav** (`components/LegalFooter.tsx`).
- **The jobs CSS is one appended block at the end of `app/globals.css`.** Both
  pages reuse `.rph-doc` and the `.rph-form__*`/`.rph-field` system the contact
  modal already defines, so no colour, radius or font is restated. The form
  inputs are 16px rather than the modal's 15px: iOS Safari zooms on focus below
  16px and does not zoom back, and this page is reached from a phone.

### Known issues left open

- **Spam protection is a honeypot, a fill-time floor and 3 submissions per email
  address per posting.** There is no CAPTCHA, by doctrine, and no IP-based
  limit.
- A resume uploaded on a signed URL by someone who then abandons the form stays
  in the bucket as an orphan. Nothing sweeps those yet.

### Immediate next step

None pending. Opening or closing a role is a database change.


## Current phase: RECORDS-5 — the record card reads the records ledger (2026-10-09)

### Completed in this phase

The homepage record card (`components/RecordsCard.tsx`, fed by
`lib/records-ledger.ts`) now reads Atlas's **records ledger**, the same source
Mission Control's headline uses, instead of the live-in-Postgres figures
HOMEPAGE-1 wired it to on 2026-10-05.

| Card part | Reads |
|---|---|
| Headline | `atlas_records_headline.records_held` — records held, live and archived together |
| Subline | `atlas_records_ledger_days.measured_live` / `.measured_stored` for `atlas_records_headline.as_of` |
| 30-day chart | `atlas_records_ledger_days.closing_total`, the 30 days ending on that same day |
| Latest Update | `atlas_records_last_night.new_records` |
| "N ago" label | `atlas_records_headline.closed_at` — when the count was taken |

`lib/record-stats.ts` and its views (`atlas_public_record_stats`,
`atlas_public_record_history`) are no longer read by anything in this repo.

### Decisions that affect later phases

- **The split is read from the headline's own day, not the newest ledger row.**
  A day whose count check has not passed is not published, and the headline
  holds on the last day that did (on 2026-10-09 the headline is 2026-10-08's).
  Taking `measured_live` / `measured_stored` from the newest row would put a
  subline on screen that does not add up to the headline above it. Mission
  Control does take them from the newest row, so the two surfaces can show the
  same headline with a differing split on a day under review.
- **The chart window ends on the headline's day** for the same reason: its last
  point equals the headline exactly.
- **`lib/records-ledger.ts` is a public read path.** It selects columns, never
  `*`, and returns only the seven fields the card renders. The ledger views also
  carry work in progress, per-source counts, anomaly counts, close status, a
  day's difference and tolerance, and the prose reason recorded for a day that
  did not match — none of which may reach a public page.
- **Last good figures, not placeholders.** A successful read is kept in a
  module-level `lastGood` and served if a later read fails, on top of Next's ISR
  keeping the last good render. Nothing on this page may publish a figure
  nobody measured, so there is still no constant fallback and the render throws
  when no reading has ever succeeded.

### Known issues left open

- **Two real dips sit inside the 30-day window**: 2026-09-20 (−624,330) and
  2026-09-28 (−1,548,658). Both are records deliberately removed
  (`removed_total` 944,010 and 2,183,511) on days that balanced, not storage
  moves — `moved_total` is 0 on both. They roll out of the window on 2026-10-20
  and 2026-10-28.
- RECORDS-4 was restating records held while this shipped and will lower the
  headline when it finishes. Nothing here is hardcoded, so the card follows.

### Immediate next step

None pending. The card updates itself after each nightly close (ledger closes
~09:45 ET, card re-reads within 5 minutes of a request after that).
