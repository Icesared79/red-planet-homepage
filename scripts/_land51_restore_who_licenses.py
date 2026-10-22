"""LAND-5.1 (2026-10-22): put back § 02 "Who Licenses It" on public/how-red-planet-works.html.

LAND-1's copy script (317ea46) deleted the § 02 section head and the residential column along with the platform marks,
so the page ran § 01, § 03, § 04, § 05, the commercial column and the closing bar were left inside § 01, and the Views
box held a stray small "AtlasProp" plus the AtlasProp and AtlasTrade lines. This rebuilds § 02 with the structure of
a2a5753 (the last whole version): residential and commercial columns, each with its Atlas views, and the closing bar.
The Views box in § 01 names the four views, as the Platform box once named the four platforms. Run once from the
homepage worktree root after `git fetch`; every extraction asserts what it found.
"""
import re
import subprocess
from pathlib import Path

PAGE = Path("public/how-red-planet-works.html")
src = PAGE.read_text(encoding="utf-8").replace("\r\n", "\n")
old = subprocess.run(
    ["git", "show", "a2a5753:public/how-red-planet-works.html"], capture_output=True, check=True, encoding="utf-8"
).stdout.replace("\r\n", "\n")

assert "§ 02" not in src, "§ 02 is already on the page"

start = src.index('<div class="om-out om-out--opt om-o6">\n')
end = src.index("</div></section>", start) + len("</div></section>")
seg = src[start:end]


def one(pattern, text, flags=re.S):
    found = re.findall(pattern, text, flags)
    assert len(found) == 1, f"expected one match for {pattern[:60]!r}, got {len(found)}"
    return found[0]


views_row = one(r'<div class="om-row">[^\n]*?>Views</span><span class="om-pill om-pill--opt">Included</span></div>', seg)
prop_desc = one(r'>AtlasProp</span></span>(<span class="rp-small"[^>]*>\(residential[^<]*</span>)', seg)
trade_tile = one(r'<div class="om-tile"[^\n]*?>AtlasTrade</span>.*?</div>', seg)
commercial_col = one(r'(<div class="om-col">\n<div style="flex-grow: 1;.*?Commercial \(CRE\).*?<div class="om-stem om-wide-only" aria-hidden="true" style="height: 40px"></div>\n</div>)', seg)
bar = one(r'(<div class="om-bar".*?</div>)\n', seg)
res_head = one(r'(<div class="om-layer-head">[^\n]*?>Residential Aligned</h3></div>)', old)

tile_open = '<div class="om-tile" style="background: var(--bg-raised); border-radius: var(--radius-sm); padding: 18px; display: flex; flex-direction: column; gap: 6px">'
prop_tile = f'{tile_open}<span class="om-brand"><span class="rp-title" style="color: var(--fg-1)">AtlasProp</span></span>{prop_desc}</div>'
names = "\n".join(
    f'<span class="om-brand"><span class="rp-small" style="color: var(--fg-1)">{v}</span></span>'
    for v in ("AtlasLand", "AtlasCRE", "AtlasProp", "AtlasTrade")
)

new_seg = f"""<div class="om-out om-out--opt om-o6">
{views_row}
<div style="display: flex; flex-wrap: wrap; gap: 10px 20px">
{names}
</div>
</div>
</div>
</div>
</div></section>

<section class="rp-section" style="background: transparent"><div class="rp-section__inner">
<div id="customers" class="om-head">
<div style="display: flex; flex-direction: column; gap: 16px">
<span class="rp-eyebrow rp-eyebrow--muted">§ 02</span>
<h2 class="rp-display-m" style="margin: 0; color: var(--fg-1)">Who Licenses It</h2>
</div>
<p class="rp-body-l" style="margin: 0; color: var(--fg-2)">Residential and commercial customers license the same county data, and the Atlas views that apply to their counties come with it.</p>
</div>
<div class="om-two">
<div class="om-col">
<div style="flex-grow: 1; background: var(--bg-sunken); border-radius: var(--radius-md); padding: var(--p); display: flex; flex-direction: column; gap: 14px">
{res_head}
<p class="rp-body" style="margin: 0; color: var(--fg-2)">Brokerages, agents, investors, installers and other vendors working residential customers</p>
<p class="rp-label" style="margin: 14px 0 0; padding-top: 14px; border-top: 1px solid var(--rule-ink)">Atlas views</p>
<div class="om-two" style="gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr))">
{prop_tile}
{trade_tile}
</div>
</div>
<div class="om-stem om-wide-only" aria-hidden="true" style="height: 40px"></div>
</div>
{commercial_col}
</div>
{bar}

</div></section>"""

out = src[:start] + new_seg + src[end:]
assert re.findall(r"§ 0\d", out) == ["§ 01", "§ 02", "§ 03", "§ 04", "§ 05"], re.findall(r"§ 0\d", out)
# The damaged page closed one <div> more than it opened; the restored one must balance.
for tag in ("div", "section", "span"):
    assert out.count(f"<{tag}") == out.count(f"</{tag}>"), f"{tag} unbalanced: {out.count(f'<{tag}')} open, {out.count(f'</{tag}>')} closed"
PAGE.write_text(out, encoding="utf-8", newline="\r\n")
print("restored § 02 on", PAGE)
