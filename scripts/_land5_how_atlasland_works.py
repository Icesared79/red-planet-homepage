"""LAND-5 (2026-10-22): the How AtlasLand Works document (public/how-atlasland-works.html), built from the How Red
Planet Works document's own head (self-hosted fonts, tokens, Plat palette, page components) so the two read as one
set, and the AtlasLand line on public/how-red-planet-works.html rewritten and linked to it. Copy is the operator's,
verbatim. Run from the homepage worktree root; every replacement asserts the old text was found.

LAND-5.1 (2026-10-22): the operator's shorter reference copy, no paragraph over two sentences. The page is rebuilt
from this script whenever the sibling's head changes; the sibling's AtlasLand line is only rewritten if it still
carries the pre-LAND-5 text.
"""
import re
from pathlib import Path

SIBLING = Path("public/how-red-planet-works.html")
TARGET = Path("public/how-atlasland-works.html")

src = SIBLING.read_text(encoding="utf-8").replace("\r\n", "\n")


def once(text, old, new):
    assert text.count(old) == 1, f"expected exactly one occurrence of: {old[:80]!r}"
    return text.replace(old, new)


# ---- the new page ---------------------------------------------------------------------------------------------------

head = src[: src.index("<body>")]
head = once(head, "<title>How Red Planet Works | Red Planet Data</title>", "<title>How AtlasLand Works | Red Planet Data</title>")
head = once(
    head,
    '<meta name="description" content="How Red Planet Data builds, prices and licenses county-level data through Atlas.">',
    '<meta name="description" content="How AtlasLand brings a county\'s land decisions together as cases, and what a county license includes.">',
)
# The one layout this page needs that the sibling does not: a three-column terms grid.
extra_css = (
    ".om-terms--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n"
    "@media (max-width: 900px) { .om-terms--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\n"
    "@media (max-width: 560px) { .om-terms--3 { grid-template-columns: minmax(0, 1fr); } }\n"
)
last_style = head.rindex("</style>")
head = head[:last_style] + extra_css + head[last_style:]

logo_img = re.search(r'<img src="(data:image/svg\+xml;base64,[^"]+)" alt="Red Planet Data"', src).group(1)
close_img = re.search(r'<div class="om-close">\n<div class="om-row"><img src="(data:image/svg\+xml;base64,[^"]+)"', src).group(1)

ICONS = {
    # lucide outlines, as the sibling inlines them
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3" /> <path d="M3 5V19A9 3 0 0 0 21 19V5" /> <path d="M3 12A9 3 0 0 0 21 12" />',
    "layers": '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /> <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /> <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />',
    "bell": '<path d="M10.268 21a2 2 0 0 0 3.464 0" /> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />',
    "map": '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /> <path d="M15 5.764v15" /> <path d="M9 3.236v15" />',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" />',
    "calendar": '<path d="M8 2v4" /> <path d="M16 2v4" /> <rect width="18" height="18" x="3" y="4" rx="2" /> <path d="M3 10h18" />',
    "clock": '<circle cx="12" cy="12" r="10" /> <path d="M12 6v6l4 2" />',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /> <path d="M7 11V7a5 5 0 0 1 10 0v4" />',
    "pen": '<path d="M12 20h9" /> <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />',
}


def icon(name, box=44, size=22):
    style = "" if box == 44 else f' style="width: {box}px; height: {box}px"'
    return (
        f'<span class="om-icon"{style}><span class="rp-icon" aria-hidden="true" style="width: {size}px; height: {size}px">'
        '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        f"{ICONS[name]}</svg></span></span>"
    )


def section_head(sid, num, title, lead=None, split=False):
    left = (
        '<div style="display: flex; flex-direction: column; gap: 16px">\n'
        f'<span class="rp-eyebrow rp-eyebrow--muted">§ {num}</span>\n'
        f'<h2 class="rp-display-m" style="margin: 0; color: var(--fg-1)">{title}</h2>\n'
        "</div>\n"
    )
    leads = [lead] if isinstance(lead, str) else (lead or [])
    right = "".join(f'<p class="rp-body-l" style="margin: 0; color: var(--fg-2)">{p}</p>\n' for p in leads)
    if len(leads) > 1:
        right = f'<div style="display: flex; flex-direction: column; gap: 16px">\n{right}</div>\n'
    cls = "om-split" if split else "om-head"
    return f'<div id="{sid}" class="{cls}">\n{left}{right}</div>\n'


def section(surface, inner):
    return f'<section class="rp-section" data-surface="{surface}"><div class="rp-section__inner">\n{inner}</div></section>\n'


s01 = section(
    "forest",
    section_head(
        "problem",
        "01",
        "The problem",
        [
            "A land deal is decided by the county, not the market. The record that decides it, how boards have voted "
            "on requests like yours, what they attach, whether capacity exists, what is on next month's agenda, is "
            "spread across dozens of boards and read one site at a time, after the contract is signed.",
            "AtlasLand holds it for the whole county and keeps it current.",
        ],
        split=True,
    ),
)

LICENSE_COLS = [
    (
        "database",
        "The record",
        [
            "Every land decision in the county for the past several years as a case: parcel, applicant, request, staff "
            "recommendation, each board's vote, conditions and timing.",
            "With it, the land: parcels, owners and their companies, sales, taxes, liens and constraints.",
        ],
    ),
    (
        "layers",
        "AtlasLand",
        [
            "Opens on what the county decided in the last 30 days and what is scheduled in the next 30.",
            "Any tract can be checked against the past cases most like it.",
        ],
    ),
    (
        "bell",
        "Deal monitoring",
        [
            "Mark the tracts you are pursuing.",
            "AtlasLand reports anything that touches them the day it appears on an agenda, with the source attached.",
        ],
    ),
]
cols = []
for i, (ic, title, paras) in enumerate(LICENSE_COLS):
    key = " om-lic-col--key" if i == 0 else ""
    items = "\n".join(f'<li><span class="rp-body" style="color: var(--fg-1)">{p}</span></li>' for p in paras)
    cols.append(
        f'<div class="om-lic-col{key}">\n'
        f'<div class="om-row">{icon(ic)}<h3 class="rp-title" style="margin: 0; flex: 1; min-width: 0; color: var(--fg-1)">{title}</h3></div>\n'
        f'<ul class="om-lic-list">\n{items}\n</ul>\n'
        "</div>\n"
    )
s02 = section(
    "sage",
    section_head("license", "02", "What a license includes")
    + '<div class="om-lic">\n<div class="om-lic-cols">\n'
    + "".join(cols)
    + "</div>\n</div>\n",
)

STEPS = [
    # the operator's "Map the county: every board..." lines, split at the colon into the step's title and line
    ("Map the county", "Every board that decides land, in the county and its towns."),
    ("Collect the record", "Several years of agendas, packets and minutes, plus the land records."),
    ("Read it into cases", "Each value tied to its document and page."),
    ("Add what is coming", "Road funding, capacity decisions, annexations, fee studies, rule changes."),
    ("State the coverage", "Which boards are in, from when, and what is not available."),
]
steps = "\n".join(
    f'<li class="om-step"><span class="om-node" aria-hidden="true"></span><span class="rp-figure-s" style="color: var(--fg-3)">{n}</span>'
    f'<h3 class="rp-title" style="margin: 0; color: var(--fg-1)">{t}</h3><p class="rp-body" style="margin: 0; color: var(--fg-2)">{b}</p></li>'
    for n, (t, b) in enumerate(STEPS, 1)
)
s03 = section(
    "forest",
    section_head(
        "intake",
        "03",
        "Intake",
        "Every county goes through the same five steps, so a new county is online in days to weeks.",
    )
    + f'<ol class="om-steps">\n{steps}\n</ol>\n',
)

s04 = section(
    "paper",
    section_head(
        "example",
        "04",
        "Example",
        "Wilson County, Tennessee, October 2026: 35 boards identified, 31 captured with nearly six years of records "
        "(1,146 meetings), 4 requested from clerks. A 46-acre residential project can be followed from its first "
        "planning recommendation in 2022 to its final plats in 2024, every vote dated.",
        split=True,
    ),
)

NOT_DO = [
    "No predictions.",
    "No brokering or introductions.",
    "No landowner phone numbers or email addresses.",
    "No custom builds; every licensee in a county gets the same record.",
]
not_do = "\n".join(
    f'<div class="om-term">\n<p class="rp-body" style="margin: 0; color: var(--fg-1)">{t}</p>\n</div>' for t in NOT_DO
)
s05 = section(
    "sage",
    section_head("limits", "05", "What AtlasLand does not do") + f'<div class="om-terms">\n{not_do}\n</div>\n',
)

TERMS = [
    ("map", "Per county, same price built or not."),
    ("users", "Seats in blocks of 10, or one seat for an individual."),
    ("calendar", "Twelve months, paid in advance, renewing annually."),
    ("clock", "First 30 days of a new county included in full, agreement and price stated on day one."),
    ("lock", "Red Planet Data owns the data; agreements are with Red Planet Data, Inc."),
]
terms = "\n".join(
    f'<div class="om-term">\n<div class="om-row">{icon(ic, 36, 18)}</div>\n<p class="rp-body" style="margin: 0; color: var(--fg-1)">{t}</p>\n</div>'
    for ic, t in TERMS
)
s06 = section(
    "paper",
    section_head("terms-06", "06", "Terms")
    + f'<div class="om-terms om-terms--3">\n{terms}\n</div>\n'
    + '<div class="om-close">\n'
    f'<div class="om-row"><img src="{close_img}" alt="" style="width: 32px; height: 32px; display: block; flex: none"><span class="rp-title-s" style="color: var(--fg-1)">Red Planet Data, Inc.</span></div>\n'
    '<a href="mailto:hello@redplanetdata.com" class="rp-label" style="color: var(--fg-1); text-decoration: underline; text-underline-offset: 3px">hello@redplanetdata.com</a>\n'
    "</div>\n",
)

body = (
    "<body>\n"
    '<div class="rp-root om" data-product="red-planet" style="min-height: 100%; padding: 8px; display: flex; flex-direction: column; gap: 8px; background: var(--bg); color: var(--fg-1); font-family: var(--font-sans)">\n\n'
    '<header style="padding: clamp(28px, 3.5vw, 48px) var(--page-gutter) clamp(20px, 2.5vw, 32px)">\n'
    '<div style="max-width: var(--page-max); margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px">\n'
    f'<img src="{logo_img}" alt="Red Planet Data" style="width: 48px; height: 48px; display: block; flex: none">\n'
    '<h1 class="rp-display-l" style="margin: 0; flex: 1 1 420px; font-size: clamp(34px, 4.4vw, 56px); color: var(--fg-1)">How AtlasLand Works</h1>\n'
    '<p class="rp-label" style="margin: 0; flex: none">October 2026</p>\n'
    "</div>\n"
    "</header>\n\n"
    + "\n".join([s01, s02, s03, s04, s05, s06])
    + "\n</div>\n</body>\n</html>\n"
)

TARGET.write_text(head + body, encoding="utf-8", newline="\r\n")

# ---- the sibling's AtlasLand line -----------------------------------------------------------------------------------

old_tile = (
    '<span class="om-brand"><span class="rp-title" style="color: var(--fg-1)">AtlasLand</span></span>'
    '<span class="rp-small" style="color: var(--fg-2)">(jurisdiction actions on data centers, hearings, land assemblies and meeting records)</span>'
)
new_tile = (
    '<span class="om-brand"><a href="/how-atlasland-works" class="rp-title" style="color: var(--fg-1); text-decoration: underline; text-underline-offset: 3px">AtlasLand</a></span> '
    '<span class="rp-small" style="color: var(--fg-2)">covers land and jurisdiction records for any land use: decisions, hearings, land assemblies and meeting records</span>'
)
if old_tile in src:
    SIBLING.write_text(once(src, old_tile, new_tile), encoding="utf-8", newline="\r\n")
    print("updated", SIBLING)
else:
    assert src.count(new_tile) == 1, "the sibling's AtlasLand line is neither the old nor the LAND-5 text"
print("wrote", TARGET)
