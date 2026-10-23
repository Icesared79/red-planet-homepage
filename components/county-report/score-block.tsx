// The County Catalog county page's score block (atlas-dash app/county-catalog/[fips]/page.tsx: the cc-metrics row of
// Metric components and the "Group scores" panel), ported for the Red Planet website (LAND-5.3, 2026-10-23). Plain
// markup on the design system's rp-metric and rp-table classes; the figures come from the catalog export
// (atlas_county_catalog_scores, _group_scores, _license) and nothing is typed in. A missing value renders as an em dash.

export type CatalogScore = {
  overall_score: number | null
  overall_rank: number | null
  counties_ranked: number
  groups_scored: number | null
  population: number | null
  under_radar: boolean | null
  computed_at: string | null
  groups: { group_key: string; score: number | null; rank: number | null }[]
}

export type CatalogLicense = { band: 'small' | 'mid' | 'major' | null; band_basis_kind: 'measured' | 'estimated' | 'assumed' | null; depth_level: number | null; priced_at: string | null }

const DASH = '—'
const GROUP_LABEL: Record<string, string> = { people: 'People', jobs: 'Jobs', capital: 'Capital', infrastructure: 'Infrastructure', stress: 'Stress' }
const GROUP_ORDER = ['people', 'jobs', 'capital', 'infrastructure', 'stress']
const BAND_LABEL = { small: 'Small', mid: 'Mid', major: 'Major' } as const
const BAND_BASIS = { measured: 'from the county’s own commercial figures', estimated: 'estimated from national factors', assumed: 'assumed' } as const

export const fmtInt = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? DASH : Math.round(v).toLocaleString('en-US'))
export const fmtScore = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? DASH : String(Math.round(v)))

function Metric({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="rp-metric rp-metric--m">
      <div className="rp-metric__label">{label}</div>
      <p className="rp-metric__value">{value}</p>
      {meta && <div className="rp-metric__foot"><span>{meta}</span></div>}
    </div>
  )
}

export function ScoreBlock({ score, license, name }: { score: CatalogScore | null; license: CatalogLicense | null; name: string }) {
  const groups = GROUP_ORDER.map((k) => score?.groups.find((g) => g.group_key === k)).filter((g): g is NonNullable<typeof g> => !!g)
  return (
    <div className="cr-score" data-cr="score">
      <div className="cr-score__metrics">
        <Metric label="Overall score" value={fmtScore(score?.overall_score)} meta="0 to 100" />
        <Metric label="Rank" value={score?.overall_rank ? `${fmtInt(score.overall_rank)} of ${fmtInt(score.counties_ranked)}` : DASH} meta="US counties, 1 is best" />
        <Metric label="Size band" value={license?.band ? BAND_LABEL[license.band] : DASH} meta={license?.band_basis_kind ? BAND_BASIS[license.band_basis_kind] : undefined} />
      </div>
      {groups.length > 0 && (
        <table className="cr-score__groups rp-table" data-cr="group-scores">
          <caption className="cr-note">{name}&apos;s five group scores and ranks among {fmtInt(score?.counties_ranked ?? null)} counties, as the catalog computed them{score?.computed_at ? ` on ${score.computed_at.slice(0, 10)}` : ''}.</caption>
          <thead><tr><th scope="col">Group</th><th scope="col" className="is-right">Score</th><th scope="col" className="is-right">Rank</th></tr></thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.group_key}>
                <td>{GROUP_LABEL[g.group_key] ?? g.group_key}</td>
                <td className="is-right is-mono">{fmtScore(g.score)}</td>
                <td className="is-right is-mono">{fmtInt(g.rank)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
