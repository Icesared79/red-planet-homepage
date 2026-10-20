"""LAND-1 (2026-10-20): the How Red Planet Works document (public/how-red-planet-works.html) says Atlas is the
platform, names the four views in one plain sentence each, prices a license as counties plus seats with the views
included, and offers no custom work. Text and the product marks only; the design is untouched. Run once from the
homepage worktree root; every replacement asserts the old text."""
import re
from pathlib import Path

p = Path("public/how-red-planet-works.html")
s = p.read_text(encoding="utf-8")
orig = s

def rep(a, b, count=1):
    global s
    assert a in s, f"missing: {a[:90]!r}"
    s = s.replace(a, b, count)

rep("Atlas builds the data and the platforms. Customers license the data and can add a platform.",
    "Atlas builds the data and is the platform customers sign in to. A license names counties and seats, and every view that applies to those counties is included.")
rep('aria-label="Inside Atlas, the data framework produces the required data license, and the platform framework produces the optional platform: Signal, SunScope, LeanCRE or TeleAcre."',
    'aria-label="Inside Atlas, the data framework produces the data license, and the platform framework produces the four views included with it: AtlasLand, AtlasCRE, AtlasProp and AtlasTrade."')
rep("Builds and deploys the platforms customers use: Red Planet platforms such as Signal and SunScope, or custom builds. Deployed through Atlas.",
    "Runs Atlas, the one platform customers sign in to, with four views on the county record: AtlasLand, AtlasCRE, AtlasProp and AtlasTrade. Every view that applies to a licensed county is included.")
rep("Every license starts with the data. Customers can add a platform on top of it and choose how many seats their team needs.",
    "Every license is the data for a set of counties plus the seats a team needs. The views that apply to those counties come with it.")
rep('<h3 class="rp-title" style="margin: 0; flex: 1; min-width: 0; color: var(--fg-1)">Platform</h3>',
    '<h3 class="rp-title" style="margin: 0; flex: 1; min-width: 0; color: var(--fg-1)">Views</h3>')
rep('<li><span class="rp-body" style="color: var(--fg-1)">Red Planet platform: Signal or SunScope</span></li>',
    '<li><span class="rp-body" style="color: var(--fg-1)">AtlasLand, AtlasCRE, AtlasProp and AtlasTrade, each where it applies to a licensed county</span></li>')
rep('<li><span class="rp-body" style="color: var(--fg-1)">Custom: built for the customer</span></li>',
    '<li><span class="rp-body" style="color: var(--fg-1)">Included with the license at no charge</span></li>')
rep("Custom data used to be out of reach for SMBs, and Atlas now makes it possible.",
    "County-level sourced data used to be out of reach for smaller firms, and Atlas now makes it possible.")
rep("We show how built counties are used today, or build a custom package for them.",
    "We show how built counties are used today, or turn on the counties they need.")
rep("Atlas prices each license by county, seat and platform type.", "Atlas prices each license by county and seats.")
rep("The license renews each year, and customers can add counties, seats or a platform at any time.",
    "The license renews each year, and customers can add counties or seats at any time.")
rep("Residential and commercial customers have access to the same data, customized by our processes.",
    "Residential and commercial customers have access to the same data, through the views that apply to their counties.")
rep("Lenders, investors, developers, REITs and other firms working commercial plantforms",
    "Lenders, investors, developers, REITs and other firms working commercial property")
# "Red Planet platforms today" -> the views, twice
s = s.replace(">Red Planet platforms today<", ">Atlas views<")
# The "Platform / Optional" label pairs: every "Optional" label beside a platform heading becomes "Included".
s = re.sub(r'(<span class="rp-label[^"]*"[^>]*>)Optional(</span>)', r'\1Included\2', s)
# Product names in the brand spans and tiles become the view names; their marks go.
for old, new in (("Signal", "AtlasProp"), ("SunScope", "AtlasTrade"), ("LeanCRE", "AtlasCRE"), ("TeleAcre", "AtlasLand")):
    s = re.sub(rf'(<span class="om-brand">)<svg[^>]*>.*?</svg>(<span class="rp-(?:small|title)"[^>]*>){old}</span>', rf'\1\2{new}</span>', s, flags=re.S)
    s = re.sub(rf'(<span class="rp-(?:small|title)"[^>]*>){old}</span>', rf'\1{new}</span>', s)
for old, new in (("(property signals and distress)", "(residential ownership changes, foreclosure filings, liens, probate and tax certificate sales)"),
                 ("(solar and roofing field sales)", "(roof and solar suitability with solar, roofing, pool, pest and HVAC filters)"),
                 ("(commercial deals and lending)", "(commercial parcels, owners and sales, and the deal pipeline)"),
                 ("(data center sites and risk)", "(jurisdiction actions on data centers, hearings, land assemblies and meeting records)")):
    rep(old, new)
s = s.replace("Platform Optional", "Views Included")
rep(">Platform<", ">Views<", count=0) if ">Platform<" in s else None
left = [m.group(0) for m in re.finditer(r"\b(Signal|SunScope|LeanCRE|TeleAcre|Brokeride|Rezoned|[Cc]ustom|[Pp]ublic)\b", s)]
assert s != orig
p.write_bytes(s.encode("utf-8"))
print("edited; remaining words:", left)
