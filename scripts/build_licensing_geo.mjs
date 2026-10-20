// COUNTY-9 (2026-10-20): builds public/licensing/map.json, the state maps and the town list of the /licensing picker.
//
//   maps   Connecticut's nine planning regions and Florida's 67 counties as SVG paths, each state fitted to a 560-wide
//          box, from atlas-dash's public/geo/cb2023-500k.json (2023 Census cartographic boundaries at 1:500,000, the
//          file the shared Signal license page draws its map from; atlas-dash scripts/geo/build-cb500k.mjs).
//   towns  [name, county FIPS] for the picker's search. Connecticut: every town, from Red Planet Data's own town to
//          planning region crosswalk (atlas_county_catalog_ct_crosswalk), passed in as JSON rows
//          {town_name, region_fips}. Florida: every 2023 Gazetteer place (cities, towns, villages and census-designated
//          places), placed in its county by its internal point.
//
// d3-geo and topojson-client are loaded from the atlas-dashboard checkout, as scripts/verify_licensing.mjs loads
// playwright-core, so this repo takes no new dependency.
//
//   node scripts/build_licensing_geo.mjs --topo <cb2023-500k.json> --gaz <2023_Gaz_place_national.txt> \
//        --ct-towns <crosswalk rows .json> [--dash C:/Users/Atlas/atlas-dashboard]

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null }
const TOPO = arg('--topo'), GAZ = arg('--gaz'), CT = arg('--ct-towns')
const DASH = arg('--dash') ?? 'C:/Users/Atlas/atlas-dashboard'
if (!TOPO || !GAZ || !CT) { console.error('--topo, --gaz and --ct-towns are required'); process.exit(2) }

const { geoMercator, geoPath, geoContains } = await import(pathToFileURL(join(DASH, 'node_modules/d3-geo/src/index.js')).href)
const { feature } = await import(pathToFileURL(join(DASH, 'node_modules/topojson-client/src/index.js')).href)

const W = 560
const PAD = 12
const STATES = { CT: '09', FL: '12' }

const topo = JSON.parse(readFileSync(TOPO, 'utf8'))
const counties = feature(topo, topo.objects.counties).features
const states = feature(topo, topo.objects.states).features

const out = { maps: {}, towns: [] }
for (const [st, sf] of Object.entries(STATES)) {
  const outline = states.find((f) => String(f.properties.id) === sf)
  const regions = counties.filter((f) => String(f.properties.id).startsWith(sf))
  const projection = geoMercator().fitWidth(W - PAD * 2, outline)
  const [[x0, y0], [, y1]] = geoPath(projection).bounds(outline)
  const [tx, ty] = projection.translate()
  projection.translate([tx + PAD - x0, ty + PAD - y0])
  const draw = geoPath(projection).digits(1)
  out.maps[st] = {
    w: W,
    h: Math.ceil(y1 - y0 + PAD * 2),
    outline: draw(outline),
    counties: regions.map((f) => ({ fips: String(f.properties.id), d: draw(f) })).sort((a, b) => a.fips.localeCompare(b.fips)),
  }
  console.log(`${st}: ${regions.length} counties, ${out.maps[st].h} high`)
}

// Connecticut towns, from the crosswalk. A town listed under more than one region keeps each.
const seen = new Set()
const push = (name, fips) => {
  const k = `${name}|${fips}`
  if (!seen.has(k)) { seen.add(k); out.towns.push([name, fips]) }
}
for (const r of JSON.parse(readFileSync(CT, 'utf8'))) {
  push(String(r.town_name).replace(/ (town|city|borough)$/, ''), String(r.region_fips))
}

// Florida places, by internal point.
const fl = counties.filter((f) => String(f.properties.id).startsWith('12'))
const rows = readFileSync(GAZ, 'utf8').split(/\r?\n/).slice(1).filter((l) => l.startsWith('FL\t'))
let missed = 0
for (const l of rows) {
  const c = l.split('\t').map((s) => s.trim())
  const name = c[3].replace(/ (city|town|village|CDP)$/, '')
  const pt = [Number(c[11]), Number(c[10])]
  const hit = fl.find((f) => geoContains(f, pt))
  if (hit) push(name, String(hit.properties.id))
  else missed++
}
out.towns.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]))
console.log(`towns: ${out.towns.length} (Florida places outside every county polygon: ${missed})`)

const dest = join(ROOT, 'public', 'licensing', 'map.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${(readFileSync(dest).length / 1024).toFixed(0)} KB`)
