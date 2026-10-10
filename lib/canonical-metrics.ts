import "server-only";

// The two headline counts a job posting is allowed to state, read from the SAME
// canonical objects the docs site's snapshot is built from, so redplanetdata.com
// and docs.redplanetdata.com cannot show different numbers.
//
//   records held     atlas_records_headline.records_held -- the records ledger's
//                    daily close. This is what atlas's canonical metrics module
//                    returns from records_held() (runners/canonical_metrics.py),
//                    which is what redplanet-docs-site's
//                    scripts/build_atlas_snapshot.py writes into
//                    data/atlas-snapshot.json as `records_held` and
//                    lib/metrics.ts serves to the docs pages. Same view, same
//                    figure. lib/records-ledger.ts reads it for the homepage
//                    record card.
//
//   active sources   atlas_stats_cache['active_sources_total'] -- the maintained
//                    figure every Red Planet surface reads, mirroring
//                    atlas_source_registry.status = 'active'. The docs snapshot
//                    reads this exact key (build_atlas_snapshot.py, secondary()),
//                    and so does lib/atlas-live.ts here.
//
// ROUNDED DOWN, ALWAYS. A posting says "more than 780 million" and "over 319
// sources", so both figures are floored: the sentence understates what Atlas
// holds and can never overstate it. Records are floored to whole millions.
//
// NO PLACEHOLDER EVER. A posting may not publish a count nobody measured. A
// successful read is kept in `lastGood` and served if a later read fails; with
// no reading at all the page render throws, and Next's ISR goes on serving the
// last good render. That is the same rule lib/records-ledger.ts follows and the
// reason neither file carries a constant fallback.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Seconds between re-reads. The ledger closes once a day; this is 5 minutes. */
export const METRICS_REVALIDATE = 300;

export type CanonicalCounts = {
  /** Records Atlas holds, floored to whole millions. "more than N million". */
  recordsMillions: number;
  /** Active sources, the maintained canonical count. "over N sources". */
  sources: number;
  /** "YYYY-MM-DD" -- the day the record figure describes. */
  asOf: string;
};

type HeadlineRow = {
  records_held: number | string | null;
  as_of: string | null;
};

type StatsRow = { value: number | string | null };

async function readRest<T>(path: string): Promise<T[] | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: METRICS_REVALIDATE },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`canonical-metrics: ${path} failed:`, err);
    return null;
  }
}

let lastGood: CanonicalCounts | null = null;

export async function getCanonicalCounts(): Promise<CanonicalCounts | null> {
  const [headlineRows, statsRows] = await Promise.all([
    readRest<HeadlineRow>("atlas_records_headline?select=records_held,as_of"),
    readRest<StatsRow>(
      "atlas_stats_cache?select=value&key=eq.active_sources_total"
    ),
  ]);

  const held = Number(headlineRows?.[0]?.records_held);
  const asOf = headlineRows?.[0]?.as_of ?? null;
  // The value column is jsonb on some rows, so it can arrive quoted.
  const rawSources = statsRows?.[0]?.value;
  const sources = Number(
    typeof rawSources === "string" ? rawSources.replace(/"/g, "") : rawSources
  );

  const fresh =
    Number.isFinite(held) &&
    held >= 1_000_000 &&
    !!asOf &&
    Number.isFinite(sources) &&
    sources > 0
      ? {
          recordsMillions: Math.floor(held / 1_000_000),
          sources: Math.floor(sources),
          asOf: asOf as string,
        }
      : null;

  if (fresh) {
    lastGood = fresh;
    return fresh;
  }
  return lastGood;
}
