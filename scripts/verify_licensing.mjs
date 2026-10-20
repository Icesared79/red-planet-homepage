// Verify /licensing (COUNTY-9 and COUNTY-9.1, 2026-10-20): the page as a store, read live.
//
//   node scripts/verify_licensing.mjs [--base https://redplanetdata.com] [--out <dir>] [--submit <email>]
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment: the expected figures, filing types
// and Florida counties are read from the tables themselves, never from this file.
//
// What it proves, signed out, at 1440 and at 390:
//   - the page answers 200, carries noindex, and the homepage does not link to it;
//   - the order: the header (one sentence and one screenshot), the three options, the picker, the questions (six,
//     closed);
//   - figures (9.1): every figure in the cards and the opened questions is the residential pricing table's own
//     (atlas_county_catalog_pricing_inputs): seats included, seat-pack size and percentage, multi-county minimum and
//     percentage, whole-state percentage, white-label price and least people; and no other number appears there;
//   - wording (9.1): the header, the Individual and Firm cards and question 1 name the filing types with a current
//     count in the state viewed (atlas_county_catalog_residential_activity, as of the last 14 days, over the counties
//     offered), and before a state is chosen the types held in every state;
//   - Florida (9.1): the map offers exactly the Florida counties with a current foreclosure count, draws the rest as on
//     request, and shows "Other Florida counties are available on request."; its link opens the request form with the
//     state set to Florida and a field for the counties wanted. Connecticut offers all nine;
//   - the store: a town search for Glastonbury returns Capitol Region; three Connecticut counties chosen on the map as
//     a firm of 50 people total what the catalog's own firm quote gives (atlas_county_catalog_quote_residential); each
//     line shows its current 90-day filings; one "Request this license" button;
//   - with --submit, one on-request submission for Florida is sent with that email as the person's address (the email
//     goes to hello@redplanetdata.com only) and the thank-you is shown;
//   - no banned word, "seat" never in a heading, card or label, fonts per role, no horizontal page scroll at 390.
// Screenshots go to --out.
//
// playwright-core is not a dependency of this repo; it is loaded from the atlas-dashboard checkout on atlas-mini
// (--playwright to point elsewhere).

import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d }
const BASE = arg('--base', 'https://redplanetdata.com').replace(/\/$/, '')
const OUT = arg('--out', join(process.cwd(), '_licensing_screens'))
const SUBMIT = arg('--submit', null)
const PW = arg('--playwright', 'C:/Users/Atlas/atlas-dashboard/node_modules/playwright-core/index.mjs')
const CHROME = process.env.CHROME_PATH || 'C:/Users/Atlas/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SB_URL || !SB_KEY) { console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'); process.exit(2) }
mkdirSync(OUT, { recursive: true })
const { chromium } = await import(pathToFileURL(PW).href)

const PICK = ['09110', '09120', '09190'] // Capitol Region, Greater Bridgeport, Western Connecticut
const PEOPLE = 50
const BANNED = [
  'seat blocks', 'blocks', 'loaded into Signal', 'loaded', 'standing terms', 'record types', 'carry', 'level', 'band',
  'surveyed', 'licensee', 'licensor', 'territory', 'leverage', 'unlock', 'seamless', 'empower', 'robust',
  'comprehensive', 'public',
].map((w) => [w, new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i')]).concat([['Atlas', /\bAtlas\b/]])
const results = []
const ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`) }
const usd = (v) => `$${Math.round(v).toLocaleString('en-US')}`
const range = (lo, hi) => (Math.round(lo) === Math.round(hi) ? usd(hi) : `${usd(lo)} to ${usd(hi)}`)
const norm = (s) => s.replace(/\s+/g, ' ').replace(/’/g, "'").trim()

async function rest(path, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status} ${await r.text()}`)
  return r.json()
}

// ── what the tables hold ─────────────────────────────────────────────────────────────────
const table = Object.fromEntries((await rest('atlas_county_catalog_pricing_inputs?select=input_key,value&track=eq.residential')).map((r) => [r.input_key, Number(r.value)]))
const T = {
  seats: table.res_seats_included, step: table.res_seat_block_size, stepPct: table.res_seat_block_pct,
  bundleMin: table.res_bundle_min_counties, bundlePct: table.res_bundle_discount_pct, statePct: table.res_state_discount_pct,
  indPct: table.res_individual_pct, indFloor: table.res_individual_floor, wlPrice: table.res_white_label_price, wlMin: table.res_white_label_min_seats,
}
console.log(`pricing table: ${JSON.stringify(T)}`)
const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
const avail = (await rest('atlas_county_catalog_residential?select=fips&available=eq.true')).map((r) => r.fips).filter((f) => /^(09|12)/.test(f))
const act = (await rest(`atlas_county_catalog_residential_activity?select=fips,record_type,n90,as_of&record_type=in.(foreclosure,probate)&as_of=gte.${cutoff}`))
  .filter((a) => a.n90 !== null && avail.includes(a.fips))
const flOffered = avail.filter((f) => f.startsWith('12') && act.some((a) => a.fips === f && a.record_type === 'foreclosure')).sort()
const offered = { CT: avail.filter((f) => f.startsWith('09')), FL: flOffered }
const heldIn = (st) => ['foreclosure', 'probate'].filter((t) => act.some((a) => a.record_type === t && offered[st].includes(a.fips)))
const HELD = { CT: heldIn('CT'), FL: heldIn('FL') }
HELD.none = ['foreclosure', 'probate'].filter((t) => HELD.CT.includes(t) && HELD.FL.includes(t))
const headline = (ts) => `Signal shows your agents every new ${ts.join(' and ')} filing in the counties you license, with the owner's contact details.`
console.log(`held: CT ${HELD.CT.join('+')} | FL ${HELD.FL.join('+')} | before a state ${HELD.none.join('+')}; Florida offered ${flOffered.length}: ${flOffered.join(', ')}`)

async function buildSelection(page) {
  await page.locator('[data-licensing="state-tab"][data-state="CT"]').click()
  await page.locator('[data-licensing="mode"][data-mode="firm"]').click()
  for (const f of PICK) await page.locator(`[data-licensing="map-county"][data-fips="${f}"]`).click()
  while (Number((await page.locator('[data-licensing="people"]').innerText()).replace(/,/g, '')) < PEOPLE) {
    await page.locator('[data-licensing="people-more"]').click()
  }
  await page.waitForFunction((n) => document.querySelectorAll('[data-licensing="line"]').length === n, PICK.length, { timeout: 15000 })
  await page.waitForTimeout(600)
}
const typesOn = async (page) => ({
  header: norm(await page.locator('[data-licensing="headline"]').innerText()),
  cards: (await page.locator('[data-licensing="plan-filings"]').allInnerTexts()).map(norm),
  q1: norm(await page.locator('[data-licensing="question"]').first().locator('.lp-faq__a').evaluate((e) => e.textContent)),
})
const wordingIs = (w, ts) => w.header === headline(ts)
  && w.cards.length === 2 && w.cards.every((c) => c === `Every new ${ts.join(' and ')} filing in your counties`)
  && w.q1.startsWith(`Signal shows the new ${ts.join(' and ')} filings Red Planet Data collects`)

const browser = await chromium.launch({ executablePath: existsSync(CHROME) ? CHROME : undefined })
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' })
  const page = await ctx.newPage()
  const res = await page.goto(`${BASE}/licensing`, { waitUntil: 'networkidle' })
  ok('the page answers 200', res.status() === 200, `${res.status()}`)
  const robots = await page.getAttribute('meta[name="robots"]', 'content').catch(() => null)
  ok('noindex', /noindex/.test(robots ?? ''), robots ?? 'no robots meta')
  const order = await page.locator('.lp-doc > section').evaluateAll((s) => s.map((x) => x.getAttribute('data-licensing')))
  ok('order: header, options, picker, questions', JSON.stringify(order) === JSON.stringify(['summary', 'plans', 'picker', 'questions']), order.join(' / '))
  ok('header: one screenshot', (await page.locator('[data-licensing="summary"] img').count()) === 1
    && (await page.locator('[data-licensing="signal-shot"]').evaluate((i) => i.naturalWidth)) > 0)
  const qs = page.locator('[data-licensing="question"]')
  ok('six questions, closed by default', (await qs.count()) === 6 && (await qs.evaluateAll((d) => d.every((x) => !x.open))))

  // wording before a state is chosen
  const w0 = await typesOn(page)
  ok(`before a state: header, cards and question 1 name ${HELD.none.join(' and ')} only`, wordingIs(w0, HELD.none), w0.header)
  await page.screenshot({ path: join(OUT, 'licensing-desktop-top-no-state.png') })

  // figures: every number in the cards and the opened questions is the pricing table's
  await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true }))
  const cardText = norm((await page.locator('[data-licensing="plan"] .lp-plan__list').allInnerTexts()).join(' | ') + ' | '
    + (await page.locator('[data-licensing="branding-price"]').innerText()))
  const qText = norm((await qs.evaluateAll((d) => d.map((x) => x.querySelector('.lp-faq__a').textContent))).join(' | '))
  const expectPhrases = [
    [`cards: ${T.seats} people included`, cardText.includes(`${T.seats} people included`)],
    [`cards: more people ${T.step} at a time`, cardText.includes(`More people available ${T.step} at a time`)],
    [`cards: lower prices for ${T.bundleMin} or more counties`, (cardText.match(new RegExp(`Lower prices for ${T.bundleMin} or more counties`, 'g')) ?? []).length === 2],
    [`cards: white label ${usd(T.wlPrice)}, firms of ${T.wlMin}`, cardText.includes(usd(T.wlPrice)) && cardText.includes(`For firms of ${T.wlMin} or more people`)],
    [`Q2: ${T.seats} people, ${T.step} at a time, ${T.stepPct}%`, qText.includes(`includes ${T.seats} people`) && qText.includes(`${T.step} at a time, and each ${T.step} more adds ${T.stepPct}%`)],
    [`Q3: ${T.bundleMin} or more counties ${T.bundlePct}%, whole state ${T.statePct}%`, qText.includes(`With ${T.bundleMin} or more counties the price drops by ${T.bundlePct}%, and with every county in a state it drops by ${T.statePct}%`)],
    [`Q6: firms of ${T.wlMin}, ${usd(T.wlPrice)} a year`, qText.includes(`For firms of ${T.wlMin} or more people`) && qText.includes(`It costs ${usd(T.wlPrice)} a year`)],
  ]
  for (const [k, pass] of expectPhrases) ok(`figure from the pricing table, ${k}`, pass)
  const allowed = new Set([T.seats, T.step, T.stepPct, T.bundleMin, T.bundlePct, T.statePct, T.wlMin, T.wlPrice, T.indPct, T.indFloor].map(String))
  const nums = [...`${cardText} | ${qText}`.matchAll(/\$?(\d[\d,]*)%?/g)].map((m) => m[1].replace(/,/g, ''))
  const stray = nums.filter((n) => !allowed.has(n))
  ok('no other number in the cards or the questions', stray.length === 0, `numbers: ${[...new Set(nums)].join(', ')}${stray.length ? `; stray: ${stray.join(', ')}` : ''}`)
  console.log(`  questions as shown: ${qText}`)

  // Connecticut and Florida wording, and the Florida counties offered
  await page.locator('[data-licensing="state-tab"][data-state="CT"]').click()
  await page.waitForSelector('[data-licensing="map-county"]')
  const wCT = await typesOn(page)
  ok(`Connecticut: header, cards and question 1 name ${HELD.CT.join(' and ')}`, wordingIs(wCT, HELD.CT), wCT.header)
  ok('Connecticut offers all nine, nothing on request', (await page.locator('[data-licensing="map-county"]').count()) === 9
    && (await page.locator('[data-licensing="map-county-off"]').count()) === 0 && (await page.locator('[data-licensing="on-request-line"]').count()) === 0)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: join(OUT, 'licensing-desktop-top-connecticut.png') })
  await page.locator('[data-licensing="state-tab"][data-state="FL"]').click()
  await page.waitForSelector('[data-licensing="map"][data-state="FL"]')
  const wFL = await typesOn(page)
  ok(`Florida: header, cards and question 1 name ${HELD.FL.join(' and ')}`, wordingIs(wFL, HELD.FL), wFL.header)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: join(OUT, 'licensing-desktop-top-florida.png') })
  const flOn = (await page.locator('[data-licensing="map-county"]').evaluateAll((ps) => ps.map((p) => `${p.getAttribute('data-fips')} ${p.getAttribute('aria-label')}`))).sort()
  const flOff = await page.locator('[data-licensing="map-county-off"]').count()
  ok('Florida offers exactly the counties with a current foreclosure count', JSON.stringify(flOn.map((x) => x.slice(0, 5))) === JSON.stringify(flOffered), flOn.join('; '))
  ok('the other Florida counties are drawn as on request', flOff === 67 - flOffered.length, `${flOff}`)
  const line = norm(await page.locator('[data-licensing="on-request-line"]').innerText())
  ok('the on-request line', line === 'Other Florida counties are available on request.', line)
  await page.locator('#choose').screenshot({ path: join(OUT, 'licensing-desktop-picker-florida.png') })

  // town search, the selection and its total
  await page.locator('[data-licensing="search"]').fill('Glastonbury')
  const found = (await page.locator('[data-licensing="search-result"]').allInnerTexts()).map(norm)
  ok('a town search for Glastonbury returns Capitol Region', found.some((t) => /^Glastonbury\b.*Capitol Region/.test(t)), found.join(' | '))
  await page.locator('[data-licensing="search"]').fill('')
  await buildSelection(page)
  await page.locator('#choose').screenshot({ path: join(OUT, 'licensing-desktop-picker-ct3-firm50.png') })
  const lines = await page.locator('[data-licensing="line"]').evaluateAll((ls) => ls.map((l) => ({
    fips: l.getAttribute('data-fips'), filings: l.querySelector('[data-licensing="line-filings"]')?.textContent?.trim() ?? null,
  })))
  const total = (await page.locator('[data-licensing="total"]').innerText()).trim()
  const q = await rest('rpc/atlas_county_catalog_quote_residential', { p_fips: PICK, p_seats: PEOPLE })
  ok(`total matches the catalog's firm quote for 3 counties at ${PEOPLE} people`, total === range(Number(q.total_low), Number(q.total_high)), `page ${total}`)
  ok('each line shows its current 90-day filings', lines.every((l) => act.filter((a) => a.fips === l.fips)
    .every((a) => (l.filings ?? '').includes(`${Number(a.n90).toLocaleString('en-US')} ${a.record_type}`))), lines.map((l) => `${l.fips}: ${l.filings}`).join('; '))
  const buttons = await page.locator('[data-licensing="cart"] button.lp-btn').allInnerTexts()
  ok('one button under the total: Request this license', buttons.length === 1 && buttons[0].trim() === 'Request this license')

  // the words
  await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true }))
  const text = [await page.evaluate(() => document.body.innerText), await page.evaluate(() => [...document.images].map((i) => i.alt).join(' ')),
    await page.title(), (await page.getAttribute('meta[name="description"]', 'content')) ?? ''].join(' ').replace(/\s+/g, ' ')
  const hits = BANNED.filter(([, re]) => re.test(text)).map(([k, re]) => `${k}: "${text.slice(Math.max(0, text.search(re) - 40), text.search(re) + 30)}"`)
  ok(`no banned word in the page text (${BANNED.length} words and phrases)`, hits.length === 0, hits.join('; '))
  const heads = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, summary, .lp-label, .lp-plan__list, .lp-people__label')].map((e) => e.textContent).join(' | '))
  ok('"seat" only in the price detail', !/\bseats?\b/i.test(heads))
  const fonts = await page.evaluate(() => ({ h1: getComputedStyle(document.querySelector('.lp-h1')).fontFamily, figure: getComputedStyle(document.querySelector('[data-licensing="total"]')).fontFamily }))
  ok('headline Geist, figures Fragment Mono', /^Geist/.test(fonts.h1) && /Fragment Mono/.test(fonts.figure))
  ok('desktop: no horizontal scroll', (await page.evaluate(() => document.documentElement.scrollWidth)) <= 1440)

  // other Florida counties, on request
  await page.locator('[data-licensing="state-tab"][data-state="FL"]').click()
  await page.locator('[data-licensing="on-request-link"]').click()
  await page.waitForSelector('[data-licensing="on-request-form"]')
  ok('the link opens the request form with the state set to Florida and a counties field',
    norm(await page.locator('[data-licensing="on-request-state"]').innerText()) === 'Other Florida counties' && (await page.locator('[data-licensing="f-wanted"]').count()) === 1)
  await page.locator('[data-licensing="cart"]').screenshot({ path: join(OUT, 'licensing-desktop-on-request-form.png') })
  if (SUBMIT) {
    await page.locator('[data-licensing="f-wanted"]').fill('Alachua County and Duval County (COUNTY-9.1 verification)')
    await page.locator('[data-licensing="f-name"]').fill('COUNTY-9.1 verification')
    await page.locator('[data-licensing="f-firm"]').fill('Red Planet Data test request')
    await page.locator('[data-licensing="f-email"]').fill(SUBMIT)
    await page.locator('[data-licensing="f-phone"]').fill('555-0100')
    const [resp] = await Promise.all([page.waitForResponse((r) => r.url().includes('/api/licensing/request')), page.locator('[data-licensing="send"]').click()])
    const j = await resp.json().catch(() => ({}))
    await page.waitForSelector('[data-licensing="request-done"][data-kind="other"]', { timeout: 15000 })
    ok('on-request submission sent and thanked', resp.status() === 200 && j.ok === true, `submission ${j.id}`)
  }

  const home = await ctx.newPage()
  await home.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  ok('the homepage does not link to /licensing', (await home.locator('a[href*="/licensing"]').count()) === 0)
  await ctx.close()

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light' })
  const ph = await phone.newPage()
  await ph.goto(`${BASE}/licensing`, { waitUntil: 'networkidle' })
  await ph.screenshot({ path: join(OUT, 'licensing-phone-top-no-state.png') })
  for (const s of ['CT', 'FL']) {
    await ph.locator(`[data-licensing="state-tab"][data-state="${s}"]`).click()
    await ph.waitForSelector(`[data-licensing="map"][data-state="${s}"]`)
    await ph.evaluate(() => window.scrollTo(0, 0))
    await ph.screenshot({ path: join(OUT, `licensing-phone-top-${s === 'CT' ? 'connecticut' : 'florida'}.png`) })
  }
  await ph.locator('#choose').screenshot({ path: join(OUT, 'licensing-phone-picker-florida.png') })
  await buildSelection(ph)
  await ph.locator('#choose').screenshot({ path: join(OUT, 'licensing-phone-picker-ct3-firm50.png') })
  ok('390: same total as desktop', (await ph.locator('[data-licensing="total"]').innerText()).trim() === total)
  const w = await ph.evaluate(() => document.documentElement.scrollWidth)
  ok('390: no horizontal page scroll', w <= 390, `${w}`)
  await phone.close()
} catch (e) {
  ok('run completed', false, e instanceof Error ? e.message : String(e))
} finally {
  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length} PASS, ${failed.length} FAIL  screenshots: ${OUT}`)
  process.exit(failed.length ? 1 : 0)
}
