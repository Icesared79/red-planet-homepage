import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1].trim()] = m[2].trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

console.log('=== sample of recent sync_log events with positive upserts (last 48h) ===');
const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
const { data: syncRows } = await supabase
  .from('atlas_sync_log')
  .select('created_at, source, records_upserted, records_pulled, status')
  .gt('records_upserted', 0)
  .gte('created_at', cutoff)
  .order('created_at', { ascending: false })
  .limit(40);
console.log(`got ${syncRows?.length || 0} rows`);
const sources = new Set();
for (const r of syncRows ?? []) {
  console.log(`  ${r.created_at} | ${r.source} | upserts=${r.records_upserted}`);
  sources.add(r.source);
}

console.log('\n=== unique source keys in last 48h ===');
console.log([...sources]);

console.log('\n=== category/data_layer for those sources (atlas_source_baselines) ===');
if (sources.size > 0) {
  const { data: baselines } = await supabase
    .from('atlas_source_baselines')
    .select('source, display_name, category, description')
    .in('source', [...sources]);
  for (const b of baselines ?? []) {
    console.log(`  ${b.source} | category="${b.category}" | display="${b.display_name}" | desc="${(b.description||'').slice(0,80)}"`);
  }

  console.log('\n=== state/data_layer for those sources (atlas_source_registry) ===');
  const { data: registry } = await supabase
    .from('atlas_source_registry')
    .select('source_name, state, data_layer, format, status, schedule, display_name, category, description')
    .in('source_name', [...sources]);
  for (const r of registry ?? []) {
    console.log(`  ${r.source_name} | state=${r.state} | data_layer=${r.data_layer} | category=${r.category}`);
  }
}

console.log('\n=== distinct categories in atlas_source_baselines ===');
const { data: cats } = await supabase.from('atlas_source_baselines').select('category');
const catMap = {};
for (const c of cats ?? []) catMap[c.category || '(null)'] = (catMap[c.category || '(null)'] || 0) + 1;
console.log(catMap);

console.log('\n=== distinct data_layer in atlas_source_registry ===');
const { data: dls } = await supabase.from('atlas_source_registry').select('data_layer');
const dlMap = {};
for (const d of dls ?? []) dlMap[d.data_layer || '(null)'] = (dlMap[d.data_layer || '(null)'] || 0) + 1;
console.log(dlMap);

console.log('\n=== look for FIPS lookup tables ===');
for (const t of ['atlas_us_counties', 'atlas_county_fips', 'us_counties', 'fips_codes', 'counties', 'atlas_fips']) {
  const { error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
  if (!error) console.log(`  ✓ ${t}: ${count} rows`);
  else console.log(`  ✗ ${t}: ${error.message.slice(0, 50)}`);
}
