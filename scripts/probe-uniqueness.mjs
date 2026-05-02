import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim();
  return a;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

console.log('=== Test parcel uniqueness in atlas_ct_signal_map_data ===\n');

// Page through 10K rows to test unique-ness properly (Supabase default limit is 1000)
const allParcels = [];
for (let offset = 0; offset < 10; offset++) {
  const { data } = await supabase
    .from('atlas_ct_signal_map_data')
    .select('parcel_id, map_id')
    .range(offset * 1000, (offset + 1) * 1000 - 1);
  allParcels.push(...(data ?? []));
}
console.log(`Pulled ${allParcels.length} rows`);
const uniqParcels = new Set(allParcels.map(r => r.parcel_id));
const uniqMapIds = new Set(allParcels.map(r => r.map_id));
console.log(`Distinct parcel_id: ${uniqParcels.size}`);
console.log(`Distinct map_id: ${uniqMapIds.size}`);
console.log(`Ratio rows:parcels = ${(allParcels.length / uniqParcels.size).toFixed(2)}`);

// Find a duplicated parcel_id and show all its rows
const counts = {};
for (const r of allParcels) counts[r.parcel_id] = (counts[r.parcel_id] || 0) + 1;
const dupes = Object.entries(counts).filter(([, c]) => c > 1).slice(0, 3);
console.log(`\n${dupes.length > 0 ? 'Found duplicated parcels:' : 'No duplicates in sample.'}`);
for (const [pid, c] of dupes) {
  console.log(`\n  parcel_id=${pid} appears ${c} times:`);
  const { data: dupeRows } = await supabase
    .from('atlas_ct_signal_map_data')
    .select('parcel_id, map_id, address, town, active_trigger_count, has_severe_trigger, most_recent_trigger_date, has_pre_listing, most_recent_pre_listing_date')
    .eq('parcel_id', pid);
  for (const r of dupeRows ?? []) {
    console.log(`    map_id=${r.map_id} town=${r.town} active=${r.active_trigger_count} severe=${r.has_severe_trigger} trigger_date=${r.most_recent_trigger_date} pre_list=${r.has_pre_listing}`);
  }
}

console.log('\n\n=== Now run the actual production queries with DISTINCT parcel_id via RPC ===\n');
// Try exec_sql RPC
try {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        COUNT(*) AS row_count,
        COUNT(DISTINCT parcel_id) AS distinct_parcel_count
      FROM atlas_ct_signal_map_data
      WHERE most_recent_trigger_date >= CURRENT_DATE - INTERVAL '7 days'
    `
  });
  if (error) console.log('exec_sql error:', error.message);
  else console.log('Trigger 7d (rows vs distinct parcels):', data);
} catch (e) {
  console.log('exec_sql exception:', e.message);
}

try {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        COUNT(*) AS row_count,
        COUNT(DISTINCT parcel_id) AS distinct_parcel_count
      FROM atlas_ct_signal_map_data
      WHERE most_recent_pre_listing_date >= CURRENT_DATE - INTERVAL '7 days'
    `
  });
  if (error) console.log('exec_sql error:', error.message);
  else console.log('Pre-listing 7d (rows vs distinct parcels):', data);
} catch (e) {
  console.log('exec_sql exception:', e.message);
}

try {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        COUNT(*) AS row_count,
        COUNT(DISTINCT parcel_id) AS distinct_parcel_count
      FROM atlas_ct_signal_map_data
      WHERE has_severe_trigger = true
    `
  });
  if (error) console.log('exec_sql error:', error.message);
  else console.log('Severe trigger (rows vs distinct parcels):', data);
} catch (e) {
  console.log('exec_sql exception:', e.message);
}

try {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        COUNT(*) AS row_count,
        COUNT(DISTINCT parcel_id) AS distinct_parcel_count,
        MIN(most_recent_trigger_date) AS min_date,
        MAX(most_recent_trigger_date) AS max_date
      FROM atlas_ct_signal_map_data
      WHERE active_trigger_count > 0
    `
  });
  if (error) console.log('exec_sql error:', error.message);
  else console.log('Active triggers (any time):', data);
} catch (e) {
  console.log('exec_sql exception:', e.message);
}
