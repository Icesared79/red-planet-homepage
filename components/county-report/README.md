# County report components (ported from atlas-dash)

The County Catalog's visual county report, as the operator county page and the client offer page in
`atlas-dashboard` draw it, brought into the website for redplanetdata.com/how-atlasland-works (LAND-5.3,
2026-10-23) so the two look like one product.

| File | From | What |
|---|---|---|
| `report-types.ts` | `atlas-dashboard/lib/county-catalog/report-types.ts` | the report's shapes; `ReportMap.marks` added |
| `report-view.tsx` | `atlas-dashboard/lib/county-catalog/report-view.tsx` | charts, the region map (with marks), the neighbor comparison, "what we found" |
| `report.css` | `atlas-dashboard/lib/county-catalog/report.css` | the `cr-` styles, tokens only; marks block added |
| `score-block.tsx` | the county page's score metrics and group-scores table (`app/county-catalog/[fips]/page.tsx`) | overall score, rank, band and the five group scores |

The data comes from `atlas-dashboard/scripts/_land53_county_report_export.ts`, which runs the catalog's own
builder (`lib/county-catalog/report.ts`) and is called by Levelpie `atlas/ops/_land52_wilson_snapshot.py`; the
export lands under `catalog` in `public/data/wilson-county-tn-<as_of>.json`. Styles are the Red Planet design
system in Git (`rpd` `packages/red-planet-design`); the page builder inlines `report.css` after the package's
`components.css`.

Three deliberate differences from the originals: no `import './report.css'` (the static builder inlines the
sheet), the marks, and the word "public" does not appear in the website's own copy, so the airport key says
"Other airport", the facts row "Airports", and the classes `is-public` / `cr-key__airport-public` are `is-open` / `cr-key__airport-open`. Change the atlas-dash files first and port here, not the other way.
