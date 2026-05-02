import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim();
  return a;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const cutoff7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
console.log('cutoff7d:', cutoff7d, '\n');

async function show(label, builder) {
  const { count, error } = await builder;
  if (error) console.log(`✗ ${label}: ${error.message.slice(0, 80)}`);
  else console.log(`${count?.toString().padStart(8)} | ${label}`);
}

console.log('=== CT signal map: trigger-based distress ===');
await show('CT total rows',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
);
await show('CT active_trigger_count > 0',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gt('active_trigger_count', 0)
);
await show('CT most_recent_trigger_date >= 7d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff7d.slice(0, 10))
);
await show('CT severity_level severe',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .eq('severity_level', 'severe')
);
await show('CT lead_tier top',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .eq('lead_tier', 'top')
);
await show('CT has_severe_trigger=true',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .eq('has_severe_trigger', true)
);
await show('CT pre_listing_count > 0',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gt('pre_listing_count', 0)
);
await show('CT most_recent_pre_listing_date >= 7d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_pre_listing_date', cutoff7d.slice(0, 10))
);

console.log('\n=== FL signal map ===');
await show('FL total rows',
  supabase.from('atlas_fl_signal_map_data').select('*', { count: 'exact', head: true })
);
await show('FL active_trigger_count > 0',
  supabase.from('atlas_fl_signal_map_data').select('*', { count: 'exact', head: true })
    .gt('active_trigger_count', 0)
);
await show('FL most_recent_trigger_date >= 7d',
  supabase.from('atlas_fl_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff7d.slice(0, 10))
);
await show('FL severity_level severe',
  supabase.from('atlas_fl_signal_map_data').select('*', { count: 'exact', head: true })
    .eq('severity_level', 'severe')
);
await show('FL has_severe_trigger=true',
  supabase.from('atlas_fl_signal_map_data').select('*', { count: 'exact', head: true })
    .eq('has_severe_trigger', true)
);
await show('FL most_recent_pre_listing_date >= 7d',
  supabase.from('atlas_fl_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_pre_listing_date', cutoff7d.slice(0, 10))
);

console.log('\n=== NYC office conversion ===');
await show('NYC total',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
);
await show('NYC scored_at >= 7d',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .gte('scored_at', cutoff7d)
);
await show('NYC conversion_tier=top',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('conversion_tier', 'top')
);
await show('NYC tier high',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('conversion_tier', 'high')
);
await show('NYC tier strong',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('conversion_tier', 'strong')
);
await show('NYC conversion_score >= 70',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .gte('conversion_score', 70)
);
// Distinct conversion_tier values
const { data: tiers } = await supabase.from('atlas_nyc_office_conversion_scores').select('conversion_tier').limit(2000);
const tierCounts = {};
for (const r of tiers ?? []) tierCounts[r.conversion_tier ?? '(null)'] = (tierCounts[r.conversion_tier ?? '(null)'] || 0) + 1;
console.log('  NYC tier distribution:', tierCounts);

console.log('\n=== Foreclosure filings ===');
await show('FC total',
  supabase.from('atlas_foreclosure_filings').select('*', { count: 'exact', head: true })
);
await show('FC created_at >= 7d (ingested)',
  supabase.from('atlas_foreclosure_filings').select('*', { count: 'exact', head: true })
    .gte('created_at', cutoff7d)
);
await show('FC filing_date >= 7d',
  supabase.from('atlas_foreclosure_filings').select('*', { count: 'exact', head: true })
    .gte('filing_date', cutoff7d.slice(0, 10))
);
await show('FC filing_date >= 30d',
  supabase.from('atlas_foreclosure_filings').select('*', { count: 'exact', head: true })
    .gte('filing_date', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10))
);
await show('FC filing_date >= 90d',
  supabase.from('atlas_foreclosure_filings').select('*', { count: 'exact', head: true })
    .gte('filing_date', new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10))
);

console.log('\n=== CT solar scores ===');
await show('CT solar total',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
);
await show('CT solar scored_at >= 7d',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .gte('scored_at', cutoff7d)
);
await show('CT solar tier top scored 7d',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('tier', 'top').gte('scored_at', cutoff7d)
);
await show('CT solar solar_match_tier top scored 7d',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('solar_match_tier', 'top').gte('scored_at', cutoff7d)
);
await show('CT solar recommendation_category=top_candidate',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('recommendation_category', 'top_candidate')
);
// Distinct tier values
const { data: stiers } = await supabase.from('atlas_ct_solar_scores').select('tier, solar_match_tier, recommendation_category').limit(1000);
const sCounts = {};
for (const r of stiers ?? []) sCounts[r.tier ?? '(null)'] = (sCounts[r.tier ?? '(null)'] || 0) + 1;
console.log('  CT solar tier distribution:', sCounts);
const smtCounts = {};
for (const r of stiers ?? []) smtCounts[r.solar_match_tier ?? '(null)'] = (smtCounts[r.solar_match_tier ?? '(null)'] || 0) + 1;
console.log('  CT solar solar_match_tier distribution:', smtCounts);
const rcCounts = {};
for (const r of stiers ?? []) rcCounts[r.recommendation_category ?? '(null)'] = (rcCounts[r.recommendation_category ?? '(null)'] || 0) + 1;
console.log('  CT solar recommendation_category distribution:', rcCounts);
