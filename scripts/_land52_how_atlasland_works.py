"""LAND-5.2 (2026-10-22): rebuild public/how-atlasland-works.html from the Wilson County snapshot.

    python scripts/_land52_how_atlasland_works.py [--snapshot public/data/wilson-county-tn-YYYY-MM-DD.json]

Every number, date, body and item on the page is read from the newest public/data/wilson-county-tn-*.json (written by
atlas/ops/_land52_wilson_snapshot.py); nothing is typed in here except the section headings, the one or two sentences
under each, the Intake steps and the Terms. The head is built from the Red Planet design package in Git
(C:/rpd/packages/red-planet-design: Plat tokens, self-hosted fonts embedded, components), so the page is one self-contained
file served raw from public/ like its sibling. The header, the closing row and the noindex meta are kept.

Word rules applied here: the developer behind the project is never named (the snapshot carries no applicant); the
word "public" never appears on the page: an item whose description carries it is left out of the twelve shown (the
total still counts it) and the coverage statement's one use of it is rendered as "the meeting record".
"""
from __future__ import annotations

import argparse
import base64
import html
import json
import re
import subprocess
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TARGET = REPO / "public" / "how-atlasland-works.html"
DESIGN = Path("C:/rpd/packages/red-planet-design")
MAX_ROWS = 12
PER_BODY = 3


def esc(s) -> str:
    return html.escape(str(s if s is not None else ""), quote=True)


def n(v) -> str:
    return f"{int(v):,}"


def d_long(iso: str) -> str:
    dt = date.fromisoformat(iso)
    return f"{dt.strftime('%b')} {dt.day}, {dt.year}"


def d_short(iso: str) -> str:
    dt = date.fromisoformat(iso)
    return f"{dt.strftime('%b')} {dt.day}"


def no_public(text: str) -> bool:
    return "public" not in text.lower()


def short_body(name: str, jurisdiction: str) -> str:
    s = name
    for prefix in (jurisdiction + " ", "City of " + jurisdiction + " "):
        if s.startswith(prefix):
            s = s[len(prefix):]
    return s


# ---- head: fonts and the design package --------------------------------------------------------------------------------

def font_face(family: str, weight: int, file: str) -> str:
    data = base64.b64encode((DESIGN / "fonts" / file).read_bytes()).decode("ascii")
    return (f"@font-face {{ font-family: '{family}'; font-style: normal; font-weight: {weight}; font-display: swap; "
            f'src: url("data:font/woff2;base64,{data}") format("woff2"); }}')


def design_css() -> str:
    sha = subprocess.run(["git", "-C", str(DESIGN), "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
    parts = [f"/* Red Planet Data design system, Plat palette, from Icesared79/rpd@{sha} packages/red-planet-design: tokens/colors.css, "
             "typography.css, spacing.css, effects.css, components/components.css. Fonts are self-hosted and embedded below; nothing loads from the network. */"]
    for rel in ("tokens/colors.css", "tokens/typography.css", "tokens/spacing.css", "tokens/effects.css", "components/components.css"):
        parts.append((DESIGN / rel).read_text(encoding="utf-8").replace("\r\n", "\n"))
    return "\n".join(parts)


def mark_data_uri() -> str:
    svg = (DESIGN / "assets" / "red-planet-mark.svg").read_bytes()
    return "data:image/svg+xml;base64," + base64.b64encode(svg).decode("ascii")


PAGE_CSS = """
body { margin: 0; background: var(--paper-100); }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
.om { --section-pad-y: clamp(36px, 4.5vw, 64px); }
.om-head { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 16px 64px; align-items: end; margin-bottom: 32px; }
.om-head > div { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.om-head .rp-display-m { font-size: clamp(26px, 2.8vw, 38px); }
.om-head .rp-body-l { font-size: 17px; color: var(--fg-2); }
.om-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 48px; }
.om-col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.om-col .rp-title { font-size: 19px; }
.om-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.om-list li { padding: 11px 0; border-top: 1px solid var(--rule); font: 400 16px/1.45 var(--font-sans); color: var(--fg-1); }
.om-list li:last-child { border-bottom: 1px solid var(--rule); }
.om-list li .rp-label { display: block; margin-top: 2px; }
.om-figs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px 24px; margin-top: 8px; }
.om-figs .rp-metric__value { font-size: 26px; }
.om-figs .rp-metric__label { font-size: 13px; color: var(--fg-3); }
.om-cap { font: 400 13px/1.5 var(--font-sans); color: var(--fg-3); margin: 18px 0 0; }
.om-cap .rp-mono { font-size: 12px; }

/* § 02 diagram */
.om-diagram-wide, .om-diagram-tall { display: block; width: 100%; height: auto; }
.om-diagram-tall { display: none; }
.om-diagram text { font-family: var(--font-sans); fill: var(--fg-1); }
.om-diagram .dg-head { font-size: 13px; font-weight: 500; }
.om-diagram .dg-count { font-family: var(--font-mono); font-size: 11px; fill: var(--fg-3); }
.om-diagram .dg-name { font-size: 11.5px; }
.om-diagram .dg-name.is-pending { fill: var(--fg-3); }
.om-diagram .dg-tag { font-family: var(--font-mono); font-size: 10px; fill: var(--fg-3); }
.om-diagram .dg-shape { fill: var(--fg-1); stroke: var(--fg-1); stroke-width: 1.25; }
.om-diagram .dg-shape.is-pending { fill: none; stroke: var(--fg-3); stroke-dasharray: 2 2; }
.om-diagram .dg-rule { stroke: var(--rule-strong); stroke-width: 1; }
.om-legend { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 16px; font: 400 12px/1.3 var(--font-mono); color: var(--fg-3); }
.om-legend span { display: inline-flex; align-items: center; gap: 7px; }
.om-legend svg { width: 12px; height: 12px; display: block; }
.om-legend svg * { fill: var(--fg-1); stroke: var(--fg-1); stroke-width: 1.25; }
.om-legend svg.is-pending * { fill: none; stroke: var(--fg-3); stroke-dasharray: 2 2; }

/* § 03 timeline */
.om-tl { position: relative; height: 470px; margin-top: 8px; }
.om-tl__line { position: absolute; left: 0; right: 0; top: 232px; border-top: 1.5px solid var(--fg-2); }
.om-tl__pt { position: absolute; top: 232px; width: 11px; height: 11px; margin: -6px 0 0 -6px; border-radius: 50%; background: var(--bg); border: 1.5px solid var(--fg-2); box-sizing: border-box; }
.om-tl__pt.is-vote { background: var(--fg-1); border-color: var(--fg-1); }
.om-tl__pt.is-deciding { width: 15px; height: 15px; margin: -8px 0 0 -8px; background: var(--highlight-stroke); border-color: var(--highlight-stroke); box-shadow: 0 0 0 5px var(--highlight-bg); }
.om-tl__lead { position: absolute; width: 0; border-left: 1px solid var(--rule-strong); }
.om-tl__card { position: absolute; width: 176px; margin-left: -88px; padding: 8px 10px; box-sizing: border-box; background: var(--bg-raised); border-radius: var(--radius-sm); font: 400 12px/1.35 var(--font-sans); color: var(--fg-1); }
.om-tl__card.is-deciding { background: var(--highlight-bg); box-shadow: inset 0 0 0 1px var(--highlight-stroke); }
.om-tl__card .rp-label { font-size: 11px; display: block; }
.om-tl__card .tl-body { color: var(--fg-2); display: block; }
.om-tl__card .tl-act { display: block; }
.om-tl__card .tl-req { color: var(--fg-3); display: block; }
.om-tl__card.is-deciding .tl-act { color: var(--highlight); }
.om-tl-v { display: none; list-style: none; margin: 8px 0 0; padding: 0; position: relative; }
.om-tl-v::before { content: ""; position: absolute; left: 7px; top: 8px; bottom: 8px; border-left: 1.5px solid var(--fg-2); }
.om-tl-v li { position: relative; padding: 0 0 16px 30px; font: 400 14px/1.4 var(--font-sans); }
.om-tl-v li::before { content: ""; position: absolute; left: 2px; top: 5px; width: 11px; height: 11px; box-sizing: border-box; border-radius: 50%; background: var(--bg); border: 1.5px solid var(--fg-2); }
.om-tl-v li.is-vote::before { background: var(--fg-1); border-color: var(--fg-1); }
.om-tl-v li.is-deciding::before { background: var(--highlight-stroke); border-color: var(--highlight-stroke); box-shadow: 0 0 0 4px var(--highlight-bg); }
.om-tl-v li .rp-label { display: block; font-size: 12px; }
.om-tl-v li .tl-body { color: var(--fg-2); }
.om-tl-v li.is-deciding .tl-act { color: var(--highlight); }
.om-tl-v li .tl-req { color: var(--fg-3); font-size: 13px; display: block; }

/* § 04 the first screen: Atlas, compact */
.om-screen { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.om-screen .rp-panel { background: var(--bg-raised); }
.om-screen .rp-panel__head { padding: 12px 16px; }
.om-screen .rp-panel__title { font-size: 15px; }
.om-screen .rp-panel__meta { font: 400 11px/1.3 var(--font-mono); color: var(--fg-3); }
.om-screen .rp-table td, .om-cov .rp-table td { white-space: normal; }   /* compact density sets nowrap; these cells wrap */
.om-screen .rp-table td { height: auto; padding: 8px 10px; vertical-align: top; font-size: 13px; line-height: 1.35; }
.om-screen .rp-table th { height: 30px; }
.om-screen .rp-table .is-date { white-space: nowrap; }
.om-screen .rp-panel__foot { font: 400 12px/1.4 var(--font-sans); color: var(--fg-3); }

/* § 05 monitoring */
.om-mark { display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: baseline; padding: 12px 16px; margin-bottom: 4px; background: var(--highlight-bg); box-shadow: inset 2px 0 0 var(--highlight-stroke); border-radius: var(--radius-xs); }
.om-mark .rp-title-s { color: var(--highlight); font-size: 15px; }
.om-mon { list-style: none; margin: 0; padding: 0; }
.om-mon li { display: grid; grid-template-columns: 110px minmax(0, 1fr) 140px; gap: 6px 20px; padding: 12px 0; border-bottom: 1px solid var(--rule); font: 400 14px/1.4 var(--font-sans); align-items: baseline; }
.om-mon li .mon-body { color: var(--fg-2); display: block; font-size: 13px; }
.om-mon li .mon-right { text-align: right; }
.om-mon li .mon-right .rp-label { display: block; font-size: 11px; }

/* § 06 coverage */
.om-cov { margin-top: 8px; }
.om-cov .rp-table td { height: 34px; font-size: 13px; }
.om-cov .rp-table th { height: 30px; }
.om-cov .rp-table td.is-right, .om-cov .rp-table th.is-right { text-align: right; }
.om-cov .cov-j { color: var(--fg-3); font-size: 12px; display: block; }
.om-nocap { list-style: none; margin: 28px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 32px; }
.om-nocap li { padding: 12px 0; border-top: 1px solid var(--rule); font: 400 14px/1.45 var(--font-sans); }
.om-nocap li .rp-label { display: block; margin-top: 2px; font-size: 12px; }

/* § 07 intake, § 08 terms, close */
.om-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0 28px; }
.om-step { position: relative; padding-top: 32px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.om-step::before { content: ""; position: absolute; top: 8px; left: 18px; right: -28px; border-top: 1px solid var(--rule-strong); }
.om-step:last-child::before { display: none; }
.om-node { position: absolute; left: 0; top: 0; width: 17px; height: 17px; border-radius: 50%; box-sizing: border-box; background: var(--bg); border: 1.5px solid var(--fg-2); }
.om-step .rp-figure-s { font-size: 14px; }
.om-step .rp-title { font-size: 16px; line-height: 1.3; }
.om-step .rp-body { font-size: 14px; line-height: 1.5; }
.om-terms { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 28px; }
.om-term { border-top: 1px solid var(--rule-ink); padding-top: 14px; min-width: 0; }
.om-close { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--rule-ink); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; }
.om-row { display: flex; align-items: center; gap: 14px; min-width: 0; }

@media (max-width: 1100px) {
  .om-tl { display: none; }
  .om-tl-v { display: block; }
}
@media (max-width: 900px) {
  .om-head, .om-two, .om-screen, .om-nocap { grid-template-columns: minmax(0, 1fr); }
  .om-head { margin-bottom: 24px; }
  .om-terms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .om-steps { grid-template-columns: minmax(0, 1fr); row-gap: 0; }
  .om-step { padding: 0 0 24px 40px; }
  .om-step::before { top: 22px; bottom: 0; left: 8px; right: auto; border-top: 0; border-left: 1px solid var(--rule-strong); }
  .om-step:last-child::before { display: none; }
}
@media (max-width: 700px) {
  .om-diagram-wide { display: none; }
  .om-diagram-tall { display: block; }
  .om-figs { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .om-figs .rp-metric__value { font-size: 20px; }
  .om-screen .rp-table thead { display: none; }
  .om-screen .rp-table, .om-screen .rp-table tbody, .om-screen .rp-table tr, .om-screen .rp-table td { display: block; width: 100%; box-sizing: border-box; }
  .om-screen .rp-table tr { padding: 10px 12px; border-bottom: 1px solid var(--rule); }
  .om-screen .rp-table td { padding: 1px 0; border: 0; }
  .om-screen .rp-table td.is-meta { display: inline; padding-right: 10px; }
  .om-mon li { grid-template-columns: minmax(0, 1fr); gap: 2px; }
  .om-mon li .mon-right { text-align: left; }
  .om-mon li .mon-right .rp-label { display: inline; margin-left: 8px; }
  .om-cov .rp-table thead { display: none; }
  .om-cov .rp-table, .om-cov .rp-table tbody, .om-cov .rp-table tr, .om-cov .rp-table td, .om-cov .rp-table caption { display: block; width: 100%; box-sizing: border-box; }
  .om-cov .rp-table tr { padding: 10px 0; border-bottom: 1px solid var(--rule); }
  .om-cov .rp-table td { height: auto; padding: 1px 0; border: 0; font-size: 13px; }
  .om-cov .rp-table td.is-mono, .om-cov .rp-table td.is-lag { display: inline; padding-right: 10px; }
  .om-cov .rp-table td.is-right { text-align: left; }
  .om-cov .rp-table td[data-l]::before { content: attr(data-l) " "; color: var(--fg-3); font-family: var(--font-mono); font-size: 11px; }
  .om-cov .rp-table caption { padding: 12px 0 0; }
}
@media (max-width: 560px) { .om-terms { grid-template-columns: minmax(0, 1fr); } }
"""


# ---- sections ------------------------------------------------------------------------------------------------------

def section(num: int, surface: str, anchor: str, heading: str, lead: str | None, body: str) -> str:
    lead_html = f'<p class="rp-body-l" style="margin: 0">{lead}</p>' if lead else ""
    return (f'<section class="rp-section" data-surface="{surface}" id="{anchor}"><div class="rp-section__inner">\n'
            f'<div class="om-head"><div><span class="rp-eyebrow rp-eyebrow--muted">§ {num:02d}</span>'
            f'<h2 class="rp-display-m" style="margin: 0">{heading}</h2></div>{lead_html}</div>\n{body}\n</div></section>\n')


def s01_today(snap: dict) -> str:
    t = snap["totals"]
    today = [
        ("The attorney's memory of the board", "how it voted on requests like yours"),
        ("The engineer's call to the utility", "whether capacity exists"),
        ("The broker's comps", "what sold, and for how much"),
        ("A listing site", "what is for sale this week"),
        ("One site at a time", "each board's portal, read by hand"),
        ("After the contract", "when the questions are already expensive"),
    ]
    left = "".join(f'<li>{esc(a)}<span class="rp-label">{esc(b)}</span></li>' for a, b in today)
    right = "".join(f'<li>{esc(a)}<span class="rp-label">{esc(b)}</span></li>' for a, b in [
        ("The whole county's record", f"{n(t['captured'])} of {n(t['bodies'])} bodies, every agenda, packet and minutes document"),
        ("Before the contract", "any tract checked against the cases most like it"),
        ("Kept current", "each agenda read the day the clerk posts it"),
    ])
    figs = "".join(
        f'<div class="rp-metric rp-metric--m"><p class="rp-metric__value">{v}</p><div class="rp-metric__label">{esc(k)}</div></div>'
        for k, v in [("meetings", n(t["meetings"])), ("documents", n(t["documents"])), ("pages read", n(t["pages"]))])
    body = (f'<div class="om-two"><div class="om-col"><h3 class="rp-title" style="margin: 0">Today</h3><ul class="om-list">{left}</ul></div>'
            f'<div class="om-col"><h3 class="rp-title" style="margin: 0">With AtlasLand</h3><ul class="om-list">{right}</ul>'
            f'<div class="om-figs">{figs}</div>'
            f'<p class="om-cap">Wilson County, Tennessee, {esc(snap["totals"]["years"]["from"][:4])} to {esc(d_long(snap["as_of"]))}.</p></div></div>')
    return section(1, "carbon", "today", "Today and with AtlasLand.",
                   "A land deal is decided by the county, one board at a time. The record below is the county's own, held whole.", body)


SHAPES = {
    "elected_board": "square", "planning_commission": "circle", "board_of_zoning_appeals": "diamond",
    "utility_board": "triangle", "school_board": "bar", "economic_development_board": "bar", "technical_review_committee": "dot", "other": "dot",
}
SHAPE_NAMES = {"square": "elected board", "circle": "planning commission", "diamond": "zoning appeals", "triangle": "utility board",
               "bar": "school or development board", "dot": "committee or other board"}


def shape_svg(kind: str, cx: float, cy: float, pending: bool, size: float = 5.0) -> str:
    cls = "dg-shape is-pending" if pending else "dg-shape"
    s = size
    if kind == "square":
        return f'<rect class="{cls}" x="{cx - s:.1f}" y="{cy - s:.1f}" width="{2 * s:.1f}" height="{2 * s:.1f}" />'
    if kind == "circle":
        return f'<circle class="{cls}" cx="{cx:.1f}" cy="{cy:.1f}" r="{s:.1f}" />'
    if kind == "diamond":
        return f'<path class="{cls}" d="M{cx:.1f} {cy - s - 1:.1f} L{cx + s + 1:.1f} {cy:.1f} L{cx:.1f} {cy + s + 1:.1f} L{cx - s - 1:.1f} {cy:.1f} Z" />'
    if kind == "triangle":
        return f'<path class="{cls}" d="M{cx:.1f} {cy - s - 1:.1f} L{cx + s + 1:.1f} {cy + s:.1f} L{cx - s - 1:.1f} {cy + s:.1f} Z" />'
    if kind == "bar":
        return f'<rect class="{cls}" x="{cx - s - 1:.1f}" y="{cy - 2.5:.1f}" width="{2 * s + 2:.1f}" height="5" />'
    return f'<circle class="{cls}" cx="{cx:.1f}" cy="{cy:.1f}" r="{s - 2:.1f}" />'


def short_name(b: dict) -> str:
    s = b["name"]
    j = b["jurisdiction"]
    for prefix in (j + " ", "City of " + j + " ", "Wilson County Mt. Juliet "):
        if s.startswith(prefix):
            s = s[len(prefix):]
    s = s.replace(" (County Meetings category: GIS Committee)", " (GIS)")
    # The page never carries the word "public"; this committee's registered name starts with it, so it is shown without it.
    s = s.replace("Public Infrastructure Committee", "Infrastructure Committee")
    s = re.sub(r"^Wilson County Joint Economic and Community Development Board$", "Joint Economic Development Board", s)
    s = re.sub(r"^Water & Wastewater Authority of Wilson County Board of Commissioners$", "Water and Wastewater Authority", s)
    s = re.sub(r"^Lebanon Special School District Board of Education$", "Special School District Board", s)
    s = re.sub(r"^Wilson County Board of Education$", "Board of Education (county schools)", s)
    if b["jurisdiction_kind"] == "utility_district":
        s = b["jurisdiction"] + " Board"
    s = s.replace("committees (GIS)", "GIS Committee").replace("&", "and")
    return s


def group_rows(snap: dict):
    order = ["Wilson County", "Lebanon", "Mt. Juliet", "Watertown", "Utilities and districts"]
    groups = {g: [] for g in order}
    for b in snap["bodies"]:
        groups[b["group"]].append(b)
    type_rank = {"elected_board": 0, "planning_commission": 1, "board_of_zoning_appeals": 2, "technical_review_committee": 3,
                 "utility_board": 4, "school_board": 5, "economic_development_board": 6, "other": 7}
    for g in groups.values():
        g.sort(key=lambda b: (not b["captured"], type_rank[b["body_type"]], b["name"]))
    return [(g, groups[g]) for g in order]


def diagram(snap: dict, wide: bool) -> str:
    rows = group_rows(snap)
    row_h, head_h, pad = 24, 44, 8
    if wide:
        cols = len(rows)
        col_w = 232
        width = cols * col_w
        height = head_h + max(len(b) for _, b in rows) * row_h + pad
        out = [f'<svg class="om-diagram om-diagram-wide" viewBox="0 0 {width} {height}" role="img" aria-label="The bodies of Wilson County grouped by jurisdiction">']
        for i, (g, bodies) in enumerate(rows):
            x0 = i * col_w + 4
            out.append(group_svg(g, bodies, x0, 0, col_w - 16, row_h, head_h))
        out.append("</svg>")
        return "\n".join(out)
    width = 360
    height = sum(head_h + len(b) * row_h + 14 for _, b in rows)
    out = [f'<svg class="om-diagram om-diagram-tall" viewBox="0 0 {width} {height}" role="img" aria-label="The bodies of Wilson County grouped by jurisdiction">']
    y = 0
    for g, bodies in rows:
        out.append(group_svg(g, bodies, 4, y, width - 8, row_h, head_h))
        y += head_h + len(bodies) * row_h + 14
    out.append("</svg>")
    return "\n".join(out)


def group_svg(g: str, bodies: list, x0: float, y0: float, w: float, row_h: int, head_h: int) -> str:
    cap = sum(b["captured"] for b in bodies)
    out = [f'<text class="dg-head" x="{x0}" y="{y0 + 16}">{esc(g)}</text>',
           f'<text class="dg-count" x="{x0}" y="{y0 + 31}">{cap} of {len(bodies)} captured</text>',
           f'<line class="dg-rule" x1="{x0}" y1="{y0 + 37}" x2="{x0 + w}" y2="{y0 + 37}" />']
    for k, b in enumerate(bodies):
        cy = y0 + head_h + k * row_h + row_h / 2 - 2
        pending = not b["captured"]
        out.append(shape_svg(SHAPES[b["body_type"]], x0 + 8, cy, pending))
        name = short_name(b)
        tag = "" if not pending else ("not located" if b["capture_status"] == "not_located" else "requested")
        cls = "dg-name is-pending" if pending else "dg-name"
        out.append(f'<text class="{cls}" x="{x0 + 22}" y="{cy + 4:.1f}">{esc(name)}</text>')
        if tag:
            out.append(f'<text class="dg-tag" x="{x0 + 22 + len(name) * 5.9 + 10:.1f}" y="{cy + 4:.1f}">{tag}</text>')
    return "\n".join(out)


def s02_mapped(snap: dict) -> str:
    t = snap["totals"]
    legend = "".join(f'<span><svg viewBox="0 0 12 12">{shape_svg(k, 6, 6, False, 4.2)}</svg>{esc(v)}</span>' for k, v in SHAPE_NAMES.items())
    legend += f'<span><svg class="is-pending" viewBox="0 0 12 12">{shape_svg("circle", 6, 6, True, 4.2)}</svg>outlined: not captured, requested from the clerk</span>'
    cap = (f'{n(t["bodies"])} bodies in {n(t["jurisdictions"])} jurisdictions, {n(t["captured"])} captured and {n(t["not_captured"])} requested; '
           f'{n(t["land_use_bodies"])} of them decide land use, {n(t["land_use_captured"])} captured. '
           f'Records from {esc(t["years"]["from"][:4])} to {esc(d_long(t["years"]["to"]))}, as of {esc(d_long(snap["as_of"]))}.')
    body = diagram(snap, True) + "\n" + diagram(snap, False) + f'<div class="om-legend">{legend}</div><p class="om-cap">{cap}</p>'
    return section(2, "blueline", "mapped", "The county, mapped.",
                   "Every board that decides or shapes land in the county and its towns, typed by shape; captured bodies in ink.", body)


def tl_card_parts(e: dict) -> tuple[str, str, str, str]:
    act = e["action_label"] or e["kind_label"]
    if e["action_label"] and e["kind_label"] not in ("Item",) and e["action_label"].lower() != e["kind_label"].lower():
        act = f'{e["kind_label"]} · {e["action_label"]}' if e["kind"] in ("first_reading", "second_reading", "consent", "recommendation") and e["action"] in ("heard", "approved", "approved_with_conditions", "deferred") else e["action_label"]
    vote = f' · {e["vote"]}' if e["vote"] else ""
    req = e["case_type_label"]
    if e.get("acreage"):
        req += f' · {e["acreage"]:g} ac'
    if e.get("lots"):
        req += f' · {e["lots"]} lots'
    return d_long(e["date"]), short_body(e["body"], "Lebanon"), act + vote, req


def s03_project(snap: dict) -> str:
    c = snap["case"]
    ev = c["timeline"]
    N = len(ev)
    lanes = [0, 100, 250, 350]           # card tops: two above the line (232), two below
    cards, pts = [], []
    for i, e in enumerate(ev):
        x = (i + 0.5) / N * 100
        dt, body, act, req = tl_card_parts(e)
        deciding = e["deciding"]
        cls_pt = "om-tl__pt" + (" is-deciding" if deciding else (" is-vote" if e["vote"] else ""))
        pts.append(f'<span class="{cls_pt}" style="left: {x:.3f}%"></span>')
        top = lanes[i % 4]
        card_h = 84
        if i % 4 < 2:
            lead_top, lead_h = top + card_h, 232 - (top + card_h)
        else:
            lead_top, lead_h = 232, top - 232
        cards.append(f'<span class="om-tl__lead" style="left: {x:.3f}%; top: {lead_top}px; height: {lead_h}px"></span>')
        cards.append(f'<div class="om-tl__card{" is-deciding" if deciding else ""}" style="left: {x:.3f}%; top: {top}px">'
                     f'<span class="rp-label">{esc(dt)}</span><span class="tl-body">{esc(body)}</span><span class="tl-act">{esc(act)}</span><span class="tl-req">{esc(req)}</span></div>')
    wide = f'<div class="om-tl" aria-hidden="true"><div class="om-tl__line"></div>{"".join(cards)}{"".join(pts)}</div>'
    rows = []
    for e in ev:
        dt, body, act, req = tl_card_parts(e)
        cls = " is-deciding" if e["deciding"] else (" is-vote" if e["vote"] else "")
        rows.append(f'<li class="{cls.strip()}"><span class="rp-label">{esc(dt)}</span><span class="tl-body">{esc(body)} · </span><span class="tl-act">{esc(act)}</span><span class="tl-req">{esc(req)}</span></li>')
    tall = f'<ol class="om-tl-v">{"".join(rows)}</ol>'
    bodies = " and ".join(short_body(b, "Lebanon") for b in c["bodies"])
    deciding_n = sum(e["deciding"] for e in ev)
    votes_n = sum(1 for e in ev if e["vote"])
    cap = (f'First event {esc(d_long(c["first_date"]))}, last {esc(d_long(c["last_date"]))}: {c["elapsed_months"]:g} months, {N} events before the {esc(bodies)}, '
           f'held as {c["cases"]} case rows on {c["parcels"]} parcels ({c["acreage_stated"]:g} acres as the ordinance states it). '
           f'{votes_n} events carry a recorded vote; the {deciding_n} highlighted are the decisions. '
           f'Filled points are votes; the council\'s own tallies are not quoted in its agendas, so its readings show as heard.')
    return section(3, "paper", "project", "One project, followed.",
                   "A residential project on Tax Map 68 in Lebanon, from its first deferral to its latest reading, every event dated from the document it rests on.",
                   wide + tall + f'<p class="om-cap">{cap}</p>')


def pick_rows(items: list, newest_first: bool) -> tuple[list, int]:
    """The twelve rows shown: in date order, and when the window holds more bodies than fit, at most PER_BODY per body
    so the screen shows the county rather than one board's agenda."""
    ordered = sorted(items, key=lambda i: i["date"], reverse=newest_first)
    cap = PER_BODY if len({i["body"] for i in items}) >= MAX_ROWS // PER_BODY else MAX_ROWS
    chosen, per_body, dropped_word = [], {}, 0
    for it in ordered:
        if not no_public(it["description"]):
            dropped_word += 1
            continue
        if per_body.get(it["body"], 0) >= cap:
            continue
        per_body[it["body"]] = per_body.get(it["body"], 0) + 1
        chosen.append(it)
        if len(chosen) == MAX_ROWS:
            break
    return chosen, dropped_word


def screen_panel(title: str, window: dict, items: list, total: int, newest_first: bool, extra: str = "") -> tuple[str, list]:
    rows, _ = pick_rows(items, newest_first)
    trs = "".join(
        f'<tr><td class="is-mono is-date is-meta">{esc(r["date"])}</td><td class="is-meta">{esc(r["body"])}</td><td class="is-muted is-meta">{esc(r["type"])}</td>'
        f'<td>{esc(r["description"])}</td><td class="is-mono is-meta">{esc(r["status"])}</td></tr>' for r in rows)
    bodies = sorted({r["body"] for r in items})
    foot = f'{len(rows)} of {total} items shown; {total} land-use items from {len(bodies)} {"body" if len(bodies) == 1 else "bodies"} in this window.' if total > len(rows) else f'{total} land-use items from {len(bodies)} {"body" if len(bodies) == 1 else "bodies"}.'
    panel = (f'<div class="rp-panel"><div class="rp-panel__head"><div class="rp-panel__titles"><h3 class="rp-panel__title">{esc(title)}</h3>'
             f'<span class="rp-panel__meta">{esc(d_short(window["from"]))} to {esc(d_long(window["to"]))}</span></div></div>'
             f'<div class="rp-panel__body is-flush"><div class="rp-table-wrap"><table class="rp-table"><thead><tr><th>Date</th><th>Body</th><th>Type</th><th>Item</th><th>Status</th></tr></thead>'
             f'<tbody>{trs}</tbody></table></div></div><div class="rp-panel__foot">{foot}{extra}</div></div>')
    return panel, rows


def s04_screen(snap: dict) -> tuple[str, list, list]:
    rc, up = snap["recent_items"], snap["upcoming_items"]
    left, rows_l = screen_panel("Last 30 days", rc["window"], rc["items"], rc["total"], True)
    extra = ""
    item_bodies = {i["body"] for i in up["items"]}
    others = [m for m in up["meetings"] if m["body"] not in item_bodies]
    if others:
        extra = " Also scheduled: " + "; ".join(f'{esc(m["body"])} on {esc(d_long(m["date"]))} (agenda posted {esc(d_long(m["agenda_posted_at"][:10]))}, items not yet read)' for m in others) + "."
    right, rows_r = screen_panel("Next 30 days", up["window"], up["items"], up["total"], False, extra)
    body = f'<div class="om-screen" data-product="atlas" data-density="compact">{left}{right}</div>'
    return section(4, "carbon", "screen", "The first screen.",
                   "AtlasLand opens on what the county decided in the last 30 days and what is scheduled in the next 30, across every captured body.", body), rows_l, rows_r


def s05_monitoring(snap: dict) -> str:
    m = snap["monitoring"]
    g = m["parcel_group"]
    lis = []
    for it in m["items"]:
        act = it["action"] + (f' {it["vote"]}' if it["vote"] else "")
        rel = "the parcel group itself" if it["distance_m"] == 0 else f'{it["distance_m"]:,} m away'
        lis.append(f'<li><span class="rp-label">{esc(d_long(it["date"]))}</span><span>{esc(it["description"])}<span class="mon-body">{esc(it["body"])} · {esc(it["kind"])}</span></span>'
                   f'<span class="mon-right">{esc(act)}<span class="rp-label">{esc(rel)}</span></span></li>')
    mark = (f'<div class="om-mark"><span class="rp-title-s">{esc(g["label"])}, {esc(g["jurisdiction"])}</span>'
            f'<span class="rp-label">{g["parcels"]} parcels · {snap["case"]["acreage_stated"]:g} acres stated · marked</span></div>')
    cap = (f'{len(m["items"])} items between {esc(d_long(m["window"]["from"]))} and {esc(d_long(m["window"]["to"]))}: every case on the marked parcels, '
           f'every case on a parcel within {m["neighbour_m"]:,} m, and every agenda item naming a parcel within {m["near_text_m"]:,} m.')
    body = f'{mark}<ul class="om-mon">{"".join(lis)}</ul><p class="om-cap">{cap}</p>'
    return section(5, "blueline", "monitoring", "Deal monitoring.",
                   "Mark the parcels you are pursuing; AtlasLand lists every item that names them or a parcel beside them, the day it appears on an agenda.", body)


def lag_cell(v, before: bool) -> str:
    if v is None:
        return '<span class="is-muted">not stated</span>'
    v = float(v)
    if before:
        return f'{abs(v):g} days before' if v >= 0 else f'{abs(v):g} days after'
    return f'{abs(v):g} days after' if v >= 0 else f'{abs(v):g} days before'


def s06_coverage(snap: dict) -> str:
    cov = snap["coverage"]
    opening = cov["opening_paragraph"].replace("the public meeting record", "the meeting record")
    assert no_public(opening), "the coverage paragraph still carries the word"
    rows = []
    for g, bodies in group_rows(snap):
        for b in bodies:
            if not b["captured"]:
                continue
            lg = b["posting_lag"]
            a = lag_cell(lg["median_agenda_lead_days"], True) if lg["agendas_with_posted_at"] else '<span class="is-muted">not stated</span>'
            mi = lag_cell(lg["median_minutes_lag_days"], False) if lg["minutes_with_posted_at"] else '<span class="is-muted">not stated</span>'
            rows.append(f'<tr><td>{esc(short_name(b))}<span class="cov-j">{esc(b["jurisdiction"])}</span></td><td class="is-mono" data-l="from">{esc(b["earliest_record"] or "")}</td>'
                        f'<td class="is-mono is-right" data-l="meetings">{n(b["meetings"])}</td><td class="is-lag" data-l="agenda">{a}</td><td class="is-lag" data-l="minutes">{mi}</td></tr>')
    table = (f'<div class="om-cov" data-product="atlas" data-density="compact"><div class="rp-table-wrap"><table class="rp-table"><thead><tr><th>Body</th><th>Earliest record</th>'
             f'<th class="is-right">Meetings</th><th>Agenda posted</th><th>Minutes posted</th></tr></thead><tbody>{"".join(rows)}</tbody>'
             f'<caption>Posting lag is the median, measured where the platform states a posting time; "not stated" means the platform gives none.</caption></table></div></div>')
    nocap = "".join(f'<li>{esc(b["name"])}<span class="rp-label">{"not located" if b["capture_status"] == "not_located" else "records request"} · {esc(b["capture_reason"] or "")}</span></li>'
                    for b in snap["bodies"] if not b["captured"])
    body = f'<p class="rp-body" style="margin: 0 0 28px; max-width: 76ch; color: var(--fg-1)">{esc(opening)}</p>{table}<ul class="om-nocap">{nocap}</ul>'
    return section(6, "paper", "coverage", "Coverage, stated.", None, body)


def s07_intake() -> str:
    steps = [("Map the county", "Every board that decides land, in the county and its towns."),
             ("Collect the record", "Several years of agendas, packets and minutes, plus the land records."),
             ("Read it into cases", "Each value tied to its document and page."),
             ("Add what is coming", "Road funding, capacity decisions, annexations, fee studies, rule changes."),
             ("State the coverage", "Which boards are in, from when, and what is not available.")]
    lis = "".join(f'<li class="om-step"><span class="om-node" aria-hidden="true"></span><span class="rp-figure-s" style="color: var(--fg-3)">{i}</span>'
                  f'<h3 class="rp-title" style="margin: 0">{esc(a)}</h3><p class="rp-body" style="margin: 0; color: var(--fg-2)">{esc(b)}</p></li>' for i, (a, b) in enumerate(steps, 1))
    return section(7, "carbon", "intake", "Intake.", "Every county goes through the same five steps, so a new county is online in days to weeks.", f'<ol class="om-steps">{lis}</ol>')


def s08_terms(mark: str) -> str:
    terms = ["Per county, same price built or not.", "Seats in blocks of 10, or one seat for an individual.", "Twelve months, paid in advance, renewing annually.",
             "First 30 days of a new county included in full, agreement and price stated on day one.", "Red Planet Data owns the data; agreements are with Red Planet Data, Inc."]
    grid = "".join(f'<div class="om-term"><p class="rp-body" style="margin: 0">{esc(t)}</p></div>' for t in terms)
    close = (f'<div class="om-close"><div class="om-row"><img src="{mark}" alt="" style="width: 32px; height: 32px; display: block; flex: none">'
             f'<span class="rp-title-s">Red Planet Data, Inc.</span></div>'
             f'<a href="mailto:hello@redplanetdata.com" class="rp-label" style="color: var(--fg-1); text-decoration: underline; text-underline-offset: 3px">hello@redplanetdata.com</a></div>')
    return section(8, "blueline", "terms", "Terms.", None, f'<div class="om-terms">{grid}</div>{close}')


def build(snapshot_path: Path) -> dict:
    snap = json.loads(snapshot_path.read_text(encoding="utf-8"))
    mark = mark_data_uri()
    as_of = date.fromisoformat(snap["as_of"])
    s4, rows_l, rows_r = s04_screen(snap)
    sections = [s01_today(snap), s02_mapped(snap), s03_project(snap), s4, s05_monitoring(snap), s06_coverage(snap), s07_intake(), s08_terms(mark)]
    head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>How AtlasLand Works | Red Planet Data</title>
<meta name="description" content="Wilson County, Tennessee as AtlasLand holds it: the boards, one project followed through the record, the first screen, deal monitoring and the stated coverage.">
<link rel="icon" href="{mark}">
<style>
{font_face("Geist", 400, "geist-latin-400-normal.woff2")}
{font_face("Geist", 500, "geist-latin-500-normal.woff2")}
{font_face("Fragment Mono", 400, "fragment-mono-latin-400-normal.woff2")}
</style>
<style>
{design_css()}
</style>
<style>{PAGE_CSS}</style>
</head>
"""
    body = f"""<body>
<div class="rp-root om" data-product="red-planet" style="min-height: 100%; padding: 8px; display: flex; flex-direction: column; gap: 8px; background: var(--bg); color: var(--fg-1); font-family: var(--font-sans)">

<header style="padding: clamp(28px, 3.5vw, 48px) var(--page-gutter) clamp(20px, 2.5vw, 32px)">
<div style="max-width: var(--page-max); margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px">
<img src="{mark}" alt="Red Planet Data" style="width: 48px; height: 48px; display: block; flex: none">
<h1 class="rp-display-l" style="margin: 0; flex: 1 1 420px; font-size: clamp(34px, 4.4vw, 56px); color: var(--fg-1)">How AtlasLand Works</h1>
<p class="rp-label" style="margin: 0; flex: 0 1 auto; min-width: 0">{as_of.strftime('%B %Y')} · as of {esc(snap["as_of"])}</p>
</div>
</header>

{"".join(sections)}
</div>
</body>
</html>
"""
    page = head + body
    assert no_public(re.sub(r'url\("data:[^"]+"\)', "", page)), "the page carries the word"
    TARGET.write_text(page, encoding="utf-8", newline="\n")
    return {"bytes": len(page.encode("utf-8")), "sections": page.count('<section class="rp-section"'), "timeline": snap["case"]["timeline"],
            "recent_rows": rows_l, "upcoming_rows": rows_r, "snapshot": snapshot_path.name, "as_of": snap["as_of"]}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--snapshot", default=None)
    a = ap.parse_args()
    snapshot = Path(a.snapshot) if a.snapshot else sorted((REPO / "public" / "data").glob("wilson-county-tn-*.json"))[-1]
    r = build(snapshot)
    print(f"wrote {TARGET} ({r['bytes']:,} bytes, {r['sections']} sections) from {r['snapshot']} as of {r['as_of']}")
    print(f"timeline: {len(r['timeline'])} events, {r['timeline'][0]['date']} -> {r['timeline'][-1]['date']}")
    print(f"recent rows shown: {len(r['recent_rows'])}; upcoming rows shown: {len(r['upcoming_rows'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
