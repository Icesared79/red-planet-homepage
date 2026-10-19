import "server-only";

import { createClient } from "@supabase/supabase-js";

// COUNTY-4.2 (2026-10-18). The read path behind /licensing: Connecticut and Florida residential county
// licenses, priced LIVE from the County Catalog on every revalidation. No price, level, discount or term is
// computed here -- the firm prices, the individual prices, the discount percentages, the seat terms and both
// terms texts are the catalog's own (atlas_county_catalog_quote_residential / _quote_individual and
// atlas_county_catalog_pricing_terms), read with the service role because none of those objects is open to
// anon. This file selects what the page renders and nothing else.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Seconds between re-reads, so a price change in the catalog reaches the page without a deploy. */
export const LICENSING_REVALIDATE = 300;

/** The states this page licenses. */
export const LICENSING_STATES: Record<string, string> = { CT: "Connecticut", FL: "Florida" };

export type CountyPrice = {
  fips: string;
  state: string;
  name: string;
  /** COUNTY-8: the county's client name (a CT planning region's short name), as the shared price list shows it. */
  shortName: string;
  /** COUNTY-8: residential parcels, and foreclosure and probate filings of the last 90 days; null = not held. */
  parcels: number | null;
  foreclosure90: number | null;
  probate90: number | null;
  /** COUNTY-8: the earliest as-of date (yyyy-mm-dd) of this county's counts shown, null when none is held. */
  countsAsOf: string | null;
  levelLow: number | null;
  levelHigh: number | null;
  firmLow: number;
  firmHigh: number;
  individualLow: number;
  individualHigh: number;
  explanation: string | null;
};

export type LicensingTerms = {
  seatsIncluded: number;
  seatBlockSize: number;
  seatBlockPct: number;
  seatRule: string | null;
  bundleMinCounties: number;
  bundleDiscountPct: number;
  stateDiscountPct: number;
  individualPct: number;
  individualFloor: number;
  individualTerms: string | null;
  /** COUNTY-7: white label's annual price and the least seats a firm license needs for it; null when not set. */
  whiteLabelPrice: number | null;
  whiteLabelMinSeats: number | null;
};

export type Licensing = { counties: CountyPrice[]; terms: LicensingTerms };

type CountyFacts = { shortName: Map<string, string>; parcels: Map<string, number>; counts: Map<string, number>; asOf: Map<string, string> };

/** "October 17, 2026" from a yyyy-mm-dd date. */
export const longDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/**
 * COUNTY-8: what the shared price list (atlas-dash /o/<token>) shows beside each county's prices, from the same
 * tables: the client name (atlas_county_catalog_counties.client_short_name), residential parcels
 * (atlas_county_catalog_residential) and the foreclosure and probate filings of the last 90 days
 * (atlas_county_catalog_residential_activity, which atlas-dash rewrites when over six hours old). A read that fails
 * leaves its column as dashes rather than failing the page.
 */
async function countyFacts(sb: NonNullable<ReturnType<typeof client>>, fips: string[]): Promise<CountyFacts> {
  const out: CountyFacts = { shortName: new Map(), parcels: new Map(), counts: new Map(), asOf: new Map() };
  const [names, res, act] = await Promise.all([
    sb.from("atlas_county_catalog_counties").select("fips, client_short_name").in("fips", fips),
    sb.from("atlas_county_catalog_residential").select("fips, residential_parcels").in("fips", fips),
    sb.from("atlas_county_catalog_residential_activity").select("fips, record_type, n90, as_of").in("fips", fips).in("record_type", ["foreclosure", "probate"]),
  ]);
  if (names.error) console.error("[licensing] county names:", names.error.message);
  if (res.error) console.error("[licensing] residential parcels:", res.error.message);
  if (act.error) console.error("[licensing] filing counts:", act.error.message);
  for (const r of (names.data ?? []) as Array<{ fips: string; client_short_name: string | null }>) {
    if (r.client_short_name) out.shortName.set(r.fips, r.client_short_name);
  }
  for (const r of (res.data ?? []) as Array<{ fips: string; residential_parcels: number | string | null }>) {
    if (r.residential_parcels !== null) out.parcels.set(r.fips, Number(r.residential_parcels));
  }
  for (const r of (act.data ?? []) as Array<{ fips: string; record_type: string; n90: number | null; as_of: string }>) {
    if (r.n90 === null) continue;
    out.counts.set(`${r.fips}:${r.record_type}`, Number(r.n90));
    const d = String(r.as_of).slice(0, 10);
    const have = out.asOf.get(r.fips);
    if (!have || d < have) out.asOf.set(r.fips, d);
  }
  return out;
}

type QuoteLine = {
  fips: string;
  state: string;
  name: string;
  available: boolean;
  level_low: number | null;
  level_high: number | null;
  firm_price_low: number | null;
  firm_price_high: number | null;
  price_low: number | null;
  price_high: number | null;
  explanation: string | null;
};

export type IndividualQuote = {
  lines: QuoteLine[];
  counties: number;
  individual_pct: number;
  individual_floor: number;
  state_discount_pct: number;
  state_discount_counties: number;
  state_discount_low: number;
  state_discount_high: number;
  whole_states: string[];
  bundle_discount_pct: number;
  bundle_discount_counties: number;
  bundle_discount_low: number;
  bundle_discount_high: number;
  total_low: number;
  total_high: number;
  terms: string | null;
};

export type FirmQuote = {
  lines: Array<QuoteLine & { seat_low: number | null; seat_high: number | null }>;
  counties: number;
  seats: number;
  seats_included: number;
  seat_block_size: number;
  seat_block_pct: number;
  seat_blocks: number;
  seat_rule: string | null;
  state_discount_pct: number;
  state_discount_low: number;
  state_discount_high: number;
  bundle_discount_pct: number;
  bundle_min_counties: number;
  bundle_discount_low: number;
  bundle_discount_high: number;
  total_low: number;
  total_high: number;
};

function client() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));

/**
 * The catalog's paragraph is written for the operator's screens. On a client page the company is Red Planet
 * Data, the operator's word for the price list is said plainly, and no sentence calls the records public.
 * The same substitutions the shared price-list page makes (atlas-dash lib/share/quote.ts clientText).
 */
export function clientText(s: string | null): string | null {
  if (!s) return null;
  return s
    .replace(/\bAtlas\b/g, "Red Planet Data")
    .replace(/ on the residential track/g, " for residential records")
    .replace(/\bpublic(ly)? /gi, "");
}

/** Every Connecticut and Florida county with residential records, as the catalog lists them. */
async function residentialFips(sb: NonNullable<ReturnType<typeof client>>): Promise<string[]> {
  const { data: res, error } = await sb.from("atlas_county_catalog_residential").select("fips").eq("available", true);
  if (error) throw new Error(`residential counties: ${error.message}`);
  const all = (res ?? []).map((r: { fips: string }) => r.fips);
  // CT county FIPS begin 09, FL 12. The quote returns each county's state too; this only narrows the call.
  return all.filter((f) => f.startsWith("09") || f.startsWith("12"));
}

export async function quoteIndividual(fips: string[]): Promise<IndividualQuote | null> {
  const sb = client();
  if (!sb || !fips.length) return null;
  const { data, error } = await sb.rpc("atlas_county_catalog_quote_individual", { p_fips: fips });
  if (error) throw new Error(`individual quote: ${error.message}`);
  return data as IndividualQuote;
}

export async function quoteFirm(fips: string[], seats: number): Promise<FirmQuote | null> {
  const sb = client();
  if (!sb || !fips.length) return null;
  const { data, error } = await sb.rpc("atlas_county_catalog_quote_residential", { p_fips: fips, p_seats: seats });
  if (error) throw new Error(`firm quote: ${error.message}`);
  return data as FirmQuote;
}

/** The page's figures, or null when the catalog cannot be read (the page then says prices are on request). */
export async function loadLicensing(): Promise<Licensing | null> {
  const sb = client();
  if (!sb) return null;
  try {
    const fips = await residentialFips(sb);
    if (!fips.length) return null;
    const ind = await quoteIndividual(fips);
    const firm = await quoteFirm([fips[0]], 25);
    if (!ind || !firm) return null;
    // COUNTY-7: the white-label line of the residential pricing table (atlas-dash pricing settings).
    const { data: wl } = await sb
      .from("atlas_county_catalog_pricing_inputs")
      .select("input_key, value")
      .in("input_key", ["res_white_label_price", "res_white_label_min_seats"]);
    const wlv = new Map((wl ?? []).map((r: { input_key: string; value: number | string }) => [r.input_key, Number(r.value)]));
    const facts = await countyFacts(sb, fips);
    const counties: CountyPrice[] = ind.lines
      .filter((l) => l.available && LICENSING_STATES[l.state])
      .map((l) => ({
        fips: l.fips,
        state: l.state,
        name: l.name,
        shortName: facts.shortName.get(l.fips) ?? l.name.replace(/, [^,]+$/, ""),
        parcels: facts.parcels.get(l.fips) ?? null,
        foreclosure90: facts.counts.get(`${l.fips}:foreclosure`) ?? null,
        probate90: facts.counts.get(`${l.fips}:probate`) ?? null,
        countsAsOf: facts.asOf.get(l.fips) ?? null,
        levelLow: num(l.level_low),
        levelHigh: num(l.level_high),
        firmLow: Number(l.firm_price_low),
        firmHigh: Number(l.firm_price_high),
        individualLow: Number(l.price_low),
        individualHigh: Number(l.price_high),
        explanation: clientText(l.explanation),
      }))
      .sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
    return {
      counties,
      terms: {
        seatsIncluded: Number(firm.seats_included),
        seatBlockSize: Number(firm.seat_block_size),
        seatBlockPct: Number(firm.seat_block_pct),
        seatRule: firm.seat_rule,
        bundleMinCounties: Number(firm.bundle_min_counties),
        bundleDiscountPct: Number(firm.bundle_discount_pct),
        stateDiscountPct: Number(firm.state_discount_pct),
        individualPct: Number(ind.individual_pct),
        individualFloor: Number(ind.individual_floor),
        individualTerms: ind.terms,
        whiteLabelPrice: wlv.get("res_white_label_price") ?? null,
        whiteLabelMinSeats: wlv.get("res_white_label_min_seats") ?? null,
      },
    };
  } catch (e) {
    console.error("[licensing] catalog read failed:", e);
    return null;
  }
}

/** Keep only well-formed CT / FL county FIPS, de-duplicated. */
export function cleanFips(v: unknown): string[] {
  const list = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  const out = new Set<string>();
  for (const x of list) {
    const f = String(x).trim();
    if (/^(09|12)\d{3}$/.test(f)) out.add(f);
  }
  return [...out].slice(0, 100);
}

export const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
export function priceText(lo: number | null, hi: number | null): string {
  if (lo === null && hi === null) return "On request";
  if (lo === null || hi === null || lo === hi) return usd((hi ?? lo)!);
  return `${usd(lo)} to ${usd(hi)}`;
}
