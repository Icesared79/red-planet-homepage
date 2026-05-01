import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1].trim()] = m[2].trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function probe(table) {
  const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: false }).limit(1);
  if (error) return { table, error: error.message };
  return { table, count, sample_keys: data && data[0] ? Object.keys(data[0]) : [], sample_row: data && data[0] ? data[0] : null };
}

const tables = ['atlas_verified_record_count', 'atlas_source_baselines', 'atlas_sync_log', 'atlas_source_registry', 'atlas_morning_briefs'];
for (const t of tables) {
  console.log('====', t);
  const r = await probe(t);
  console.log(JSON.stringify(r, null, 2).slice(0, 2000));
  console.log('');
}
