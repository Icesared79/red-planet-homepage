import { NextResponse } from "next/server";
import {
  getRecordHistory,
  getRecordStats,
  RECORD_STATS_REVALIDATE,
} from "@/lib/record-stats";

export const runtime = "nodejs";
export const revalidate = RECORD_STATS_REVALIDATE;

// The public read-only endpoint behind the homepage record card. It returns
// ONLY the figures that card shows, from the same views Mission Control's
// numbers come from (atlas_public_record_stats / atlas_public_record_history).
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
// success/failure counts, or per-source detail to this response.
export async function GET() {
  try {
    const [stats, history] = await Promise.all([
      getRecordStats(),
      getRecordHistory(),
    ]);
    if (!stats) {
      return NextResponse.json(
        { error: "Live data temporarily unavailable." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        verified_records: stats.verifiedRecords,
        stored_records: stats.storedRecords,
        total_records: stats.totalRecords,
        latest_ingest: stats.latestIngest,
        // The real data timestamp -- what the card's "N ago" label reflects.
        data_as_of: stats.dataAsOf,
        history: history.map((p) => ({ day: p.day, total: p.total })),
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
