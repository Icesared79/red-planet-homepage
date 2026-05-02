import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1].trim()] = m[2].trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function probe(hours, label) {
  const cutoff = new Date(Date.now() - hours * 3600000).toISOString();
  const { data: rows } = await supabase
    .from('atlas_sync_log')
    .select('created_at, source, records_upserted')
    .gt('records_upserted', 0)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(500);

  console.log(`\n=== ${label} (${rows?.length || 0} events) ===`);
  const counts = {};
  for (const r of rows ?? []) counts[r.source] = (counts[r.source] || 0) + 1;
  const sortedSources = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  console.log('source -> count of ingest events');
  for (const [s, c] of sortedSources) console.log(`  ${s}: ${c}`);

  // After excluding EDGAR + plumbing
  const exclude = (s) => /edgar|atlas_self|atlas_internal|baseline_refresh|source_health|pipeline_runner_status|atlas_meta|aggregate_/i.test(s);
  const relevant = (rows ?? []).filter(r => !exclude(r.source));
  console.log(`\nAfter excluding EDGAR + plumbing: ${relevant.length} events`);
  console.log('First 15 relevant events newest-first:');
  for (const r of relevant.slice(0, 15)) {
    console.log(`  ${r.created_at} | ${r.source} | upserts=${r.records_upserted}`);
  }
}

await probe(48, 'last 48 hours');
await probe(168, 'last 7 days');
await probe(720, 'last 30 days');

console.log('\n=== source classification metadata for relevant sources (last 30d) ===');
const cutoff30 = new Date(Date.now() - 720 * 3600000).toISOString();
const { data: r30 } = await supabase
  .from('atlas_sync_log')
  .select('source')
  .gt('records_upserted', 0)
  .gte('created_at', cutoff30);
const uniq = [...new Set((r30 ?? []).map(r => r.source).filter(s => !/edgar|atlas_self|atlas_internal|baseline_refresh|source_health|pipeline_runner|atlas_meta|aggregate_/i.test(s)))];
console.log(`unique relevant sources in last 30d: ${uniq.length}`);
console.log(uniq);
if (uniq.length > 0) {
  const { data: bls } = await supabase
    .from('atlas_source_baselines')
    .select('source, display_name, category, description')
    .in('source', uniq);
  const { data: regs } = await supabase
    .from('atlas_source_registry')
    .select('source_name, state, data_layer')
    .in('source_name', uniq);
  const regBy = {};
  for (const r of regs ?? []) regBy[r.source_name] = r;
  console.log('\nclassification table (source | category | data_layer | state | display)');
  for (const b of bls ?? []) {
    const reg = regBy[b.source] || {};
    console.log(`  ${b.source} | cat="${b.category}" | dl="${reg.data_layer || '-'}" | state=${reg.state || '-'} | "${b.display_name}"`);
  }
}
