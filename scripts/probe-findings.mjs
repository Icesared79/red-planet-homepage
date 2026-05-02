import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim();
  return a;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const cutoff7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

async function probe(table, columns = '*', filter = null) {
  try {
    let q = supabase.from(table).select(columns, { count: 'exact', head: false }).limit(2);
    if (filter) q = filter(q);
    const { data, error, count } = await q;
    if (error) return { table, error: error.message };
    return { table, count, sample_keys: data?.[0] ? Object.keys(data[0]) : [], sample: data?.[0] };
  } catch (e) {
    return { table, error: e.message };
  }
}

console.log('=== TABLE EXISTENCE CHECK ===\n');

const candidates = [
  // Distress / lead-signal tables (CT)
  'atlas_ct_signal_map_data',
  'atlas_ct_lead_signals',
  'atlas_ct_distress_signals',
  'atlas_ct_solar_scores',
  'atlas_ct_solar_lead_signals',
  // Distress (FL/Beaches)
  'atlas_fl_signal_map_data',
  'atlas_fl_distress_signals',
  // Aggregate distress
  'atlas_distress_signals',
  'atlas_distress_candidates',
  'atlas_property_distress',
  // Conversion candidates
  'atlas_conversion_candidates',
  'atlas_nyc_conversion_candidates',
  'atlas_nyc_office_conversion_scores',
  // Lis pendens / foreclosure
  'atlas_lis_pendens',
  'atlas_foreclosure_filings',
  'atlas_foreclosure_records',
  'atlas_sheriff_sales',
  // Tax delinquency
  'atlas_tax_delinquencies',
  'atlas_tax_liens',
  // Entity / SOS
  'atlas_entity_dissolutions',
  'atlas_sos_dissolutions',
  // Ownership
  'atlas_ownership_changes',
  'atlas_property_transfers',
  'atlas_acris_transfers',
  // Beacon / household outreach
  'atlas_household_signals',
  'atlas_outreach_targets',
  'beacon_households',
  'beacon_prospects',
  // Solar
  'atlas_ct_solar_recommendations',
];

for (const t of candidates) {
  const r = await probe(t);
  if (r.error) {
    console.log(`✗ ${t}: ${r.error.slice(0, 80)}`);
  } else {
    console.log(`✓ ${t}: count=${r.count}, keys=${r.sample_keys.slice(0, 8).join(',')}`);
  }
}
