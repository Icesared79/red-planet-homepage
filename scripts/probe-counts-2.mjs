import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8').split('\n').reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim();
  return a;
}, {});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const cutoff7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

async function show(label, builder) {
  const { count, error } = await builder;
  if (error) console.log(`✗ ${label}: ${error.message.slice(0, 80)}`);
  else console.log(`${count?.toString().padStart(8)} | ${label}`);
}

console.log('=== SOLAR — full (no scored_at filter, since column type may be issue) ===');
await show('strong_fit total',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('recommendation_category', 'strong_fit')
);
await show('strong_fit AND scored_at >= 7d',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('recommendation_category', 'strong_fit').gte('scored_at', cutoff7d)
);
await show('mixed_fit total',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('recommendation_category', 'mixed_fit')
);
await show('weak_fit total',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('recommendation_category', 'weak_fit')
);
await show('scored_at >= 7d (no other filter)',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .gte('scored_at', cutoff7d)
);
await show('scored_at not null',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .not('scored_at', 'is', null)
);
await show('scored_at >= 30d',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .gte('scored_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())
);
// What's the latest scored_at in the table?
const { data: latest } = await supabase.from('atlas_ct_solar_scores').select('scored_at').order('scored_at', { ascending: false, nullsFirst: false }).limit(5);
console.log('Latest scored_at values:', latest?.map(r => r.scored_at));

console.log('\n=== Solar w/ recommendation_category=strong_fit AND has Google sun verification ===');
await show('strong_fit + sun_exposure_tier_est=high',
  supabase.from('atlas_ct_solar_scores').select('*', { count: 'exact', head: true })
    .eq('recommendation_category', 'strong_fit').eq('sun_exposure_tier_est', 'high')
);
// Check sun_exposure_source
const { data: sunSrc } = await supabase.from('atlas_ct_solar_scores').select('sun_exposure_source').not('sun_exposure_source', 'is', null).limit(10);
console.log('Sample sun_exposure_source values:', [...new Set(sunSrc?.map(r => r.sun_exposure_source) ?? [])]);

console.log('\n=== NYC conversion tier distribution (full) ===');
await show('NYC tier=prime',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('conversion_tier', 'prime')
);
await show('NYC tier=strong',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('conversion_tier', 'strong')
);
await show('NYC tier=moderate',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('conversion_tier', 'moderate')
);
await show('NYC borough=Manhattan',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('borough', 'Manhattan')
);
await show('NYC borough=Manhattan AND conversion_score >= 70',
  supabase.from('atlas_nyc_office_conversion_scores').select('*', { count: 'exact', head: true })
    .eq('borough', 'Manhattan').gte('conversion_score', 70)
);

console.log('\n=== CT distress trigger date distribution ===');
const cutoff30d = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const cutoff14d = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
await show('CT most_recent_trigger_date >= 30d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff30d)
);
await show('CT most_recent_trigger_date >= 14d',
  supabase.from('atlas_ct_signal_map_data').select('*', { count: 'exact', head: true })
    .gte('most_recent_trigger_date', cutoff14d)
);
// Distinct severity levels
const { data: sevs } = await supabase.from('atlas_ct_signal_map_data').select('severity_level').gt('active_trigger_count', 0).limit(5000);
const sevCounts = {};
for (const r of sevs ?? []) sevCounts[r.severity_level ?? '(null)'] = (sevCounts[r.severity_level ?? '(null)'] || 0) + 1;
console.log('CT severity distribution (sample):', sevCounts);
