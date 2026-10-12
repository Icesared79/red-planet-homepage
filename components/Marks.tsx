import { useId } from "react";

/**
 * The page marks, inline so they need no network request and inherit the
 * design-system colour tokens. The product marks come from the redesign
 * export (design_handoff_red_planet_homepage); the Red Planet mark below is
 * the 2026-10-12 logo and matches public/brand/mark.svg.
 */

/**
 * The Red Planet Data mark (LOGO-1, 2026-10-12): a disc, red above the
 * horizon and banded below it. Geometry is rpd/packages/tokens/brand/
 * red-planet-mark.svg, the canonical copy, on its 48-unit grid.
 *
 * Two colours, not one, and both come from --rph-mark-disc / --rph-mark-band
 * so the variant follows the SURFACE rather than the theme. The page ground
 * sets them per theme; a dark band that stays dark in both themes (the legal
 * footer) overrides them locally, which is what keeps the bands visible there.
 * A single-fill copy of this mark renders a plain disc with the bands
 * invisible -- and so does the right geometry with the wrong ground.
 *
 * Each id must be unique per instance — the header and the footer both mount
 * one, and a duplicated clipPath id would make the second resolve to the
 * first.
 */
export function RedPlanetMark({ size = 18 }: { size?: number }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <circle cx="24" cy="24" r="22" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="48" height="23" fill="var(--rph-mark-disc)" />
        <rect x="0" y="25" width="48" height="5" fill="var(--rph-mark-band)" />
        <rect x="0" y="32" width="48" height="5" fill="var(--rph-mark-band)" />
        <rect x="0" y="39" width="48" height="5" fill="var(--rph-mark-band)" />
        <rect x="0" y="46" width="48" height="2" fill="var(--rph-mark-band)" />
      </g>
    </svg>
  );
}

export function AtlasMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke="var(--paper-100)"
        strokeWidth="5"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="10"
        ry="22"
        fill="none"
        stroke="var(--paper-100)"
        strokeWidth="5"
      />
      <path d="M10 32H54" stroke="var(--rph-atlas-equator)" strokeWidth="5" />
    </svg>
  );
}

export function TeleAcreMark({ size = 38 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <rect
        x="32"
        y="10"
        width="22"
        height="22"
        fill="var(--rph-teleacre-accent)"
      />
      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        fill="none"
        stroke="var(--rph-teleacre-ink)"
        strokeWidth="4.5"
      />
      <path
        d="M32 10V54M10 32H54"
        stroke="var(--rph-teleacre-ink)"
        strokeWidth="4.5"
      />
    </svg>
  );
}

/**
 * SunScope's "Solar Arc", taken from the product's own icon
 * (rpd/apps/sunscope/public/apple-icon.svg) so the homepage shows the mark
 * the product actually ships rather than a new one. Source viewBox is 24x24.
 */
export function SunScopeMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <g fill="var(--rph-sunscope-mark)">
        <path d="M5 17 A7 7 0 0 1 19 17 Z" />
        <rect x="1.5" y="19" width="21" height="1.8" rx="0.9" />
        <rect x="10.8" y="1" width="2.4" height="4" rx="0.7" />
        <rect
          x="2.6"
          y="6.5"
          width="2.4"
          height="4"
          rx="0.7"
          transform="rotate(-45 3.8 8.5)"
        />
        <rect
          x="19"
          y="6.5"
          width="2.4"
          height="4"
          rx="0.7"
          transform="rotate(45 20.2 8.5)"
        />
      </g>
    </svg>
  );
}

export function SignalMark() {
  return (
    <svg
      viewBox="0 0 22 16"
      width="30"
      height="22"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <rect x="0" y="10" width="3" height="6" fill="var(--rph-signal-mark)" />
      <rect x="5" y="5" width="3" height="11" fill="var(--rph-signal-mark)" />
      <rect x="10" y="0" width="3" height="16" fill="var(--rph-signal-mark)" />
      <rect x="15" y="7" width="3" height="9" fill="var(--rph-signal-mark)" />
    </svg>
  );
}
