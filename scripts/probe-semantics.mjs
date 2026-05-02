import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim();
  return a;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const cutoff7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const cutoff14d = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const cutoff30d = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const cutoff60d = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const cutoff90d = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const cutoff180d = new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString().slice(0, 10);

async function ct(label, builder) {
  const { count, error } = await builder;
  console.log(label, '→', error ? `ERR ${error.message.slice(0, 50)}` : count);
}

console.log('=== STEP 1: Is atlas_ct_signal_map_data keyed 1-row-per-property? ===\n');
console.log('Total rows:');
await ct('  total',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
);

// Check distinct parcel_ids in a sample
const { data: sample } = await supabase
  .from('atlas_ct_signal_map_data')
  .select('parcel_id')
  .limit(5000);
const uniq = new Set((sample ?? []).map(r => r.parcel_id));
console.log(`  in 5000-row sample: ${sample?.length ?? 0} rows, ${uniq.size} distinct parcel_id`);
console.log('  → if equal, table is parcel-unique\n');

console.log('=== STEP 2: most_recent_trigger_date temporal distribution ===\n');
console.log('Distinct properties whose most_recent_trigger_date falls within window:');
await ct('  >= 7d  (last week)',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff7d)
);
await ct('  >= 14d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff14d)
);
await ct('  >= 30d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff30d)
);
await ct('  >= 60d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff60d)
);
await ct('  >= 90d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff90d)
);
await ct('  >= 180d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff180d)
);
await ct('  not null at all (any time)',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .not('most_recent_trigger_date', 'is', null)
);
await ct('  active_trigger_count > 0 (current state)',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gt('active_trigger_count', 0)
);

// Check 1-day and 3-day windows to see if there's true new-this-week activity
const cutoff1d = new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const cutoff3d = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().slice(0, 10);
await ct('  >= 1d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff1d)
);
await ct('  >= 3d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff3d)
);

console.log('\n=== STEP 3: most_recent_pre_listing_date distribution ===\n');
await ct('  >= 7d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_pre_listing_date', cutoff7d)
);
await ct('  >= 14d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_pre_listing_date', cutoff14d)
);
await ct('  >= 30d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_pre_listing_date', cutoff30d)
);
await ct('  >= 90d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_pre_listing_date', cutoff90d)
);
await ct('  >= 180d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_pre_listing_date', cutoff180d)
);
await ct('  pre_listing_count > 0 (current state)',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gt('pre_listing_count', 0)
);
await ct('  has_pre_listing = true',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .eq('has_pre_listing', true)
);

console.log('\n=== STEP 4: Sample actual most_recent_trigger_date values ===\n');
const { data: samples } = await supabase
  .from('atlas_ct_signal_map_data')
  .select('parcel_id, most_recent_trigger_date, active_trigger_count, has_severe_trigger')
  .gt('active_trigger_count', 0)
  .order('most_recent_trigger_date', { ascending: false, nullsFirst: false })
  .limit(10);
console.log('Newest 10 trigger dates:');
for (const r of samples ?? []) console.log(`  ${r.parcel_id} | ${r.most_recent_trigger_date} | active=${r.active_trigger_count} | severe=${r.has_severe_trigger}`);

const { data: samples2 } = await supabase
  .from('atlas_ct_signal_map_data')
  .select('parcel_id, most_recent_trigger_date')
  .gt('active_trigger_count', 0)
  .order('most_recent_trigger_date', { ascending: true, nullsFirst: false })
  .limit(5);
console.log('\nOldest 5 trigger dates (from properties with active triggers):');
for (const r of samples2 ?? []) console.log(`  ${r.parcel_id} | ${r.most_recent_trigger_date}`);
