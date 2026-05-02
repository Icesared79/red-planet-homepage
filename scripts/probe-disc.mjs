import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim(); return a; }, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Pull the actual relevant events that should be in the feed
const cutoff = new Date(Date.now() - 48 * 3600000).toISOString();
const { data } = await supabase
  .from('atlas_sync_log')
  .select('created_at, source, records_upserted')
  .gt('records_upserted', 0)
  .gte('created_at', cutoff)
  .not('source', 'ilike', 'edgar_%')
  .not('source', 'ilike', 'sec_edgar%')
  .not('source', 'ilike', 'lodes_%')
  .order('created_at', { ascending: false })
  .limit(40);
console.log('=== first 30 relevant events (after SQL exclusion of EDGAR/LODES) ===');
const sources = new Set();
for (const r of (data ?? []).slice(0, 30)) {
  console.log(`  ${r.created_at} | ${r.source}`);
  sources.add(r.source);
}

console.log('\n=== baseline metadata for those sources ===');
const { data: bls } = await supabase.from('atlas_source_baselines').select('source, display_name, category').in('source', [...sources]);
const blsBy = {};
for (const b of bls ?? []) blsBy[b.source] = b;
for (const s of sources) {
  const b = blsBy[s];
  if (b) console.log(`  ${s} | cat="${b.category}" | display="${b.display_name}"`);
  else console.log(`  ${s} | (NO BASELINE METADATA)`);
}

console.log('\n=== registry metadata for those sources ===');
const { data: regs } = await supabase.from('atlas_source_registry').select('source_name, state, data_layer').in('source_name', [...sources]);
const regBy = {};
for (const r of regs ?? []) regBy[r.source_name] = r;
for (const s of sources) {
  const r = regBy[s];
  if (r) console.log(`  ${s} | state=${r.state} | dl=${r.data_layer}`);
  else console.log(`  ${s} | (NO REGISTRY METADATA)`);
}
