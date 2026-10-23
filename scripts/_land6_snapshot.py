"""LAND-6 (2026-10-23): the dated snapshots behind the company page and the three view pages on redplanetdata.com.

    C:/Users/Atlas/Levelpie/atlas/venv/Scripts/python.exe scripts/_land6_snapshot.py [--out-dir public/data] [--as-of YYYY-MM-DD]
        [--atlas-dash <checkout>] [--atlas <checkout>] [--skip national|cre|prop|trade ...]

Same pattern as Levelpie atlas/ops/_land52_wilson_snapshot.py (the AtlasLand page's snapshot): every figure a page shows
is read here, once, into a dated JSON file under public/data, and the page builder (scripts/_land6_site_pages.tsx)
reads the newest file and nothing else. Four files:

    national-map-<as_of>.json              every current county in the County Catalog as finished SVG paths under the
                                           catalog's own national projection, with its score and shade class
                                           (atlas-dash scripts/_land6_site_export.ts national)
    broward-county-fl-commercial-<as_of>.json   the County Catalog report for Broward County, FL (region map, charts,
                                           neighbors, "what we found" in the commercial property record over the last
                                           90 days: atlas-dash scripts/_land53_county_report_export.ts), plus the
                                           number of commercial properties in the record
    broward-county-fl-residential-<as_of>.json  the residential county report for Broward (households, income, home
                                           sales and foreclosure charts, housing map, residential "what we found":
                                           atlas-dash scripts/_land6_site_export.ts residential)
    capitol-region-ct-trade-<as_of>.json   the residential report for the Capitol Planning Region, CT (greater
                                           Hartford) plus the trade figures AtlasTrade filters on, counted here from
                                           the SunScope map points by town through the catalog's CT crosswalk

Why these counties (measured 2026-10-23, production reads under the 60-second statement timeout): Broward is the one
Florida scope whose commercial sales, loans, liens and court filings are all current to 2026-10-20 (every other scope
is missing or stale on at least one), and it holds the most residential filings in the last twelve months (2,238
foreclosure filings and 14,550 liens); the Capitol Region holds the most SunScope map points of the nine Connecticut
planning regions (318,671 homes across 38 towns). No customer is named anywhere.

Reads: the node exporters go through atlas-dash's read-only pool (5-second statement timeout); the Python reads go
through Levelpie atlas lib/workshop_db.connect_for, which reads the workshop copy when one exists and otherwise
production with statement_timeout = 60s already set, and each file records the banner of the source it used. Nothing
writes to the database. SUPABASE_DB_URL comes from this process's environment (an interactive worktree has the admin
env; a plain shell can export it from C:/atlas-secrets/.env.admin).
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

CRE_FIPS = "12011"       # Broward County, Florida: commercial scope FL/16
CRE_SCOPE = ("FL", "16")
PROP_FIPS = "12011"      # Broward County, Florida
TRADE_FIPS = "09110"     # Capitol Planning Region, Connecticut (greater Hartford)

HERE = Path(__file__).resolve().parent.parent


def run_node(atlas_dash: Path, script: str, args: list[str]) -> dict:
    s = atlas_dash / "scripts" / script
    if not s.exists():
        raise SystemExit(f"exporter not found at {s}; pass --atlas-dash")
    if not os.environ.get("SUPABASE_DB_URL"):
        raise SystemExit("SUPABASE_DB_URL is not set; the exporters need it")
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "out.json"
        cmd = ["node", f"--env-file={atlas_dash / '.env.local'}", "--import", "tsx", "--conditions=react-server", str(s), *args, "--out", str(out)]
        env = {**os.environ, "TSX_TSCONFIG_PATH": str(atlas_dash / "scripts" / "tsconfig.land53.json")}
        r = subprocess.run(cmd, cwd=str(atlas_dash), env=env, capture_output=True, text=True, shell=(os.name == "nt"))
        if r.returncode != 0:
            raise SystemExit(f"{script} failed ({r.returncode}):\n{r.stderr[-3000:]}")
        print("  " + (r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "exported"), file=sys.stderr)
        return json.loads(out.read_text(encoding="utf-8"))


def db(atlas: Path):
    sys.path.insert(0, str(atlas))
    from lib.workshop_db import connect_for  # noqa: WPS433 (the atlas helper decides workshop or production)
    return connect_for


def one(connect_for, table: str, sql: str, args: tuple = ()) -> tuple[dict, str]:
    src = connect_for(table)
    banner = src.banner()
    print("  " + banner, file=sys.stderr)
    with src.conn.cursor() as cur:
        cur.execute(sql, args)
        cols = [d[0] for d in cur.description]
        row = cur.fetchone()
    src.close()
    return dict(zip(cols, row)), banner


def write(path: Path, data: dict) -> None:
    text = json.dumps(data, indent=1, ensure_ascii=False, default=str) + "\n"
    path.write_text(text, encoding="utf-8")
    print(f"wrote {path} ({len(text.encode('utf-8')):,} bytes)", file=sys.stderr)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", default=str(HERE / "public" / "data"))
    ap.add_argument("--as-of", default=None, help="YYYY-MM-DD; default today on this host (ET)")
    ap.add_argument("--atlas-dash", default=str(Path.home() / "atlas-dashboard"))
    ap.add_argument("--atlas", default=str(Path.home() / "Levelpie" / "atlas"))
    ap.add_argument("--skip", nargs="*", default=[], choices=["national", "cre", "prop", "trade"])
    a = ap.parse_args()
    as_of = a.as_of or datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d")
    out_dir = Path(a.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    atlas_dash = Path(a.atlas_dash)
    connect_for = db(Path(a.atlas))
    taken = datetime.now(ZoneInfo("America/New_York")).isoformat(timespec="seconds")

    if "national" not in a.skip:
        print("national map", file=sys.stderr)
        nat = run_node(atlas_dash, "_land6_site_export.ts", ["national"])
        write(out_dir / f"national-map-{as_of}.json", {"as_of": as_of, "taken_at": taken, **nat})

    if "cre" not in a.skip:
        print("AtlasCRE: Broward County, FL", file=sys.stderr)
        rep = run_node(atlas_dash, "_land53_county_report_export.ts", [CRE_FIPS])
        props, banner = one(connect_for, "atlas_commercial_property",
                            "SELECT count(*) AS properties, count(DISTINCT entity_key) AS owner_entities FROM atlas_commercial_property WHERE state = %s AND scope_key = %s", CRE_SCOPE)
        write(out_dir / f"broward-county-fl-commercial-{as_of}.json", {
            "as_of": as_of, "taken_at": taken, "view": "AtlasCRE",
            "commercial_record": {"state": CRE_SCOPE[0], "scope_key": CRE_SCOPE[1], **{k: int(v) for k, v in props.items()}, "source": banner},
            **rep,
        })

    if "prop" not in a.skip:
        print("AtlasProp: Broward County, FL", file=sys.stderr)
        rep = run_node(atlas_dash, "_land6_site_export.ts", ["residential", PROP_FIPS])
        write(out_dir / f"broward-county-fl-residential-{as_of}.json", {"as_of": as_of, "taken_at": taken, "view": "AtlasProp", **rep})

    if "trade" not in a.skip:
        print("AtlasTrade: Capitol Planning Region, CT", file=sys.stderr)
        rep = run_node(atlas_dash, "_land6_site_export.ts", ["residential", TRADE_FIPS])
        # The SunScope map points are keyed by town; the catalog's crosswalk maps each Connecticut town to its planning
        # region. Roof windows and the new-owner flag are the fields AtlasTrade's roofing and ownership filters read.
        trade, banner = one(connect_for, "atlas_sunscope_map_points", """
            SELECT count(*) AS homes,
                   count(*) FILTER (WHERE p.is_single_family) AS single_family,
                   count(*) FILTER (WHERE p.roof_replacement_window = 'over_25') AS roof_over_25,
                   count(*) FILTER (WHERE p.roof_replacement_window = 'prime_20_25') AS roof_prime_20_25,
                   count(*) FILTER (WHERE p.roof_replacement_window = 'recently_replaced') AS roof_recently_replaced,
                   count(*) FILTER (WHERE p.new_owner_flag) AS new_owners,
                   count(DISTINCT p.town) AS towns
              FROM atlas_sunscope_map_points p
              JOIN atlas_county_catalog_ct_crosswalk x
                ON lower(regexp_replace(x.town_name, ' (town|city|borough)$', '')) = lower(p.town)
             WHERE x.region_fips = %s""", (TRADE_FIPS,))
        write(out_dir / f"capitol-region-ct-trade-{as_of}.json", {
            "as_of": as_of, "taken_at": taken, "view": "AtlasTrade",
            "trade": {"region_fips": TRADE_FIPS, **{k: int(v) for k, v in trade.items()}, "source": banner,
                      "filters": ["solar", "roofing", "pool", "pest", "HVAC"]},
            **rep,
        })
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
