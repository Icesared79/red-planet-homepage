# red-planet-homepage — STATE

## Current phase: RECORDS-5 — the record card reads the records ledger (2026-10-09)

### Completed in this phase

The homepage record card (`components/RecordsCard.tsx`, fed by
`lib/records-ledger.ts`) now reads Atlas's **records ledger**, the same source
Mission Control's headline uses, instead of the live-in-Postgres figures
HOMEPAGE-1 wired it to on 2026-10-05.

| Card part | Reads |
|---|---|
| Headline | `atlas_records_headline.records_held` — records held, live and archived together |
| Subline | `atlas_records_ledger_days.measured_live` / `.measured_stored` for `atlas_records_headline.as_of` |
| 30-day chart | `atlas_records_ledger_days.closing_total`, the 30 days ending on that same day |
| Latest Update | `atlas_records_last_night.new_records` |
| "N ago" label | `atlas_records_headline.closed_at` — when the count was taken |

`lib/record-stats.ts` and its views (`atlas_public_record_stats`,
`atlas_public_record_history`) are no longer read by anything in this repo.

### Decisions that affect later phases

- **The split is read from the headline's own day, not the newest ledger row.**
  A day whose count check has not passed is not published, and the headline
  holds on the last day that did (on 2026-10-09 the headline is 2026-10-08's).
  Taking `measured_live` / `measured_stored` from the newest row would put a
  subline on screen that does not add up to the headline above it. Mission
  Control does take them from the newest row, so the two surfaces can show the
  same headline with a differing split on a day under review.
- **The chart window ends on the headline's day** for the same reason: its last
  point equals the headline exactly.
- **`lib/records-ledger.ts` is a public read path.** It selects columns, never
  `*`, and returns only the seven fields the card renders. The ledger views also
  carry work in progress, per-source counts, anomaly counts, close status, a
  day's difference and tolerance, and the prose reason recorded for a day that
  did not match — none of which may reach a public page.
- **Last good figures, not placeholders.** A successful read is kept in a
  module-level `lastGood` and served if a later read fails, on top of Next's ISR
  keeping the last good render. Nothing on this page may publish a figure
  nobody measured, so there is still no constant fallback and the render throws
  when no reading has ever succeeded.

### Known issues left open

- **Two real dips sit inside the 30-day window**: 2026-09-20 (−624,330) and
  2026-09-28 (−1,548,658). Both are records deliberately removed
  (`removed_total` 944,010 and 2,183,511) on days that balanced, not storage
  moves — `moved_total` is 0 on both. They roll out of the window on 2026-10-20
  and 2026-10-28.
- RECORDS-4 was restating records held while this shipped and will lower the
  headline when it finishes. Nothing here is hardcoded, so the card follows.

### Immediate next step

None pending. The card updates itself after each nightly close (ledger closes
~09:45 ET, card re-reads within 5 minutes of a request after that).
