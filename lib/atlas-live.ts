import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { resolveCountyFips, stateFromFips, stateNameToCode } from "./fips";

export type Category =
  | "court"
  | "property"
  | "entity"
  | "distress"
  | "tax"
  | "energy"
  | "ownership";

export type LiveEvent = {
  timestamp: string;
  jurisdiction: string;
  event_type: string;
  category: Category;
  state: string | null;
  count: number;
};

export type LivePayload = {
  total_records: number;
  active_sources: number;
  last_updated: string | null;
  recent_events: LiveEvent[];
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Sources whose syncs are pipeline plumbing (not findings). Excluded from feed.
const EXCLUDED_PATTERNS: RegExp[] = [
  /^edgar_/i,
  /^sec_edgar/i,
  /^reit_/i,
  /^cmbs_edgar/i,
  /^freshness_monitor$/i,
  /^cross_source_reconciliation$/i,
  /^confidence_scorer$/i,
  /^baseline_refresh/i,
  /^source_health/i,
  /^pipeline_runner/i,
  /^atlas_self/i,
  /^atlas_internal/i,
  /^atlas_meta/i,
  /^aggregate_/i,
  /_runner_status$/i,
];

function isExcluded(source: string): boolean {
  return EXCLUDED_PATTERNS.some((re) => re.test(source));
}

type SourceMetadata = {
  display_name: string | null;
  category: string | null;
  description: string | null;
  registry_state: string | null;
  data_layer: string | null;
};

type ClassifyContext = {
  source: string;
  meta: SourceMetadata | null;
};

type Classification = {
  jurisdiction: string;
  event_type: string;
  category: Category;
  state: string | null;
};

// Pattern → classification rules. First match wins. Each rule may return
// `null` to defer to the next rule. Rules at the bottom are catch-alls.
type Rule = (ctx: ClassifyContext) => Classification | null;

// Reverse lookup: lowercased county-base-name → {county, state}.
// Built from the curated COUNTY_FIPS table in lib/fips.ts.
import { resolveCountyFips as _r } from "./fips";
const COUNTY_NAME_LOOKUP: Map<string, { county: string; state: string }> = (() => {
  const m = new Map<string, { county: string; state: string }>();
  // Inline list mirrored from lib/fips.ts COUNTY_FIPS values, keyed by base name.
  // We rebuild this here by walking known FIPS at module init.
  const fipsPairs: Array<[string, { county: string; state: string }]> = [];
  for (const fips of [
    "01073","04013","04019","06001","06013","06037","06059","06065","06067",
    "06071","06073","06075","06081","06085","06097","08001","08005","08031",
    "08035","08041","08059","09001","09003","09005","09007","09009","09011",
    "09013","09015","11001","12011","12031","12057","12086","12095","12099",
    "12103","12127","13063","13067","13089","13121","13135","17031","17043",
    "17089","17097","17197","18097","24003","24005","24031","24033","24510",
    "25017","25021","25025","25027","26125","26163","27053","27123","29095",
    "29189","32003","32031","34003","34013","34017","34023","34025","36005",
    "36029","36047","36055","36059","36061","36071","36081","36085","36103",
    "36119","37119","37183","39035","39049","39061","41051","41067","42003",
    "42017","42029","42045","42091","42101","47037","47157","48029","48085",
    "48113","48121","48141","48157","48201","48439","48453","48491","49035",
    "49049","51059","51153","51810","53033","53053","53061","55079",
  ]) {
    const r = _r(fips);
    if (r) fipsPairs.push([fips, r]);
  }
  for (const [, info] of fipsPairs) {
    const key = info.county
      .toLowerCase()
      .replace(/\s+(county|city|parish)$/i, "")
      .replace(/[\s']+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    if (!m.has(key)) m.set(key, info);
  }
  return m;
})();

const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR",
  california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE",
  nevada: "NV", new_hampshire: "NH", new_jersey: "NJ", new_mexico: "NM",
  new_york: "NY", north_carolina: "NC", north_dakota: "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA",
  rhode_island: "RI", south_carolina: "SC", south_dakota: "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", west_virginia: "WV",
  wisconsin: "WI", wyoming: "WY",
};

function deriveLocationFromSourceName(
  source: string
): { jurisdiction: string; state: string } | null {
  const lower = source.toLowerCase();

  // 1. Embedded county name: "..._<county>_county_..."
  const countyMatch = lower.match(/(?:^|_)([a-z]+)_county(?:_|$)/);
  if (countyMatch) {
    const info = COUNTY_NAME_LOOKUP.get(countyMatch[1]);
    if (info) {
      return { jurisdiction: `${info.county}, ${info.state}`, state: info.state };
    }
  }

  // 2. Embedded state name: matches "_state_" anywhere or as prefix/suffix.
  // Sort by length descending so "new_hampshire" wins over "hampshire".
  const stateNames = Object.keys(STATE_NAME_TO_CODE).sort(
    (a, b) => b.length - a.length
  );
  for (const name of stateNames) {
    const re = new RegExp(`(?:^|_)${name}(?:_|$)`);
    if (re.test(lower)) {
      const code = STATE_NAME_TO_CODE[name];
      return { jurisdiction: stateLongName(code) ?? code, state: code };
    }
  }

  return null;
}

function jurisdictionFromContext(
  ctx: ClassifyContext,
  fallbackState: string | null = null
): { jurisdiction: string; state: string | null } {
  // 1. FIPS code in source name
  const fipsMatch = ctx.source.match(
    /^(?:re_county|re_socrata|disc_county|cre_county)_(\d{5})$/i
  );
  if (fipsMatch) {
    const resolved = resolveCountyFips(fipsMatch[1]);
    if (resolved) {
      return {
        jurisdiction: `${resolved.county}, ${resolved.state}`,
        state: resolved.state,
      };
    }
    const stateOnly = stateFromFips(fipsMatch[1]);
    if (stateOnly) {
      return { jurisdiction: stateLongName(stateOnly) ?? stateOnly, state: stateOnly };
    }
    return { jurisdiction: "", state: null };
  }

  // 2. County or state name embedded in source key
  const fromName = deriveLocationFromSourceName(ctx.source);
  if (fromName) return fromName;

  // 3. Registry state
  const registryState = stateNameToCode(ctx.meta?.registry_state ?? null);
  if (registryState && registryState !== "US") {
    return {
      jurisdiction: stateLongName(registryState) ?? registryState,
      state: registryState,
    };
  }

  // 4. Nothing usable; let caller decide.
  return { jurisdiction: "", state: fallbackState };
}

const RULES: Rule[] = [
  // SOS / entity filings
  (ctx) => {
    if (/sos|secretary_of_state|business_entity|entity_filings|active_real_estate_salespersons_and_brokers/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      // For state-level SOS, render as "<State> SOS" instead of just the state.
      if (j.state && !j.jurisdiction.includes(", ")) {
        return {
          jurisdiction: `${j.jurisdiction} SOS`,
          state: j.state,
          event_type: /dissolution/i.test(ctx.source) ? "Entity dissolutions" : "Entity filings",
          category: "entity",
        };
      }
      if (!j.jurisdiction) return null;
      return {
        ...j,
        event_type: /dissolution/i.test(ctx.source) ? "Entity dissolutions" : "Entity filings",
        category: "entity",
      };
    }
    return null;
  },

  // Court / foreclosures / lis pendens
  (ctx) => {
    if (/foreclosure|lis_pendens|sheriff_sales|judgment|eviction|probate|mortgage_foreclosure/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      const event_type = /lis_pendens/i.test(ctx.source)
        ? "Lis pendens"
        : /foreclosure|sheriff_sales/i.test(ctx.source)
          ? "Foreclosure filings"
          : /judgment/i.test(ctx.source)
            ? "Court judgments"
            : /eviction/i.test(ctx.source)
              ? "Eviction filings"
              : /probate/i.test(ctx.source)
                ? "Probate filings"
                : "Court filings";
      return { ...j, event_type, category: "court" };
    }
    return null;
  },

  // Tax delinquency / liens
  (ctx) => {
    if (/tax_lien|tax_delinquency|tax_sales|delinquent_tax/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      return {
        ...j,
        event_type: /tax_lien/i.test(ctx.source) ? "Tax liens" : "Tax delinquencies",
        category: "tax",
      };
    }
    return null;
  },

  // Distress signals / vacancy / loan performance
  (ctx) => {
    if (/distress|cmbs_watchlist|vacant_property|loan_performance|cap_rate|cmbs_dscr/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      const event_type = /cmbs_watchlist/i.test(ctx.source)
        ? "CMBS watchlist alerts"
        : /vacant_property/i.test(ctx.source)
          ? "Vacant property indicators"
          : /loan_performance/i.test(ctx.source)
            ? "Loan distress signals"
            : "Distress signals";
      return { ...j, event_type, category: "distress" };
    }
    return null;
  },

  // Energy / utility / solar
  (ctx) => {
    if (/^eia_|electric_utility|interconnection|solar|power_plant|energy_facility/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      const event_type = /interconnection/i.test(ctx.source)
        ? "Interconnection queue updates"
        : /solar/i.test(ctx.source)
          ? "Solar installations"
          : /power_plant/i.test(ctx.source)
            ? "Power plant updates"
            : /electric_utility/i.test(ctx.source)
              ? "Utility rate changes"
              : "Energy infrastructure";
      return { ...j, event_type, category: "energy" };
    }
    return null;
  },

  // Property records — county runners + ACRIS + assessor + sales + deeds
  (ctx) => {
    if (
      /^re_county_|^re_socrata_|^disc_county_|^cre_county_|acris|assessor|property_assessment|property_sale|real_estate_sales|cre_deeds|deed_records|parcel_sales|housing_market_value/i.test(
        ctx.source
      )
    ) {
      const j = jurisdictionFromContext(ctx);
      const event_type = /acris/i.test(ctx.source)
        ? "Property transfers"
        : /assessment/i.test(ctx.source)
          ? "Property assessments"
          : /sale|deed/i.test(ctx.source)
            ? "Property transfers"
            : "Property records";
      return { ...j, event_type, category: "property" };
    }
    return null;
  },

  // Permits — closely property-adjacent, treated as property events
  (ctx) => {
    if (/permit|building_permits|nyc_dob|chicago_dob|seattle_permits|la_ladbs/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      return { ...j, event_type: "Building permits", category: "property" };
    }
    return null;
  },

  // Mortgage recordings (HUD/FHA/state portfolios)
  (ctx) => {
    if (/mortgage_single_family|mortgage_recordings|mortgage_agency|housing_finance_agency_portfolio/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      return { ...j, event_type: "Mortgage recordings", category: "property" };
    }
    return null;
  },

  // Ownership chain / REIT property activity (non-EDGAR)
  (ctx) => {
    if (/ownership_chain|owner_resolution|nyc_office_conversion_scorer/i.test(ctx.source)) {
      const j = jurisdictionFromContext(ctx);
      return { ...j, event_type: "Ownership signals", category: "ownership" };
    }
    return null;
  },

  // Fall-through using source registry data_layer or baselines category.
  (ctx) => {
    const dl = ctx.meta?.data_layer?.toLowerCase() ?? null;
    const cat = ctx.meta?.category?.toLowerCase() ?? null;
    let category: Category | null = null;
    if (dl === "tax_delinquency") category = "tax";
    else if (dl === "sos_entity") category = "entity";
    else if (dl === "probate") category = "court";
    else if (dl === "transactions" || dl === "parcels") category = "property";
    else if (dl === "permits") category = "property";
    else if (dl === "cmbs" || dl === "rental_market") category = "distress";
    else if (cat === "property records" || cat === "permits") category = "property";
    else if (cat === "energy") category = "energy";
    else if (cat === "business entity") category = "entity";
    else if (cat === "distress_signals") category = "distress";
    if (!category) return null;
    const j = jurisdictionFromContext(ctx);
    if (!j.jurisdiction) return null;
    return {
      ...j,
      event_type: ctx.meta?.display_name?.trim() ?? "Ingestion event",
      category,
    };
  },
];

function stateLongName(code: string): string | null {
  const names: Record<string, string> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "DC", FL: "Florida",
    GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana",
    IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
    MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
    MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
    NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
    NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
    SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
    UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  };
  return names[code] ?? null;
}

function classify(ctx: ClassifyContext): Classification | null {
  for (const rule of RULES) {
    const result = rule(ctx);
    if (result && result.jurisdiction) return result;
  }
  return null;
}

async function fetchPayload(): Promise<LivePayload> {
  const client = getClient();
  if (!client) {
    return {
      total_records: 0,
      active_sources: 0,
      last_updated: null,
      recent_events: [],
    };
  }

  const cutoff48h = new Date(Date.now() - 48 * 3600_000).toISOString();

  const [recordsRes, sourcesRes, syncRes] = await Promise.all([
    client
      .from("atlas_verified_record_count")
      .select("verified_records_total, last_verified_at")
      .maybeSingle(),
    client
      .from("atlas_source_baselines")
      .select("*", { count: "exact", head: true })
      .neq("health_status", "offline"),
    client
      .from("atlas_sync_log")
      .select("created_at, source, records_upserted, records_pulled")
      .gt("records_upserted", 0)
      .gte("created_at", cutoff48h)
      .not("source", "ilike", "edgar_%")
      .not("source", "ilike", "sec_edgar%")
      .not("source", "ilike", "reit_%")
      .not("source", "ilike", "cmbs_edgar%")
      .not("source", "ilike", "lodes_%")
      .not("source", "ilike", "freshness_monitor")
      .not("source", "ilike", "cross_source_reconciliation")
      .not("source", "ilike", "confidence_scorer")
      .not("source", "ilike", "baseline_refresh%")
      .not("source", "ilike", "source_health%")
      .not("source", "ilike", "pipeline_runner%")
      .not("source", "ilike", "atlas_self%")
      .not("source", "ilike", "atlas_internal%")
      .not("source", "ilike", "atlas_meta%")
      .not("source", "ilike", "aggregate_%")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const total_records = recordsRes.data?.verified_records_total ?? 0;
  const active_sources = sourcesRes.count ?? 0;
  const syncRows = (syncRes.data ?? []).filter((r) => !isExcluded(r.source));

  // Batch enrichment.
  const sourceKeys = Array.from(new Set(syncRows.map((r) => r.source)));
  const metaBySource = new Map<string, SourceMetadata>();
  if (sourceKeys.length > 0) {
    const [baselinesRes, registryRes] = await Promise.all([
      client
        .from("atlas_source_baselines")
        .select("source, display_name, category, description")
        .in("source", sourceKeys),
      client
        .from("atlas_source_registry")
        .select("source_name, state, data_layer")
        .in("source_name", sourceKeys),
    ]);
    for (const row of baselinesRes.data ?? []) {
      metaBySource.set(row.source, {
        display_name: row.display_name ?? null,
        category: row.category ?? null,
        description: row.description ?? null,
        registry_state: null,
        data_layer: null,
      });
    }
    for (const row of registryRes.data ?? []) {
      const existing = metaBySource.get(row.source_name) ?? {
        display_name: null,
        category: null,
        description: null,
        registry_state: null,
        data_layer: null,
      };
      existing.registry_state = row.state ?? null;
      existing.data_layer = row.data_layer ?? null;
      metaBySource.set(row.source_name, existing);
    }
  }

  const events: LiveEvent[] = [];
  for (const row of syncRows) {
    if (events.length >= 10) break;
    const meta = metaBySource.get(row.source) ?? null;
    const cls = classify({ source: row.source, meta });
    if (!cls) continue;
    if (!cls.jurisdiction) continue;
    events.push({
      timestamp: row.created_at,
      jurisdiction: cls.jurisdiction,
      event_type: cls.event_type,
      category: cls.category,
      state: cls.state,
      count: row.records_upserted ?? row.records_pulled ?? 0,
    });
  }

  const last_updated = events[0]?.timestamp ?? recordsRes.data?.last_verified_at ?? null;

  return { total_records, active_sources, last_updated, recent_events: events };
}

export const getAtlasLive = unstable_cache(
  fetchPayload,
  ["atlas-live-v4"],
  { revalidate: 300, tags: ["atlas-live"] }
);
