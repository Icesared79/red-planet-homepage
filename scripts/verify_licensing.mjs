// Verify /licensing (COUNTY-9, 2026-10-20): the page as a store, read live.
//
//   node scripts/verify_licensing.mjs [--base https://redplanetdata.com] [--out <dir>] [--submit <email>]
//
// What it proves, signed out, at 1440 and at 390:
//   - the page answers 200, carries noindex, and the homepage does not link to it;
//   - the order: the header (one sentence and one screenshot), the three options (Individual, Firm, Firm with your
//     branding, each with a dollar figure), the picker, the questions (six, all closed);
//   - the picker: Connecticut's map has 9 counties and Florida's 67; a town search for Glastonbury returns Capitol
//     Region; three Connecticut counties chosen on the map as a firm of 50 people show three lines, and the total
//     equals the County Catalog's own firm quote for the same counties and people
//     (atlas_county_catalog_quote_residential, the function the catalog's quote tool prices with), called here with
//     the service key from NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in the environment;
//   - filing counts: a chosen county shows its 90-day count only when the catalog's as-of date is within 14 days,
//     checked against the activity rows themselves (Indian River, Florida, is the standing stale example);
//   - one button under the total, "Request this license"; with --submit, one request is sent with that email as the
//     person's address (the email goes to hello@redplanetdata.com only) and the thank-you is shown;
//   - no banned word anywhere in the page text, its image text or its title, with every question opened; "seat"
//     never in a heading, a card or a label;
//   - fonts per role (Geist headline, Fragment Mono figures), no horizontal page scroll at 390.
// Screenshots go to --out: the top of the page and the picker with the three counties, at both widths.
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

async function rest(path, body) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { apikey: SB_KEY, authorization: `Bearer ${SB_KEY}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status} ${await r.text()}`)
  return r.json()
}

/** Choose the three counties on the Connecticut map as a firm of 50 people; returns the cart's text. */
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
  const headline = (await page.locator('[data-licensing="headline"]').innerText()).trim()
  ok('header: one sentence and one screenshot', (headline.match(/[.?]/g) ?? []).length === 1
    && (await page.locator('[data-licensing="summary"] img').count()) === 1
    && (await page.locator('[data-licensing="signal-shot"]').evaluate((i) => i.naturalWidth)) > 0, headline)
  const plans = await page.locator('[data-licensing="plan"]').evaluateAll((ps) => ps.map((p) => ({ plan: p.getAttribute('data-plan'), text: p.innerText.replace(/\s+/g, ' ').trim() })))
  ok('three options: Individual, Firm, Firm with your branding', plans.map((p) => p.plan).join(',') === 'individual,firm,branding')
  ok('each option shows a dollar figure', plans.every((p) => /\$[\d,]+/.test(p.text)), plans.map((p) => p.text).join(' || '))
  const qs = page.locator('[data-licensing="question"]')
  ok('five or six questions, closed by default', [5, 6].includes(await qs.count())
    && (await qs.evaluateAll((d) => d.every((x) => !x.open))), `${await qs.count()}`)
  await page.screenshot({ path: join(OUT, 'licensing-desktop-top.png') })
  await page.screenshot({ path: join(OUT, 'licensing-desktop-full.png'), fullPage: true })

  // the maps
  await page.waitForSelector('[data-licensing="map-county"]')
  const ctN = await page.locator('[data-licensing="map-county"]').count()
  await page.locator('[data-licensing="state-tab"][data-state="FL"]').click()
  const flN = await page.locator('[data-licensing="map-county"]').count()
  ok('maps: 9 Connecticut and 67 Florida counties', ctN === 9 && flN === 67, `${ctN} / ${flN}`)

  // town search
  await page.locator('[data-licensing="search"]').fill('Glastonbury')
  const found = (await page.locator('[data-licensing="search-result"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim())
  ok('a town search for Glastonbury returns Capitol Region', found.some((t) => /^Glastonbury\b.*Capitol Region/.test(t)), found.join(' | '))
  await page.locator('[data-licensing="search"]').fill('')

  // the selection and its total against the catalog
  await buildSelection(page)
  const lines = await page.locator('[data-licensing="line"]').evaluateAll((ls) => ls.map((l) => ({
    fips: l.getAttribute('data-fips'), price: l.querySelector('[data-licensing="line-price"]')?.textContent?.trim(),
    filings: l.querySelector('[data-licensing="line-filings"]')?.textContent?.trim() ?? null,
  })))
  const total = (await page.locator('[data-licensing="total"]').innerText()).trim()
  await page.locator('#choose').screenshot({ path: join(OUT, 'licensing-desktop-picker-ct3-firm50.png') })
  ok('three Connecticut lines, each with a price', lines.length === 3 && lines.every((l) => /^\$[\d,]+/.test(l.price ?? '')), JSON.stringify(lines))
  if (SB_URL && SB_KEY) {
    const q = await rest('rpc/atlas_county_catalog_quote_residential', { p_fips: PICK, p_seats: PEOPLE })
    const want = range(Number(q.total_low), Number(q.total_high))
    ok(`total matches the catalog's firm quote for 3 counties at ${PEOPLE} people`, total === want, `page ${total} / catalog ${want}`)
    const act = await rest(`atlas_county_catalog_residential_activity?select=fips,record_type,n90,as_of&record_type=in.(foreclosure,probate)&fips=in.(${PICK.join(',')},12061)`)
    const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
    const fresh = (f) => act.filter((a) => a.fips === f && a.as_of >= cutoff)
    ok('each line shows its 90-day filings exactly when they are current',
      lines.every((l) => (fresh(l.fips).length > 0) === (l.filings !== null)
        && fresh(l.fips).every((a) => (l.filings ?? '').includes(`${Number(a.n90).toLocaleString('en-US')} ${a.record_type}`))),
      lines.map((l) => `${l.fips}: ${l.filings ?? '(none)'}`).join('; '))
    const ir = act.find((a) => a.fips === '12061')
    if (ir && ir.as_of < cutoff) {
      await page.locator('[data-licensing="search"]').fill('Vero Beach')
      await page.locator('[data-licensing="search-result"][data-fips="12061"]').first().click()
      await page.waitForSelector('[data-licensing="line"][data-fips="12061"]')
      const irText = (await page.locator('[data-licensing="line"][data-fips="12061"]').innerText()).replace(/\s+/g, ' ')
      ok(`a stale count (Indian River, as of ${ir.as_of}) shows nothing, no dash and no date`, !/filing|—|20\d\d/.test(irText), irText)
      await page.locator('[data-licensing="line"][data-fips="12061"] .lp-line__x').click()
      await page.waitForFunction(() => document.querySelectorAll('[data-licensing="line"]').length === 3)
      await page.waitForTimeout(600)
      ok('the total returns when the Florida county is taken off', (await page.locator('[data-licensing="total"]').innerText()).trim() === total)
    }
  } else {
    console.log('  (no NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in the environment: catalog comparison skipped)')
    ok('catalog comparison ran', false, 'service credentials missing')
  }
  const buttons = await page.locator('[data-licensing="cart"] button.lp-btn').allInnerTexts()
  ok('one button under the total: Request this license', buttons.length === 1 && buttons[0].trim() === 'Request this license', buttons.join(' | '))

  // the words
  await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true }))
  const text = [
    await page.evaluate(() => document.body.innerText),
    await page.evaluate(() => [...document.images].map((i) => i.alt).join(' ')),
    await page.title(),
    (await page.getAttribute('meta[name="description"]', 'content')) ?? '',
  ].join(' ').replace(/\s+/g, ' ')
  const hits = BANNED.filter(([, re]) => re.test(text)).map(([k, re]) => `${k}: "${text.slice(Math.max(0, text.search(re) - 40), text.search(re) + 30)}"`)
  ok(`no banned word in the page text (${BANNED.length} words and phrases)`, hits.length === 0, hits.join('; '))
  const heads = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, summary, .lp-label, .lp-plan__list, .lp-people__label')].map((e) => e.textContent).join(' | '))
  ok('"seat" only in the price detail, never a heading, card or label', !/\bseats?\b/i.test(heads))
  const fonts = await page.evaluate(() => ({
    h1: getComputedStyle(document.querySelector('.lp-h1')).fontFamily,
    figure: getComputedStyle(document.querySelector('[data-licensing="total"]')).fontFamily,
  }))
  ok('headline Geist, figures Fragment Mono', /^Geist/.test(fonts.h1) && /Fragment Mono/.test(fonts.figure), `${fonts.h1} / ${fonts.figure}`)
  ok('desktop: no horizontal scroll', (await page.evaluate(() => document.documentElement.scrollWidth)) <= 1440)

  // one request
  if (SUBMIT) {
    await page.locator('[data-licensing="request"]').click()
    await page.locator('[data-licensing="f-name"]').fill('COUNTY-9 verification')
    await page.locator('[data-licensing="f-firm"]').fill('Red Planet Data test request')
    await page.locator('[data-licensing="f-email"]').fill(SUBMIT)
    await page.locator('[data-licensing="f-phone"]').fill('555-0100')
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/licensing/request')),
      page.locator('[data-licensing="send"]').click(),
    ])
    const j = await resp.json().catch(() => ({}))
    await page.waitForSelector('[data-licensing="request-done"]', { timeout: 15000 })
    ok('request sent and thanked', resp.status() === 200 && j.ok === true, `submission ${j.id}; ${j.total}`)
  }

  const home = await ctx.newPage()
  await home.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  ok('the homepage does not link to /licensing', (await home.locator('a[href*="/licensing"]').count()) === 0)
  await ctx.close()

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light' })
  const ph = await phone.newPage()
  await ph.goto(`${BASE}/licensing`, { waitUntil: 'networkidle' })
  await ph.screenshot({ path: join(OUT, 'licensing-phone-top.png') })
  await ph.waitForSelector('[data-licensing="map-county"]')
  await buildSelection(ph)
  const phTotal = (await ph.locator('[data-licensing="total"]').innerText()).trim()
  await ph.locator('#choose').screenshot({ path: join(OUT, 'licensing-phone-picker-ct3-firm50.png') })
  ok('390: same total as desktop', phTotal === total, phTotal)
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
