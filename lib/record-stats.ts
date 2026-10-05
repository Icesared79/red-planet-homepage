import "server-only";

// The record figures on the homepage card, read from the SAME source of truth
// Mission Control uses.
//
// WHAT WENT WRONG BEFORE. The card's headline read
// `atlas_verified_record_count` (SINGULAR) via lib/atlas-live.ts. That view
// returns `ORDER BY total_records DESC, snapshot_date DESC LIMIT 1` over a
// rolling 7 days of atlas_daily_snapshots -- the HIGH-WATER MARK of the last
// week, not the current count -- on an all-tables basis, where Mission
// Control's "verified records" is external-ingest only. The 2026-09-29/30
// cold-storage sweep moved 242.3M rows out of Postgres, which pinned the
// homepage to the pre-sweep 2026-09-28 peak of 515,605,877 against a live
// total of 420,508,187. Everything else on the card -- archived, all-time, the
// nightly delta, the 30-day series and its axis labels -- was never wired to
// data at all; they were constants captured when the card was designed, which
// is why the card appeared to stop on 2026-09-26.
//
// NOW. Both reads hit `atlas_public_record_stats` and
// `atlas_public_record_history` (atlas migration 20261005214000), views that
// derive every figure at read time from the objects Mission Control reads --
// atlas_verified_record_counts, atlas_stored_record_segments, atlas_run_ledger
// and atlas_daily_snapshots. They hold no counts of their own, so the two
// surfaces cannot drift apart unless the shared base moves, which moves both.
//
// CACHING. Deliberately NOT unstable_cache. The old path wrapped its read in
// unstable_cache(["atlas-live-v9"]) and the Data Cache entry pinned: on
// 2026-10-05 /api/atlas-live was still serving the payload it computed at
// 2026-09-30T01:03 while the page beside it read live. A plain fetch with
// `next: { revalidate }` is a cache Next re-reads on a timer and cannot pin to
// a weeks-old entry. 300s is far inside the once-a-night ingest cadence.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Seconds between re-reads. The ingest lands once a night; this is 5 minutes. */
export const RECORD_STATS_REVALIDATE = 300;

export type RecordStats = {
  /** Live in Postgres, external-ingest only. The headline number. */
  verifiedRecords: number;
  /** Rows held in verified cold storage. The "archived" half of the subline. */
  storedRecords: number;
  /** verified + stored. All-time custody. */
  totalRecords: number;
  /** Last night's measured ingest, or null when the ledger has no counts. */
  latestIngest: number | null;
  /** When the most recent run in that window started. */
  latestIngestAt: string | null;
  /**
   * When the displayed counts were last RECOMPUTED -- not when this page was
   * rendered or fetched. This is what the "N hours ago" label must reflect.
   */
  dataAsOf: string | null;
};

export type RecordHistoryPoint = { day: string; total: number };

async function readView<T>(path: string): Promise<T[] | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: RECORD_STATS_REVALIDATE },
    });
    if (!res.ok) {
      console.error(`record-stats: ${path} -> HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`record-stats: ${path} failed:`, err);
    return null;
  }
}

type StatsRow = {
  verified_records: number | string | null;
  stored_records: number | string | null;
  total_records: number | string | null;
  latest_ingest: number | string | null;
  latest_ingest_at: string | null;
  data_as_of: string | null;
};

function num(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function getRecordStats(): Promise<RecordStats | null> {
  const rows = await readView<StatsRow>("atlas_public_record_stats?select=*");
  const row = rows?.[0];
  if (!row) return null;
  const verified = num(row.verified_records);
  const stored = num(row.stored_records);
  const total = num(row.total_records);
  // A zero or missing verified total is a failed read far more often than a
  // real value. Report unavailable rather than publishing a wrong headline.
  if (verified == null || verified <= 0) return null;
  if (stored == null || stored <= 0) return null;
  return {
    verifiedRecords: verified,
    storedRecords: stored,
    totalRecords: total != null && total > 0 ? total : verified + stored,
    latestIngest: num(row.latest_ingest),
    latestIngestAt: row.latest_ingest_at ?? null,
    dataAsOf: row.data_as_of ?? null,
  };
}

export async function getRecordHistory(): Promise<RecordHistoryPoint[]> {
  const rows = await readView<{ day: string; total_records: number | string }>(
    "atlas_public_record_history?select=day,total_records&order=day.asc"
  );
  if (!rows) return [];
  return rows
    .map((r) => ({ day: r.day, total: num(r.total_records) ?? 0 }))
    .filter((p) => typeof p.day === "string" && p.total > 0);
}
