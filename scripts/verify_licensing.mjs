// Verify /licensing (COUNTY-8, 2026-10-19): the page in the shared license page's design, read live.
//
//   node scripts/verify_licensing.mjs [--base https://redplanetdata.com] [--out <dir>]
//
// What it proves, signed out, at 1440 and at 390:
//   - the page answers 200, carries noindex, and the homepage does not link to it;
//   - the order: the summary card, 01 What Signal is (the license page's screenshot, three captions), 02 The license
//     (counties loaded into Signal, seats, individual licenses, white label for larger brokerages, standing terms),
//     then one compact table per state, Connecticut then Florida (county, residential parcels, 90-day foreclosure and
//     probate filings, firm and individual price), then Get a quote and Request an individual license;
//   - nine Connecticut and 67 Florida rows, every price a dollar figure, every count a figure or a dash; the
//     catalog's operator-facing calculation text (levels, bands) is not on the page;
//   - the two forms are present (nothing is submitted: this run sends no email);
//   - fonts per role (Geist headline, Fragment Mono figures), the paper ground in the dark theme too, no barred word,
//     no horizontal page scroll at 390. Full-page screenshots go to --out.
//
// playwright-core is not a dependency of this repo; it is loaded from the atlas-dashboard checkout on atlas-mini
// (--playwright to point elsewhere).

import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d }
const BASE = arg('--base', 'https://redplanetdata.com').replace(/\/$/, '')
const OUT = arg('--out', join(process.cwd(), '_licensing_screens'))
const PW = arg('--playwright', 'C:/Users/Atlas/atlas-dashboard/node_modules/playwright-core/index.mjs')
const CHROME = process.env.CHROME_PATH || 'C:/Users/Atlas/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'
mkdirSync(OUT, { recursive: true })
const { chromium } = await import(pathToFileURL(PW).href)

const HEADS = ['county', 'residential parcels', 'foreclosure, 90 days', 'probate, 90 days', 'firm, a year', 'individual, a year']
const SECTIONS = ['01 · What Signal is', '02 · The license', '03 · Connecticut 9 counties', '04 · Florida 67 counties', '05 · Get a quote', '06 · Request an individual license']
const BARRED = [
  ['level', /\blevels?\b/i], ['public', /\bpublic/i], ['Atlas', /\bAtlas\b/], ['score', /\bscor(e|es|ed|ing)\b/i],
  ['licensee', /licensee/i], ['exclamation', /!/],
]
const results = []
const ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`) }

const browser = await chromium.launch({ executablePath: existsSync(CHROME) ? CHROME : undefined })
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' })
  const page = await ctx.newPage()
  const res = await page.goto(`${BASE}/licensing`, { waitUntil: 'networkidle' })
  ok('the page answers 200', res.status() === 200, `${res.status()}`)
  const robots = await page.getAttribute('meta[name="robots"]', 'content').catch(() => null)
  ok('noindex', /noindex/.test(robots ?? ''), robots ?? 'no robots meta')
  const sections = (await page.locator('.lp-doc h2.lp-eyebrow').allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim())
  ok('sections in order', JSON.stringify(sections) === JSON.stringify(SECTIONS), sections.join(' / '))
  ok('summary card first', (await page.locator('.lp-doc > section').first().getAttribute('data-licensing')) === 'summary')
  ok('Signal: the license page screenshot and three captions', (await page.locator('[data-licensing="signal-shot"]').evaluate((i) => i.naturalWidth)) > 0
    && (await page.locator('.lp-pane').count()) === 3)
  const license = (await page.locator('[data-licensing="license"]').innerText()).replace(/\s+/g, ' ')
  ok('the license: counties loaded into Signal, seats, individual, white label for larger brokerages, standing terms',
    /counties loaded into Signal/i.test(license) && /\d+ seats/.test(license) && /individual licenses/i.test(license) && /white label, for larger brokerages/i.test(license) && /standing terms/i.test(license))
  const tables = page.locator('[data-licensing="price-list"]')
  ok('two state tables, Connecticut then Florida', (await tables.count()) === 2
    && (await tables.nth(0).getAttribute('data-state')) === 'CT' && (await tables.nth(1).getAttribute('data-state')) === 'FL')
  const rowsOf = async (i) => tables.nth(i).locator('tbody tr').evaluateAll((rs) => rs.map((r) => [...r.children].map((c) => c.innerText.trim())))
  const ct = await rowsOf(0)
  const fl = await rowsOf(1)
  const heads = (await tables.nth(0).locator('thead th').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim().toLowerCase())
  ok('compact columns: county, parcels, 90-day foreclosure and probate, firm, individual', JSON.stringify(heads) === JSON.stringify(HEADS), heads.join(' | '))
  ok('9 Connecticut and 67 Florida rows', ct.length === 9 && fl.length === 67, `${ct.length} / ${fl.length}`)
  const all = [...ct, ...fl]
  ok('every price a dollar figure', all.every((r) => /^\$[\d,]+/.test(r[4]) && /^\$[\d,]+/.test(r[5])))
  ok('every count a figure or a dash', all.every((r) => [1, 2, 3].every((i) => /^([\d,]+|—)$/.test(r[i]))))
  console.log(`  CT: ${ct.map((r) => r.join(' | ')).join('\n      ')}`)
  ok('no level or band text from the catalog on the page', (await page.locator('[data-licensing="explanation"]').count()) === 0)
  ok('both forms present', (await page.locator('[data-licensing="quote-form"]').count()) === 1 && (await page.locator('[data-licensing="individual-form"]').count()) === 1)
  const fonts = await page.evaluate(() => ({
    h1: getComputedStyle(document.querySelector('.lp-h1')).fontFamily,
    figure: getComputedStyle(document.querySelector('[data-licensing="firm-price"]')).fontFamily,
    ground: getComputedStyle(document.querySelector('.lp')).backgroundColor,
  }))
  ok('headline Geist, figures Fragment Mono', /^Geist/.test(fonts.h1) && /Fragment Mono/.test(fonts.figure), `${fonts.h1} / ${fonts.figure}`)
  const text = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ')
  const barred = BARRED.filter(([, re]) => re.test(text)).map(([k, re]) => `${k}: "${text.slice(Math.max(0, text.search(re) - 40), text.search(re) + 30)}"`)
  ok('no barred word', barred.length === 0, barred.join('; '))
  await page.screenshot({ path: join(OUT, 'licensing-desktop-first-screen.png') })
  await page.screenshot({ path: join(OUT, 'licensing-desktop-full.png'), fullPage: true })
  ok('desktop: no horizontal scroll', (await page.evaluate(() => document.documentElement.scrollWidth)) <= 1440)
  const fit = await page.evaluate(() => [...document.querySelectorAll('[data-licensing="county-table"]')].map((t) => ({
    table: Math.round(t.getBoundingClientRect().right), card: Math.round(t.closest('.lp-tablecard').getBoundingClientRect().right),
  })))
  ok('desktop: each county table fits inside its card', fit.every((f) => f.table <= f.card), JSON.stringify(fit))
  await tables.nth(1).screenshot({ path: join(OUT, 'licensing-desktop-florida-table.png') })

  // the dark theme: the document stays on paper
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  const darkGround = await page.evaluate(() => getComputedStyle(document.querySelector('.lp')).backgroundColor)
  ok('paper ground in the dark theme too', darkGround === fonts.ground, `${fonts.ground} / ${darkGround}`)

  const home = await ctx.newPage()
  await home.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  ok('the homepage does not link to /licensing', (await home.locator('a[href*="/licensing"]').count()) === 0)
  await ctx.close()

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light' })
  const ph = await phone.newPage()
  await ph.goto(`${BASE}/licensing`, { waitUntil: 'networkidle' })
  await ph.screenshot({ path: join(OUT, 'licensing-phone-first-screen.png') })
  await ph.screenshot({ path: join(OUT, 'licensing-phone-full.png'), fullPage: true })
  const w = await ph.evaluate(() => document.documentElement.scrollWidth)
  ok('390: no horizontal page scroll (tables scroll inside their cards)', w <= 390, `${w}`)
  await phone.close()
} catch (e) {
  ok('run completed', false, e instanceof Error ? e.message : String(e))
} finally {
  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length} PASS, ${failed.length} FAIL  screenshots: ${OUT}`)
  process.exit(failed.length ? 1 : 0)
}
