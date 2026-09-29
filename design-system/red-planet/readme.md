# Red Planet Design System

One design layer for Red Planet Data. Red Planet is the company and its public site. Atlas is the engine and the internal data application. Products (Signal, SunScope and the data center product) are built on Atlas and share its structure. Use the same tokens and components everywhere: Red Planet pages in **comfortable** density, Atlas and product dashboards in **compact** density.

## Index

- `styles.css`: the entry point. Contains `@import` lines only. Link this one file.
- `tokens/`: `fonts.css`, `colors.css` (palette, semantic aliases, surfaces, dark theme, product scope), `typography.css` (scale + `.rp-*` type helpers), `spacing.css` (scale + **density**), `effects.css` (radius, rules, elevation, motion, layers).
- `components/components.css`: all component styles (`rp-` classes, token-driven).
- `components/<group>/`: React primitives. Each has a `.jsx`, a `.d.ts`, a `.prompt.md`, and one card per directory.
  - core: `Icon`, `Eyebrow` · actions: `Button` · forms: `Input`, `Select` · navigation: `Tabs`, `TopBar` · shell: `SidebarShell`, `Breadcrumbs` · data: `DataTable`, `Metric` · charts: `RunChart`, `TrendChart` · status: `Badge`, `StatusIndicator` · surfaces: `Card`, `Panel`, `Section` · overlays: `Drawer` · feedback: `EmptyState` · geo: `MapFrame`, `MapLegendItem` · diagrams: `FlowDiagram`
- `guidelines/`: foundation specimen cards (colors, type, spacing, density, radius, rules, elevation, iconography, red rules, motion).
- `ui_kits/red-planet/`: homepage recreation. `ui_kits/atlas/`: illustrative app screens.
- `assets/ds-loader.js`: resolves the component namespace in static previews.
- `assets/red-planet-mark.png`, `assets/red-planet-lockup.png`: the Red Planet mark and lockup (raster).
- `SKILL.md`: an Agent Skill wrapper.

**Intentional additions** (not taken from a source): `Icon` renders bundled Lucide outlines inline (no network request). `Eyebrow` formalizes the homepage's "§ 01 —" labels. `Breadcrumbs` and `MapLegendItem` are small helpers used by the shell and the map.

## Structure: shared layout, product themes

- Every surface shares the same structure: layout, the `SidebarShell` frame, components, spacing, type scale, tables, charts and maps.
- A product may carry its own theme on top: its own brand palette, accent and mark. A product theme overrides brand tokens only (`accent`, `accent-hover`, `accent-fg`, `eyebrow-color` and the mark). It never overrides `attention`, `positive`, `caution`, `dormant` or the status shapes, and it never uses a status color as its brand color.
- The base theme below is Red Planet's. It is also the Atlas internal theme.

## Set up a surface

Load the stylesheet and set attributes on a root element. Every token below it adapts.

| | Red Planet pages | Atlas and product dashboards |
|---|---|---|
| Attributes | `data-product="red-planet"` (default) | `data-product="atlas" data-density="compact"` (`SidebarShell` sets both) |
| Control height | 44px, pill | 28px, `radius-xs` |
| Table row | 48px, no side padding | 32px, 10px padding, sticky header |
| UI text | 15px | 13px |
| Panel padding | 32px | 16px |
| Icons | 20px | 16px |
| Eyebrow color | `accent-fg` (red) | `fg-3` (grey) |
| Red means | brand accent, used sparingly | attention, and nothing else |

- Surfaces: `data-surface="forest" | "sage" | "paper"` remaps `bg`, the `fg-*` tokens, the rules and the status colors inside a band or card.
- `data-theme="dark"` is the Atlas dark mode: the same names, one step deeper than forest.

## Rules for red

Red is `red-500`, or `red-400` on dark surfaces.

- **Red Planet pages:** red is allowed on the logo, `Eyebrow` section labels, **one** closing CTA per page (`Button variant="accent"`), and the single flagged datum in a chart or table (the flagged run bar, the "kept" marker). Never for body text, backgrounds, large fills or decoration.
- **Atlas and products:** red means **something needs attention**, and nothing else: failed status, flagged run steps, invalid fields, failed lineage edges, counts of items needing action (`attention` on `Tabs` and nav items), and destructive or corrective actions (`Button variant="danger"`).
- Primary buttons, selected states, links, marks, "new" labels and chart emphasis in Atlas are ink (`fg-1`), never red. If a screen has no problems, it has no red.
- Stale uses `caution` (ochre) and dormant uses `dormant` (grey). Neither needs action now, so neither is red.

## Status vocabulary

The same five states apply to any geography, source, pipeline, layer or job. Each has its own shape as well as its own color, so state survives grayscale and color blindness. Use `StatusIndicator`, never an icon.

- **live** (filled circle, `positive`): active and current.
- **activating** (pulsing ring, `positive`): being brought online from storage, not ready yet. Reads as in progress, not as a problem. The only looping animation in the system.
- **dormant** (hollow ring, `dormant`): intentionally paused. On light surfaces `dormant` is 2.7:1 against `bg`, so always pair the ring with its label.
- **stale** (diamond, `caution`): the last success is older than its expected interval. Watch it.
- **failed** (square, `attention`): the last run errored. Needs attention.

## Content fundamentals

- **Voice:** plain, factual, declarative. State what the system does ("Atlas captures them every night and keeps each version."), with no hype words. The company speaks as "we"; address the reader as "you" only in calls to action ("Tell us what you're looking for and we'll show you what we have.").
- **Casing:** sentence case everywhere, including headlines, buttons, tabs and eyebrows. Names are capitalized: Red Planet, Red Planet Data, Atlas, Signal, SunScope.
- **Headlines** are complete sentences ending in a period: "Deeper Data Intelligence.", "Get in touch."
- **Specifics over adjectives:** real counts ("502,392,645"), real places ("Judgment · Norwalk · 9/25").
- **Speed is a measured figure, never a claim.** Write "a median of 2 to 4 days", never "real time", "instant" or "live as it happens".
- **Separators:** the middle dot `·` joins metadata ("+275.5M archived · 777.9M all-time"). The em dash appears only in eyebrows ("§ 04 — How it works").
- **Numbers:** full figures with thousands separators on public pages; abbreviate (777.9M) only in meta lines. In Atlas, mono tabular figures and ISO or `9/25` dates.
- **Atlas copy:** terse labels. State errors as what happened plus what happens next ("The county server stopped responding. Atlas will retry at 04:00."). No apologies, no exclamation marks.
- **No emoji.** Unicode is limited to `§ · — ↗ ↑ ↓`.

## Visual foundations

- **Color:** the page is `paper-100` with `ink-900` text. `forest-800` and `sage-200` bands pace a Red Planet page; `paper-200` holds cards. `positive` marks positive figures and healthy run bars. Red is rare (above). No gradients anywhere.
- **Type:** Geist Regular with tight negative tracking for display (`rp-display-xl`, `rp-display-l`, `rp-display-m`). Fragment Mono (`rp-label`, `rp-figure-*`) for every label, figure, timestamp, ID and table header. Body is `rp-body` or `rp-body-l` on the website and 13px in Atlas. Headlines never go bold; emphasis comes from size, not weight.
- **Layout:** a Red Planet page is a stack of full-width bands at `radius-lg`, separated by 8px of page. Content sits in a `page-max` column with `page-gutter` sides. Two-column splits are typical: headline and copy on the left, evidence (a table, card or chart) on the right. Atlas is a fixed frame: a 240px sidebar, a 48px header row and scrolling content.
- **Rules instead of boxes:** `rule` hairlines separate rows. A `rule-ink` line sits under table headers and stage labels. Tables have no cell borders and no zebra stripes.
- **Cards:** tonal fill, no shadow and no border on the website, at `radius-md`. Atlas panels use `bg-raised` with a `rule` border at `radius-sm`. Never use colored left-border accents.
- **Elevation:** flat. Shadows only on floating layers: map chips (`elev-1`), popovers (`elev-2`) and the drawer (`elev-3`).
- **Radii:** `radius-xs` (Atlas controls, badges), `radius-sm` (fields, Atlas panels), `radius-md` (cards), `radius-lg` (bands), `radius-pill` (website buttons and tabs).
- **Data graphics:** `RunChart` draws one thin bar per step, with the flagged step in `accent` and slightly taller. `TrendChart` draws a thin `chart-line` over `chart-fill`, with a baseline and mono end labels only. No gridlines, legends or axes beyond start and end labels. One series per chart.
- **Imagery:** none. The data is the imagery. If photography is added later, keep it desaturated and warm to match paper.
- **Motion:** 120ms for hover and color, 200ms fades, 320ms drawer slide, all on `cubic-bezier(.2,.7,.2,1)`. No bounces. The activating pulse is the only loop. Honor `prefers-reduced-motion`.
- **Hover, press, focus:** links go from a faint to a solid underline; ink buttons lighten one step; secondary buttons darken their border; rows and nav items get the `bg-hover` wash. No shrink on press. Focus is a 2px `focus` outline with a 2px offset. Focus is never red.
- **Transparency:** only the drawer `scrim`. No glassmorphism.
- **Contrast notes:** `fg-3` reads at 4.9:1 on `bg` but 4.45:1 on `paper-200`; on paper bands use it for mono labels at 13px and above only.

## Iconography

- Public pages stay close to icon-free: type, the `↗` external-link arrow and the red mark.
- Atlas uses Lucide outlines through `Icon` at 1.5 stroke, `currentColor`, 20px comfortable and 16px compact. The icons are bundled inline, so `Icon` makes no network request; the list of available names is in `components/core/Icon.jsx`. Lucide is a substitution chosen for its thin outline style; no house icon set exists.
- Outline icons only. No filled, duotone or colored icons, and no emoji. Status is shown by `StatusIndicator` shapes, not icons.

## Logo

- `assets/red-planet-mark.png` is the Red Planet mark (the red notched disc in `red-500`) and `assets/red-planet-lockup.png` the lockup. Both are raster files; use them at the sizes shown and replace them with vector files when available.
- `TopBar` renders "Red Planet" in type and takes the mark through its `mark` prop.

## Fonts

Geist (sans) and Fragment Mono (mono) load from Google Fonts through the stylesheet. Geist stands in for the unconfirmed display and text sans; Fragment Mono is used as named.
