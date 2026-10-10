import "server-only";

import { getCanonicalCounts } from "@/lib/canonical-metrics";
import { parseQuestions, type Question } from "@/lib/jobs-screening";

// The read path behind /jobs and /jobs/[slug]. Postings are rows in
// public.job_postings, so adding one is an INSERT and never a deploy; this file
// holds no posting text, no screening question and no disqualifying answer.
//
// PUBLIC SURFACE. These pages are open to anyone, so this file selects COLUMNS,
// never "*", and returns only what a posting page renders. public.job_postings
// is read with the service role because RLS denies anon outright -- the same
// table is written by the apply route, and nothing about applications may be
// reachable from a browser.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Seconds between re-reads, so a new row appears without a deploy. */
export const JOBS_REVALIDATE = 300;

const POSTING_COLUMNS =
  "id,slug,title,status,location_text,employment_type,description,questions,posted_at";

export type PostingStatus = "open" | "closed";

export type Posting = {
  id: string;
  slug: string;
  title: string;
  status: PostingStatus;
  locationText: string;
  employmentType: string;
  /** Still carrying {records} / {sources}; renderDescription substitutes them. */
  description: string;
  questions: Question[];
  /** ISO timestamp. datePosted in the JobPosting structured data. */
  postedAt: string;
};

type Row = {
  id: string;
  slug: string;
  title: string;
  status: string;
  location_text: string;
  employment_type: string;
  description: string;
  questions: unknown;
  posted_at: string;
};

function toPosting(r: Row): Posting {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    status: r.status === "closed" ? "closed" : "open",
    locationText: r.location_text,
    employmentType: r.employment_type,
    description: r.description ?? "",
    questions: parseQuestions(r.questions),
    postedAt: r.posted_at,
  };
}

async function readRest<T>(path: string): Promise<T[] | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Accept: "application/json",
      },
      next: { revalidate: JOBS_REVALIDATE },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`jobs: ${path} failed:`, err);
    return null;
  }
}

/** Every open posting, soonest sort_order first. */
export async function getOpenPostings(): Promise<Posting[]> {
  const rows = await readRest<Row>(
    `job_postings?select=${POSTING_COLUMNS}` +
      "&status=eq.open&order=sort_order.asc,posted_at.desc"
  );
  return (rows ?? []).map(toPosting);
}

/**
 * One posting by slug, open or closed. A closed posting still renders -- a
 * link inside a LinkedIn post or an old email outlives the opening -- it just
 * loses its form and its structured data.
 */
export async function getPosting(slug: string): Promise<Posting | null> {
  const safe = encodeURIComponent(slug);
  const rows = await readRest<Row>(
    `job_postings?select=${POSTING_COLUMNS}&slug=eq.${safe}&limit=1`
  );
  const row = rows?.[0];
  return row ? toPosting(row) : null;
}

/* -------------------------------------------------------------------------- */
/* Description rendering                                                      */
/* -------------------------------------------------------------------------- */

export type Run = { text: string; href?: string };
export type Block =
  | { kind: "p"; runs: Run[] }
  | { kind: "ul"; items: Run[][] };

/** A bare Red Planet hostname in the copy becomes a working link. */
const HOST_RE = /(?:https?:\/\/)?((?:[a-z0-9-]+\.)+redplanetdata\.com)\b/gi;

function runs(line: string): Run[] {
  const out: Run[] = [];
  let at = 0;
  for (const m of line.matchAll(HOST_RE)) {
    const start = m.index ?? 0;
    if (start > at) out.push({ text: line.slice(at, start) });
    out.push({ text: m[1], href: `https://${m[1]}` });
    at = start + m[0].length;
  }
  if (at < line.length) out.push({ text: line.slice(at) });
  return out.length ? out : [{ text: line }];
}

/**
 * The posting description, as blocks ready to render.
 *
 * {records} and {sources} are filled from lib/canonical-metrics.ts -- the same
 * two canonical objects the docs site's snapshot is built from -- so the two
 * sites never disagree. A posting that uses either token and has no reading to
 * fill it with THROWS: no page on this site may publish a count nobody
 * measured, and Next's ISR goes on serving the last good render instead.
 */
export async function renderDescription(
  description: string
): Promise<{ blocks: Block[]; recordsMillions: number | null; sources: number | null }> {
  let text = description ?? "";
  const needsCounts = /\{records\}|\{sources\}/.test(text);
  let counts = null as Awaited<ReturnType<typeof getCanonicalCounts>>;

  if (needsCounts) {
    counts = await getCanonicalCounts();
    if (!counts) {
      throw new Error(
        "jobs: canonical record and source counts unavailable -- refusing to " +
          "render a posting that states a figure nobody measured"
      );
    }
    text = text
      .replace(/\{records\}/g, counts.recordsMillions.toLocaleString("en-US"))
      .replace(/\{sources\}/g, counts.sources.toLocaleString("en-US"));
  }

  const blocks: Block[] = [];
  for (const chunk of text.split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => l.startsWith("- "))) {
      blocks.push({ kind: "ul", items: lines.map((l) => runs(l.slice(2))) });
      continue;
    }
    blocks.push({ kind: "p", runs: runs(lines.join(" ")) });
  }

  return {
    blocks,
    recordsMillions: counts?.recordsMillions ?? null,
    sources: counts?.sources ?? null,
  };
}

/** The plain-text description, counts filled in, for structured data. */
export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) =>
      b.kind === "p"
        ? b.runs.map((r) => r.text).join("")
        : b.items.map((i) => "- " + i.map((r) => r.text).join("")).join("\n")
    )
    .join("\n\n");
}
