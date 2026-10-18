import { NextResponse } from "next/server";
import { cleanFips, quoteIndividual } from "@/lib/licensing";

// COUNTY-4.2: the live individual-license price for the counties picked on /licensing. Priced by the catalog
// (atlas_county_catalog_quote_individual) on every call; this route only narrows the input and the output.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const fips = cleanFips(new URL(request.url).searchParams.get("fips") ?? "");
  if (!fips.length) return NextResponse.json({ lines: [], total_low: 0, total_high: 0, discounts: [] });
  try {
    const q = await quoteIndividual(fips);
    if (!q) return NextResponse.json({ error: "Prices are not available right now." }, { status: 503 });
    const lines = q.lines
      .filter((l) => l.available && (l.state === "CT" || l.state === "FL"))
      .map((l) => ({ fips: l.fips, name: l.name, low: Number(l.price_low), high: Number(l.price_high) }));
    const discounts: Array<{ label: string; low: number; high: number }> = [];
    if (Number(q.state_discount_high) > 0) {
      discounts.push({
        label: `Whole-state discount, ${q.state_discount_pct}% off ${q.state_discount_counties} counties`,
        low: Number(q.state_discount_low), high: Number(q.state_discount_high),
      });
    }
    if (Number(q.bundle_discount_high) > 0) {
      discounts.push({
        label: `Multi-county discount, ${q.bundle_discount_pct}% off ${q.bundle_discount_counties} counties`,
        low: Number(q.bundle_discount_low), high: Number(q.bundle_discount_high),
      });
    }
    return NextResponse.json(
      { lines, discounts, total_low: Number(q.total_low), total_high: Number(q.total_high) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    console.error("[licensing price]", e);
    return NextResponse.json({ error: "Prices are not available right now." }, { status: 503 });
  }
}
