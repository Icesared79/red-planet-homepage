import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CACHE_TTL_MS = 15_000;

type IngestEvent = {
  timestamp: string;
  source_name: string;
  county: string | null;
  state: string | null;
  record_delta: number;
};

type LivePayload = {
  total_records: number;
  active_sources: number;
  last_ingest: IngestEvent | null;
  recent_activity: IngestEvent[];
};

type CacheEntry = { at: number; data: LivePayload };
let cache: CacheEntry | null = null;
let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

async function buildPayload(client: SupabaseClient): Promise<LivePayload> {
  const [recordsRes, sourcesRes, syncRes] = await Promise.all([
    client
      .from("atlas_verified_record_count")
      .select("verified_records_total")
      .maybeSingle(),
    client
      .from("atlas_source_baselines")
      .select("*", { count: "exact", head: true })
      .neq("health_status", "offline"),
    client
      .from("atlas_sync_log")
      .select("created_at, source, records_upserted, records_pulled")
      .gt("records_upserted", 0)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalRecords = recordsRes.data?.verified_records_total ?? 0;
  const activeSources = sourcesRes.count ?? 0;
  const syncRows = syncRes.data ?? [];

  const sourceKeys = Array.from(new Set(syncRows.map((r) => r.source).filter(Boolean)));
  const baselineByKey = new Map<string, { display_name: string | null }>();
  const registryByKey = new Map<string, { state: string | null }>();

  if (sourceKeys.length > 0) {
    const [baselinesRes, registryRes] = await Promise.all([
      client
        .from("atlas_source_baselines")
        .select("source, display_name")
        .in("source", sourceKeys),
      client
        .from("atlas_source_registry")
        .select("source_name, state")
        .in("source_name", sourceKeys),
    ]);
    for (const row of baselinesRes.data ?? []) {
      baselineByKey.set(row.source, { display_name: row.display_name });
    }
    for (const row of registryRes.data ?? []) {
      registryByKey.set(row.source_name, { state: row.state });
    }
  }

  const recent_activity: IngestEvent[] = syncRows.map((r) => {
    const baseline = baselineByKey.get(r.source);
    const registry = registryByKey.get(r.source);
    const display = baseline?.display_name?.trim() || prettifySource(r.source);
    return {
      timestamp: r.created_at,
      source_name: display,
      county: null,
      state: registry?.state ?? null,
      record_delta: r.records_upserted ?? r.records_pulled ?? 0,
    };
  });

  return {
    total_records: totalRecords,
    active_sources: activeSources,
    last_ingest: recent_activity[0] ?? null,
    recent_activity,
  };
}

function prettifySource(key: string | null | undefined): string {
  if (!key) return "Unknown source";
  return key
    .replace(/^run_disc_|^disc_/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "cache-control": "public, max-age=10" },
    });
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "Server is misconfigured." },
      { status: 500 }
    );
  }

  try {
    const data = await buildPayload(client);
    cache = { at: now, data };
    return NextResponse.json(data, {
      headers: { "cache-control": "public, max-age=10" },
    });
  } catch (err) {
    console.error("/api/atlas-live error:", err);
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { "cache-control": "public, max-age=5" },
      });
    }
    return NextResponse.json(
      { error: "Live data temporarily unavailable." },
      { status: 503 }
    );
  }
}
