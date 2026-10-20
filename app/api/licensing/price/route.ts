import { NextResponse } from "next/server";
import { cleanFips, quoteFirm, quoteIndividual } from "@/lib/licensing";

// COUNTY-4.2: the live price for the counties picked on /licensing. Priced by the catalog on every call
// (atlas_county_catalog_quote_individual, or COUNTY-9's firm option atlas_county_catalog_quote_residential, the function
// the County Catalog's quote tool prices with); this route only narrows the input and the output.
//
//   ?fips=09110,09120             an individual license
//   ?fips=09110,09120&seats=50     a firm license for that many people (rounded up to the catalog's steps)
//
// Each line is one county: for a firm, its license plus the people added beyond those included (low/high), with the
// added part also given on its own so the page can say what it is for.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Line = { fips: string; name: string; low: number; high: number; addedLow: number; addedHigh: number };
type Discount = { label: string; low: number; high: number };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const fips = cleanFips(params.get("fips") ?? "");
  const seatsIn = Number(params.get("seats") ?? "");
  const firm = Number.isFinite(seatsIn) && seatsIn > 0;
  if (!fips.length) return NextResponse.json({ lines: [], total_low: 0, total_high: 0, discounts: [] });
  try {
    const ok = (l: { available: boolean; state: string }) => l.available && (l.state === "CT" || l.state === "FL");
    const discounts: Discount[] = [];
    let lines: Line[] = [];
    let totalLow = 0;
    let totalHigh = 0;
    let seats: number | null = null;
    if (firm) {
      const q = await quoteFirm(fips, Math.min(100000, Math.ceil(seatsIn)));
      if (!q) return NextResponse.json({ error: "Prices are not available right now." }, { status: 503 });
      lines = q.lines.filter(ok).map((l) => ({
        fips: l.fips, name: l.name,
        low: Number(l.price_low) + Number(l.seat_low ?? 0), high: Number(l.price_high) + Number(l.seat_high ?? 0),
        addedLow: Number(l.seat_low ?? 0), addedHigh: Number(l.seat_high ?? 0),
      }));
      if (Number(q.state_discount_high) > 0) {
        discounts.push({ label: `Whole-state discount, ${q.state_discount_pct}% off`, low: Number(q.state_discount_low), high: Number(q.state_discount_high) });
      }
      if (Number(q.bundle_discount_high) > 0) {
        discounts.push({ label: `Multi-county discount, ${q.bundle_discount_pct}% off`, low: Number(q.bundle_discount_low), high: Number(q.bundle_discount_high) });
      }
      totalLow = Number(q.total_low);
      totalHigh = Number(q.total_high);
      seats = Number(q.seats);
    } else {
      const q = await quoteIndividual(fips);
      if (!q) return NextResponse.json({ error: "Prices are not available right now." }, { status: 503 });
      lines = q.lines.filter(ok).map((l) => ({ fips: l.fips, name: l.name, low: Number(l.price_low), high: Number(l.price_high), addedLow: 0, addedHigh: 0 }));
      if (Number(q.state_discount_high) > 0) {
        discounts.push({ label: `Whole-state discount, ${q.state_discount_pct}% off`, low: Number(q.state_discount_low), high: Number(q.state_discount_high) });
      }
      if (Number(q.bundle_discount_high) > 0) {
        discounts.push({ label: `Multi-county discount, ${q.bundle_discount_pct}% off`, low: Number(q.bundle_discount_low), high: Number(q.bundle_discount_high) });
      }
      totalLow = Number(q.total_low);
      totalHigh = Number(q.total_high);
    }
    return NextResponse.json(
      { lines, discounts, total_low: totalLow, total_high: totalHigh, seats },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    console.error("[licensing price]", e);
    return NextResponse.json({ error: "Prices are not available right now." }, { status: 503 });
  }
}
