import "server-only";

// The record figures on the homepage card, read from Atlas's RECORDS LEDGER --
// the same objects Mission Control's headline reads.
//
// WHAT WENT WRONG BEFORE (RECORDS-5, 2026-10-09). HOMEPAGE-1 wired this card to
// atlas_public_record_stats / atlas_public_record_history, whose headline was
// "records live in Postgres" and whose series plotted that live count day by
// day. Atlas moves records to verified cold storage on AWS, and every move
// lowers the live count without a single record leaving Atlas's custody -- so
// the public chart showed losses that never happened (the 2026-09-29/30 sweep
// moved 242.3M rows out of Postgres and the homepage line fell off a cliff).
//
// NOW. The ledger counts each record ONCE wherever it lives, so a move between
// live and archived shifts the two halves of the subline and leaves the
// headline alone. Its daily history has also been restated, so the series is
// what Atlas held on each day rather than what happened to be in Postgres that
// night.
//
//   headline            atlas_records_headline.records_held (what Mission
//                       Control headlines), with .as_of naming the day it
//                       describes and .closed_at saying when that count ran
//   live / archived     atlas_records_ledger_days.measured_live /
//                       measured_stored FOR THE HEADLINE'S OWN DAY, so the two
//                       halves add up to the headline exactly. Taking them from
//                       the newest ledger row instead would not: a day that has
//                       not passed its count check yet is not published, and
//                       the headline stays on the last day that did.
//   30-day chart        the same table's closing_total for the 30 days ending
//                       on that day
//   Latest Update       atlas_records_last_night.new_records
//
// PUBLIC SURFACE. This file is the whole read path for a page anyone can load,
// so it selects COLUMNS, never "*", and returns only the fields the card
// renders. The ledger views carry plenty that must never reach a public page:
// work in progress, per-source counts, anomaly counts, close status, the
// tolerance and difference of a day's count check and the prose reason recorded
// for a day that did not match. Do not add any of them here, and do not add
// spend or storage figures -- see atlas/docs/CONTEXT.md, "Infrastructure spend
// and storage figures are internal only and never appear in external material."
//
// CACHING. A plain fetch with `next: { revalidate }`, deliberately not
// unstable_cache: the old path's Data Cache entry pinned for five days while
// the page beside it read live. On top of that, a successful read is kept in
// `lastGood` and served if a later read fails, because Atlas restates this
// ledger in place and briefly drops and recreates these views while it does.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Seconds between re-reads. The nightly close lands once a day; this is 5 minutes. */
export const RECORDS_REVALIDATE = 300;

/** Days of history the chart draws. */
const HISTORY_DAYS = 30;

/**
 * Ledger rows fetched. More than HISTORY_DAYS because the headline's day is not
 * always the newest row -- a day under review is not published, and the
 * headline holds on the last day that was -- and the window has to end on the
 * headline's day for the chart's last point to equal the headline.
 */
const DAY_LOOKBACK = 60;

export type RecordsHistoryPoint = { day: string; total: number };

export type PublicRecords = {
  /** Records Atlas holds, live and archived together. The headline number. */
  recordsHeld: number;
  /** The live half of the headline. */
  live: number;
  /** The archived half. live + archived === recordsHeld, exactly. */
  archived: number;
  /** "YYYY-MM-DD" -- the day all three figures above describe. */
  asOf: string;
  /** When that count was taken. This is what the card's "N ago" label reflects. */
  countTakenAt: string | null;
  /** Last night's new records, or null when the ledger has no figure. */
  lastNightNew: number | null;
  /** Records held on each of the HISTORY_DAYS days ending on asOf. */
  history: RecordsHistoryPoint[];
};

type HeadlineRow = {
  records_held: number | string | null;
  as_of: string | null;
  closed_at: string | null;
};

type DayRow = {
  ledger_date: string | null;
  closing_total: number | string | null;
  measured_live: number | string | null;
  measured_stored: number | string | null;
};

type NightRow = { new_records: number | string | null };

function num(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

async function readView<T>(path: string, attempt = 0): Promise<T[] | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: RECORDS_REVALIDATE },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T[];
  } catch (err) {
    // One retry, short: a restatement pass drops and recreates these views, and
    // the gap is a fraction of a second.
    if (attempt === 0) {
      await new Promise((r) => setTimeout(r, 400));
      return readView<T>(path, attempt + 1);
    }
    console.error(`records-ledger: ${path} failed:`, err);
    return null;
  }
}

/**
 * The last reading that passed every check below, kept so a failed read serves
 * the last good figures rather than an error or an invented placeholder. Its
 * own asOf and countTakenAt travel with it, so the card goes on saying which
 * day it describes and the "N ago" label grows to admit the staleness.
 */
let lastGood: PublicRecords | null = null;

function assemble(
  headline: HeadlineRow | undefined,
  dayRows: DayRow[] | null,
  night: NightRow | undefined
): PublicRecords | null {
  const held = num(headline?.records_held);
  const asOf = headline?.as_of ?? null;
  // A zero or missing headline is a failed read far more often than a real
  // value, and a public page must not publish a figure nobody measured.
  if (held == null || held <= 0 || !asOf) return null;

  const days = (dayRows ?? [])
    .map((r) => ({
      day: typeof r.ledger_date === "string" ? r.ledger_date : "",
      total: num(r.closing_total) ?? 0,
      live: num(r.measured_live),
      stored: num(r.measured_stored),
    }))
    .filter((d) => d.day !== "" && d.day <= asOf && d.total > 0)
    .sort((a, b) => a.day.localeCompare(b.day));

  const headDay = days.find((d) => d.day === asOf);
  if (!headDay || headDay.live == null || headDay.stored == null) return null;
  // The subline has to add up to the headline on screen. If the split and the
  // headline disagree they came from different measurements, and showing them
  // side by side would publish an arithmetic error -- report unavailable and
  // let the last good reading stand instead.
  if (headDay.live + headDay.stored !== held) return null;

  const history = days
    .slice(-HISTORY_DAYS)
    .map((d) => ({ day: d.day, total: d.total }));
  // The chart needs two points to draw a line at all.
  if (history.length < 2) return null;

  return {
    recordsHeld: held,
    live: headDay.live,
    archived: headDay.stored,
    asOf,
    countTakenAt: headline?.closed_at ?? null,
    lastNightNew: num(night?.new_records),
    history,
  };
}

export async function getPublicRecords(): Promise<PublicRecords | null> {
  const [headlineRows, dayRows, nightRows] = await Promise.all([
    readView<HeadlineRow>(
      "atlas_records_headline?select=records_held,as_of,closed_at"
    ),
    readView<DayRow>(
      "atlas_records_ledger_days" +
        "?select=ledger_date,closing_total,measured_live,measured_stored" +
        `&order=ledger_date.desc&limit=${DAY_LOOKBACK}`
    ),
    readView<NightRow>("atlas_records_last_night?select=new_records"),
  ]);

  const fresh = assemble(headlineRows?.[0], dayRows, nightRows?.[0]);
  if (fresh) {
    lastGood = fresh;
    return fresh;
  }
  return lastGood;
}
