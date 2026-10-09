import { NextResponse } from "next/server";
import { getPublicRecords, RECORDS_REVALIDATE } from "@/lib/records-ledger";

export const runtime = "nodejs";
export const revalidate = RECORDS_REVALIDATE;

// The public read-only endpoint behind the homepage record card. It returns
// ONLY the figures that card shows, from the Atlas records ledger that Mission
// Control's headline reads (atlas_records_headline, atlas_records_ledger_days,
// atlas_records_last_night) -- see lib/records-ledger.ts.
//
// It used to return the whole internal getAtlasLive() payload, which published
// active_sources, runners_total and a per-source ingest feed (source-level
// jurisdictions and row counts) on an unauthenticated endpoint. Those are
// infrastructure figures and they do not belong on a public surface -- see
// atlas/docs/CONTEXT.md, "Infrastructure spend and storage figures are
// internal only and never appear in external material." Nothing on the
// homepage consumed them.
//
// Never add spend, ceilings, storage utilisation, source or runner counts, run
// success/failure counts, per-source detail, work in progress, anomaly or
// close-check figures, or the reason recorded for a day whose count did not
// match, to this response.
export async function GET() {
  try {
    const records = await getPublicRecords();
    if (!records) {
      return NextResponse.json(
        { error: "Live data temporarily unavailable." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        records_held: records.recordsHeld,
        live: records.live,
        archived: records.archived,
        // The day all three figures above describe, and when that count ran --
        // what the card's "N ago" label reflects.
        as_of: records.asOf,
        count_taken_at: records.countTakenAt,
        last_night_new: records.lastNightNew,
        history: records.history.map((p) => ({ day: p.day, total: p.total })),
      },
      { headers: { "cache-control": "public, max-age=300" } }
    );
  } catch (err) {
    console.error("/api/atlas-live error:", err);
    return NextResponse.json(
      { error: "Live data temporarily unavailable." },
      { status: 503 }
    );
  }
}
