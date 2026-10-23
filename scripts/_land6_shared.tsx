// LAND-6 (2026-10-23): what the five explanation pages share, so they read as one site. The head (self-hosted fonts
// embedded, the Red Planet design package in Git, the county-report sheet), the page header, the tab strip under it
// (How Red Planet Works, AtlasLand, AtlasCRE, AtlasProp, AtlasTrade, the current page marked), the section frame, the
// closing row, and the word check. scripts/_land53_how_atlasland_works.tsx (the AtlasLand page) and
// scripts/_land6_site_pages.tsx (the company page and the three view pages) import from here.
//
// The strip is the design system's underline Tabs (rp-tabs--underline, rp-tab) with links for tabs; a link marks the
// current page with aria-current="page", so the selected style is repeated for that attribute (the component keys it on
// aria-selected, which belongs to a tab role, not a link).

import { readFileSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import type { ReactNode } from 'react'

export const REPO = process.cwd()
export const DESIGN = 'C:/rpd/packages/red-planet-design'

export const TABS: { href: string; label: string }[] = [
  { href: '/how-red-planet-works', label: 'How Red Planet Works' },
  { href: '/how-atlasland-works', label: 'AtlasLand' },
  { href: '/how-atlascre-works', label: 'AtlasCRE' },
  { href: '/how-atlasprop-works', label: 'AtlasProp' },
  { href: '/how-atlastrade-works', label: 'AtlasTrade' },
]

// ── words and numbers ─────────────────────────────────────────────────────────────────────

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const dLong = (iso: string) => `${MON[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`
export const dShort = (iso: string) => `${MON[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`
export const monthYear = (iso: string) => `${MONTH[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`
export const n = (v: number) => v.toLocaleString('en-US')
export const g = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100))

// Proper names that happen to contain the word; the check never counts them (LAND-5.2.1 ruling).
export const PROPER_NAMES = /\bPublic Infrastructure Committee\b|\bTennessee Public Chapter \d+\b/g
export const hasWord = (text: string) => /public/i.test(text.replace(PROPER_NAMES, ''))

export function assertNoWord(html: string, what: string) {
  const text = html.replace(/url\("data:[^"]+"\)/g, '').replace(/href="data:[^"]+"|src="data:[^"]+"/g, '')
  if (hasWord(text)) {
    const i = text.replace(PROPER_NAMES, '').search(/public/i)
    throw new Error(`${what} carries the word near: ${text.replace(PROPER_NAMES, '').slice(Math.max(0, i - 80), i + 40)}`)
  }
}

/** The first `count` sentences of a paragraph (a sentence ends at . ! or ? followed by a space and a capital, digit or $). */
export function sentences(text: string, count: number): string {
  const parts = text.trim().split(/(?<=[.!?])\s+(?=[A-Z$0-9])/)
  return parts.slice(0, count).join(' ')
}

// ── head: fonts and the design package ────────────────────────────────────────────────────

export function fontFace(family: string, weight: number, file: string): string {
  const data = readFileSync(path.join(DESIGN, 'fonts', file)).toString('base64')
  return `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url("data:font/woff2;base64,${data}") format("woff2"); }`
}

export const FONTS_CSS = () => [fontFace('Geist', 400, 'geist-latin-400-normal.woff2'), fontFace('Geist', 500, 'geist-latin-500-normal.woff2'), fontFace('Fragment Mono', 400, 'fragment-mono-latin-400-normal.woff2')].join('\n')

export function designCss(): string {
  const sha = execSync(`git -C "${DESIGN}" rev-parse --short HEAD`, { encoding: 'utf8' }).trim()
  const parts = [`/* Red Planet Data design system, Plat palette, from Icesared79/rpd@${sha} packages/red-planet-design: tokens/colors.css, typography.css, spacing.css, effects.css, components/components.css. Fonts are self-hosted and embedded; nothing loads from the network. */`]
  for (const rel of ['tokens/colors.css', 'tokens/typography.css', 'tokens/spacing.css', 'tokens/effects.css', 'components/components.css']) {
    parts.push(readFileSync(path.join(DESIGN, rel), 'utf8').replace(/\r\n/g, '\n'))
  }
  parts.push('/* County report components, ported from atlas-dash (components/county-report/report.css) */')
  parts.push(readFileSync(path.join(REPO, 'components', 'county-report', 'report.css'), 'utf8').replace(/\r\n/g, '\n'))
  return parts.join('\n')
}

export const markDataUri = () => 'data:image/svg+xml;base64,' + readFileSync(path.join(DESIGN, 'assets', 'red-planet-mark.svg')).toString('base64')

// ── the strip, the frame, the base styles ─────────────────────────────────────────────────

/* the strip: the system's underline tabs, as links, under the header on every page */
export const TABS_CSS = `
.om-tabs { padding: 0 var(--page-gutter); }
.om-tabs__inner { max-width: var(--page-max); margin: 0 auto; }
.om-tabs .rp-tabs { gap: clamp(18px, 2.6vw, 34px); }
.om-tabs .rp-tab { text-decoration: none; height: 44px; font-size: 15px; }
.om-tabs .rp-tab[aria-current="page"] { color: var(--fg-1); border-bottom-color: var(--fg-1); }
.om-tabs .rp-tab .om-tabs__co { display: none; }
@media (max-width: 560px) {
  .om-tabs .rp-tab { font-size: 14px; height: 40px; }
  .om-tabs .rp-tab .om-tabs__long { display: none; }
  .om-tabs .rp-tab .om-tabs__co { display: inline; }
}
`

export const SHARED_CSS = TABS_CSS + `
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
.om-close { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--rule-ink); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; }
.om-row { display: flex; align-items: center; gap: 14px; min-width: 0; }
@media (max-width: 900px) {
  .om-head { grid-template-columns: minmax(0, 1fr); margin-bottom: 24px; }
}
`

export const ROOT_STYLE = { minHeight: '100%', padding: 8, display: 'flex', flexDirection: 'column' as const, gap: 8, background: 'var(--bg)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)' }

export function Head({ title, description, mark, css, pageCss }: { title: string; description: string; mark: string; css: string; pageCss: string }) {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="noindex, nofollow" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href={mark} />
      <style dangerouslySetInnerHTML={{ __html: FONTS_CSS() }} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + pageCss }} />
    </head>
  )
}

export function Header({ mark, title, right }: { mark: string; title: string; right: ReactNode }) {
  return (
    <header style={{ padding: 'clamp(28px, 3.5vw, 48px) var(--page-gutter) clamp(16px, 2vw, 24px)' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px' }}>
        <img src={mark} alt="Red Planet Data" style={{ width: 48, height: 48, display: 'block', flex: 'none' }} />
        <h1 className="rp-display-l" style={{ margin: 0, flex: '1 1 420px', fontSize: 'clamp(34px, 4.4vw, 56px)', color: 'var(--fg-1)' }}>{title}</h1>
        {right}
      </div>
    </header>
  )
}

/** The strip under the header. `current` is the page's own address; the company tab shortens to "Red Planet" on a phone. */
export function TabStrip({ current }: { current: string }) {
  return (
    <nav className="om-tabs" aria-label="How Red Planet works" data-om="tabs">
      <div className="om-tabs__inner">
        <div className="rp-tabs rp-tabs--underline" role="list">
          {TABS.map((t) => (
            <a key={t.href} role="listitem" className="rp-tab" href={t.href} aria-current={t.href === current ? 'page' : undefined} data-tab={t.href}>
              {t.href === '/how-red-planet-works' ? <><span className="om-tabs__long">{t.label}</span><span className="om-tabs__co">Red Planet</span></> : t.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

export function Section({ num, surface, id, title, lead, children }: { num: number; surface: 'paper' | 'carbon' | 'blueline'; id: string; title: string; lead?: ReactNode; children: ReactNode }) {
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

export function Close({ mark }: { mark: string }) {
  return (
    <div className="om-close">
      <div className="om-row"><img src={mark} alt="" style={{ width: 32, height: 32, display: 'block', flex: 'none' }} /><span className="rp-title-s">Red Planet Data, Inc.</span></div>
      <a href="mailto:hello@redplanetdata.com" className="rp-label" style={{ color: 'var(--fg-1)', textDecoration: 'underline', textUnderlineOffset: 3 }}>hello@redplanetdata.com</a>
    </div>
  )
}

/** The newest dated file of a kind under public/data, or null. */
export function newest(dir: string, prefix: string): string | null {
  const re = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d{4}-\\d{2}-\\d{2})\\.json$`)
  const files = readdirSync(dir).filter((f) => re.test(f)).sort()
  return files.length ? path.join(dir, files[files.length - 1]) : null
}
