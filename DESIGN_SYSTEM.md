# RED PLANET DATA — MASTER DESIGN SYSTEM
## Version 1.0 — Apply to all products, pages, and UI

Reference this before any design, UI, or front-end work on Red Planet Data, Atlas dashboard, or any Red Planet product. This is the single source of truth for all visual decisions.

---

## DESIGN PHILOSOPHY

Red Planet sits between Bloomberg Terminal and a modern institutional SaaS product — data-dense and serious, but warmer and more approachable than pure Palantir-style austerity. The aesthetic should feel like a tool built by people who deeply understand data AND design. Not a startup. Not a legacy enterprise tool. Something newer and more considered than both.

**The three words that govern every decision:**
- **Authoritative** — this is serious intelligence infrastructure
- **Warm** — approachable, not cold or clinical
- **Alive** — data is moving, growing, expanding — the UI should feel like it

**What this is NOT:**
- Not a PropTech startup (no gradients, no playful icons, no rounded everything)
- Not a legacy Bloomberg clone (not ugly on purpose)
- Not a generic SaaS dashboard (no purple gradients, no cookie-cutter layouts)
- Not literal Mars/space imagery (no rockets, no astronauts, no planet illustrations)

---

## COLOR SYSTEM

### Primary Palette — Dark Mode (DEFAULT)

Dark mode is the primary experience. Every product defaults to dark.

```css
/* Core backgrounds — layered depth */
--rp-bg:           #0C0A09;   /* True base — very dark warm black */
--rp-surface-1:    #121009;   /* Slightly lifted — section backgrounds */
--rp-surface-2:    #1A1714;   /* Cards, panels */
--rp-surface-3:    #221F1B;   /* Elevated cards, hover states */
--rp-surface-4:    #2A2622;   /* Inputs, chips, active states */

/* Text hierarchy */
--rp-text-primary:   #F0EBE3;  /* Near-white with warmth — main content */
--rp-text-secondary: #9E9082;  /* Mid — labels, sublabels */
--rp-text-muted:     #625850;  /* Quiet — timestamps, metadata */
--rp-text-disabled:  #3D3530;  /* Disabled states */

/* RED — the brand anchor */
--rp-red:          #C0392B;   /* Primary brand red */
--rp-red-bright:   #E8540A;   /* Hover, active, emphasis */
--rp-red-dim:      #8B2A1E;   /* Pressed, deep states */
--rp-red-subtle:   rgba(192, 57, 43, 0.10);  /* Backgrounds */
--rp-red-border:   rgba(192, 57, 43, 0.22);  /* Borders, dividers */
--rp-red-glow:     rgba(192, 57, 43, 0.06);  /* Atmospheric glow */

/* TEAL — the contrast accent */
--rp-teal:         #2A9D8F;   /* Primary teal — data positive, active */
--rp-teal-bright:  #3DBFB0;   /* Hover, emphasis */
--rp-teal-dim:     #1E7268;   /* Deep states */
--rp-teal-subtle:  rgba(42, 157, 143, 0.10);  /* Backgrounds */
--rp-teal-border:  rgba(42, 157, 143, 0.22);  /* Borders */

/* OFF-WHITE — the breathing space */
--rp-white:        #F0EBE3;   /* Same as text-primary — intentional */
--rp-white-subtle: rgba(240, 235, 227, 0.06);  /* Subtle light surface */
--rp-white-border: rgba(240, 235, 227, 0.08);  /* Subtle borders */

/* FUNCTIONAL STATUS COLORS */
--rp-success:       #2D6A4F;
--rp-success-text:  #6DB88A;
--rp-success-bg:    rgba(45, 106, 79, 0.12);

--rp-warning:       #8B6914;
--rp-warning-text:  #D4A843;
--rp-warning-bg:    rgba(139, 105, 20, 0.12);

--rp-error:         #8B2A2A;
--rp-error-text:    #E07070;
--rp-error-bg:      rgba(139, 42, 42, 0.12);

--rp-neutral:       #4A4540;
--rp-neutral-text:  #9E9082;
--rp-neutral-bg:    rgba(74, 69, 64, 0.20);

/* BORDERS */
--rp-border:         rgba(192, 57, 43, 0.12);  /* Default — warm red tint */
--rp-border-subtle:  rgba(240, 235, 227, 0.06); /* Subtle — structure only */
--rp-border-strong:  rgba(192, 57, 43, 0.28);   /* Emphasis borders */
```

### Secondary Palette — Light Mode (PRESENTATION)

Light mode is the clean presentation experience — used for client demos, pitches, daytime use.

```css
[data-theme="light"] {
  /* Core backgrounds */
  --rp-bg:           #F5F1EB;  /* Warm paper — not pure white */
  --rp-surface-1:    #EDE8E0;  /* Section backgrounds */
  --rp-surface-2:    #FFFFFF;  /* Cards — pure white for contrast */
  --rp-surface-3:    #FAF8F5;  /* Elevated cards */
  --rp-surface-4:    #F0EBE3;  /* Inputs, chips */

  /* Text hierarchy */
  --rp-text-primary:   #1A1410;  /* Near-black with warmth */
  --rp-text-secondary: #6B5E52;  /* Mid grey-brown */
  --rp-text-muted:     #9B8E82;  /* Quiet metadata */
  --rp-text-disabled:  #C4B8AE;

  /* RED stays the same */
  --rp-red:          #C0392B;
  --rp-red-bright:   #A0291B;  /* Darker on light — stays readable */
  --rp-red-dim:      #7A1F15;
  --rp-red-subtle:   rgba(192, 57, 43, 0.07);
  --rp-red-border:   rgba(192, 57, 43, 0.18);
  --rp-red-glow:     rgba(192, 57, 43, 0.04);

  /* TEAL slightly deeper on light for readability */
  --rp-teal:         #1E8A7D;
  --rp-teal-bright:  #2A9D8F;
  --rp-teal-dim:     #156058;
  --rp-teal-subtle:  rgba(30, 138, 125, 0.08);
  --rp-teal-border:  rgba(30, 138, 125, 0.20);

  /* FUNCTIONAL STATUS — more saturated on light */
  --rp-success:       #D4EDDE;
  --rp-success-text:  #2D6A4F;
  --rp-success-bg:    rgba(45, 106, 79, 0.08);

  --rp-warning:       #FDF3D8;
  --rp-warning-text:  #8B6914;
  --rp-warning-bg:    rgba(139, 105, 20, 0.08);

  --rp-error:         #FDECEA;
  --rp-error-text:    #A0291B;
  --rp-error-bg:      rgba(160, 41, 27, 0.08);

  --rp-neutral-text:  #6B5E52;
  --rp-neutral-bg:    rgba(107, 94, 82, 0.10);

  /* BORDERS */
  --rp-border:         rgba(192, 57, 43, 0.12);
  --rp-border-subtle:  rgba(0, 0, 0, 0.06);
  --rp-border-strong:  rgba(192, 57, 43, 0.25);
}
```

---

## COLOR USAGE RULES

**RED is the brand anchor.**
Use red for: primary CTAs, active navigation state, key data emphasis, brand moments, section accents, progress fills, the logo.
Do NOT use red for: body text, table rows, backgrounds larger than a card accent, status badges.

**TEAL is the data signal.**
Use teal for: positive data indicators, "active/live" status, signal counts, growing metrics, record counts that are high/complete, coverage completion.
Do NOT use teal for: navigation, CTAs, branding moments — that's red's job.

**The RED + TEAL relationship:**
Red and teal never compete for the same element. Different semantic roles:
- Red = brand, action, alert, emphasis
- Teal = data health, positive signal, active state, completeness

**OFF-WHITE is for breathing room.**
On dark backgrounds, use `--rp-white-subtle` for surface separation.

**The sidebar is ALWAYS dark.**
Even in light mode. The sidebar stays `#0C0A09` in both modes.

---

## TYPOGRAPHY

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

--font-display: 'Space Grotesk', sans-serif;  /* Headlines, product names, nav */
--font-body:    'Inter', sans-serif;           /* Body, labels, descriptions */
--font-mono:    'JetBrains Mono', monospace;   /* ALL numbers, data values, counts, timestamps */
```

### Type Scale

```css
/* Display */
--text-display-xl: 700 72px/1.05 var(--font-display);
--text-display-lg: 700 48px/1.1  var(--font-display);
--text-display-md: 600 32px/1.2  var(--font-display);
--text-display-sm: 600 24px/1.3  var(--font-display);

/* Body */
--text-body-lg: 400 18px/1.7 var(--font-body);
--text-body-md: 400 15px/1.6 var(--font-body);
--text-body-sm: 400 13px/1.5 var(--font-body);

/* Labels */
--text-label-lg: 500 13px/1 var(--font-body);
--text-label-md: 500 11px/1 var(--font-body);
--text-label-sm: 400 10px/1 var(--font-body);

/* Mono — DATA ONLY */
--text-data-xl: 500 48px/1 var(--font-mono);
--text-data-lg: 500 32px/1 var(--font-mono);
--text-data-md: 400 18px/1 var(--font-mono);
--text-data-sm: 400 13px/1 var(--font-mono);
```

### Typography Rules

**Section labels** (e.g. "RED PLANET DATA", "THE SIGNAL", "USE CASES"):
```css
font: var(--text-label-md);
text-transform: uppercase;
letter-spacing: 0.18em;
color: var(--rp-red);
```

**All numeric data values** — always JetBrains Mono. No exceptions.

**Headlines** — Space Grotesk. Letter-spacing: -0.02em on large sizes.

---

## COMPONENT SPECIFICATIONS

### Cards

**Dark mode:**
```css
background: var(--rp-surface-2);
border: 1px solid var(--rp-border-subtle);
border-radius: 6px;
padding: 24px;

/* Hover */
background: var(--rp-surface-3);
border-color: var(--rp-red-border);
```

**Light mode:**
```css
background: #FFFFFF;
border: 1px solid rgba(0,0,0,0.06);
border-radius: 6px;
box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
padding: 24px;

/* Hover */
box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.07);
border-color: var(--rp-red-border);
```

**Metric cards:**
- Red top accent (3px): record counts, source counts
- Teal top accent (3px): quality scores, signal-ready counts

### Buttons

**Primary CTA:**
```css
background: var(--rp-red);
color: #FFFFFF;
font: 500 14px/1 var(--font-body);
letter-spacing: 0.02em;
padding: 12px 24px;
border-radius: 4px;

/* Hover */
background: var(--rp-red-bright);
```

**Secondary / Ghost:**
```css
background: transparent;
color: var(--rp-red);
border: 1px solid var(--rp-red-border);
padding: 11px 23px;

/* Hover */
background: var(--rp-red-subtle);
border-color: var(--rp-red);
```

**Teal action button** (export, refresh, view signal):
```css
background: var(--rp-teal-subtle);
color: var(--rp-teal);
border: 1px solid var(--rp-teal-border);
padding: 8px 16px;
border-radius: 4px;

/* Hover */
background: var(--rp-teal);
color: #FFFFFF;
```

### Status Badges

```css
border-radius: 3px;
padding: 3px 8px;
font: var(--text-label-sm);
letter-spacing: 0.06em;
text-transform: uppercase;

/* Completed/Active: success colors */
/* Running/In Progress: warning colors */
/* Failed/Error: error colors */
/* No Data/Neutral: neutral colors */
/* Critical: red-subtle bg, red-bright text */
```

### Navigation / Sidebar

Always dark in both modes:
```css
background: #0C0A09;
width: 56px;  /* Icon only */
border-right: 1px solid var(--rp-border-subtle);

/* Inactive: --rp-text-muted */
/* Hover: --rp-text-secondary + --rp-white-subtle bg */
/* Active: --rp-red + --rp-red-subtle bg */
```

### Tables

```css
/* Container: --rp-surface-2, border-radius 6px */
/* Header: --rp-surface-1, uppercase, letter-spacing 0.12em, --rp-text-muted */
/* Rows: 12px 16px padding, --rp-border-subtle bottom border */
/* Row hover: --rp-red-glow bg */
```

### Form Inputs

```css
/* Dark: --rp-surface-4 bg, --rp-border border */
/* Focus: --rp-red-border, --rp-surface-3 bg */
/* Light: --rp-surface-4 bg, rgba(0,0,0,0.10) border */
/* Focus light: --rp-red border, #FFFFFF bg */
```

### Progress / Coverage Bars

```css
/* Track: --rp-border-subtle, 4px height, 2px radius */
/* Teal fill: data coverage, completeness, quality */
/* Red fill: brand metrics, priority level */
```

### Coverage Map — State Tiles

```css
/* No data: --rp-surface-3 bg */
/* Layer 1: rgba(192, 57, 43, 0.15) */
/* Layer 1+2: rgba(192, 57, 43, 0.35) */
/* Full signal: rgba(192, 57, 43, 0.65) */
/* Full depth (CT): --rp-red solid */
/* Selected: 2px solid --rp-teal border */
```

---

## SPACING SYSTEM

```css
--space-1:  4px;    --space-6:  32px;
--space-2:  8px;    --space-7:  48px;
--space-3:  12px;   --space-8:  64px;
--space-4:  16px;   --space-9:  96px;
--space-5:  24px;   --space-10: 128px;
```

Section padding: 96px desktop, 48px mobile.
Card padding: 24px standard, 32px featured.
Card grid gap: 16px tight, 24px standard.

---

## VISUAL TEXTURE

**Dark mode:** Topographic contour line SVG — stroke #C0392B, opacity 0.04–0.06. Hero sections only. Never tile.

**Light mode:** No topo lines. Depth via multi-layer box-shadows.

---

## LIGHT/DARK TOGGLE

- `data-theme` attribute on `<html>`
- Persist via `localStorage.setItem('rp-theme', theme)`
- Default: dark
- Moon/Sun icon toggle, top-right header
- 200ms transition on switch

---

## WHAT NEVER CHANGES BETWEEN MODES

1. Sidebar — always #0C0A09 dark
2. Red accent — #C0392B identical
3. Teal accent — nearly identical
4. Font families
5. Border radius values
6. Spacing system
7. Logo treatment

---

## QUICK REFERENCE — THE RULE OF THREE

- **Red** → brand, action, priority, emphasis, the company
- **Teal** → data health, coverage, signal quality, completeness
- **Neutral** → everything else
