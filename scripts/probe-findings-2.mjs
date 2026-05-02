import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim();
  return a;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const cutoff7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
console.log('cutoff7d:', cutoff7d);
console.log('');

async function inspect(table) {
  const { data, error } = await supabase.from(table).select('*').limit(1);
  if (error) return console.log(`✗ ${table}: ${error.message}`);
  if (!data || !data.length) return console.log(`(empty) ${table}`);
  console.log(`\n=== ${table} ===`);
  console.log('keys:', Object.keys(data[0]));
  // Identify time columns
  const timeKeys = Object.keys(data[0]).filter(k =>
    /_at$|created|updated|surfaced|filed|scored|date$|recorded/i.test(k)
  );
  console.log('time-like keys:', timeKeys);
  // Show sample time values
  for (const k of timeKeys) console.log(`  ${k}=${data[0][k]}`);
}

for (const t of [
  'atlas_ct_signal_map_data',
  'atlas_fl_signal_map_data',
  'atlas_ct_solar_scores',
  'atlas_nyc_office_conversion_scores',
  'atlas_foreclosure_filings',
]) {
  await inspect(t);
}

// More table candidates
console.log('\n\n=== additional table candidates ===\n');
for (const t of [
  'atlas_acris_records',
  'atlas_property_records',
  'atlas_property_master',
  'atlas_ct_parcels',
  'atlas_fl_parcels',
  'atlas_entity_filings',
  'atlas_sos_filings',
  'atlas_business_entities',
  'atlas_sunscope_recommendations',
  'atlas_ct_solar_distress_overlay',
  'atlas_signal_events',
  'atlas_recent_findings',
]) {
  const { error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
  if (error) console.log(`✗ ${t}: ${error.message.slice(0, 70)}`);
  else console.log(`✓ ${t}: ${count} rows`);
}
