# red-planet-homepage — STATE

## Current phase: COFOUNDER-2.3 — the cofounder-coo posting is a founder note (2026-10-10)

### Completed in this phase

The description of the `cofounder-coo` posting was replaced with the founder
note Paul wrote: a shorter piece that opens with "A note from the founder",
drops the paragraph about superseded filings and the docs.redplanetdata.com
pointer, and keeps the three "You are probably a fit if" bullets and the
equity paragraph as they were. Title, status, location, employment type,
`posted_at`, `sort_order` and all five screening questions are untouched, and
no page code changed.

The change was applied in two places that must agree: the live
`public.job_postings` row (one UPDATE, `updated_at` 2026-10-10 19:52:00Z) and
`scripts/jobs_seed_cofounder_coo.sql`, which is the seed of record. Both now
carry the same 1,897-character text — verified by `md5(description)` against
the file, `f89be9fb4dd925d9f1af1da19c73df00`.

### Decisions that affect later phases

- **`{records}` keeps its unit word.** The text Paul supplied read "more than
  {records} verified records". `lib/canonical-metrics.ts` floors the record
  figure to whole **millions** (`recordsMillions`), so the posting has always
  supplied the word "million" itself; rendering the token without it would have
  published "more than 780 verified records". The sentence shipped as "more
  than {records} million verified records from over {sources} unique sources",
  which is how the previous description used the tokens.
- **The description renderer has paragraphs and bullet lists, and nothing
  else** (`renderDescription` in `lib/jobs.ts`). "A note from the founder" is
  therefore a paragraph, not a heading. A posting that needs a real heading
  needs a renderer change first.

### Immediate next step

None pending. The posting re-reads from the database every 300 seconds, so a
further wording change is one UPDATE plus the same edit to the seed file.

## Current phase: RECORDS-6 — the homepage reads as one composition (2026-10-10)

### Completed in this phase

A layout pass over the whole page. No copy changed except the section 05
heading, and the record card's data wiring (RECORDS-5, `f624de6e`) was not
touched: `lib/records-ledger.ts`, `components/RecordsCard.tsx` and the figures
they publish are exactly as RECORDS-5 left them. What changed is where things
sit.

| Area | Was | Is |
|---|---|---|
| 01 Hero | flex row, `align-items:center`, card capped at 460px against an 820px copy column | the same two-column auto-fit grid as 03 and 04, `align-items:stretch`; the card fills its half and both columns start and finish on the same lines |
| 03 Why it's different | columns top-aligned, copy a third shorter than the card beside it; the filings card revealed one row per 2.8s tick | columns centred; all five filings on screen from the first paint |
| 04 How it works | `justify-content:space-between` with both columns capped, leaving ~418x183px of bare band between them | two-column grid, columns adjacent |
| 05 Built on Atlas | three platform cards and LeanCRE as a one-line strip | four equal-height cards, LeanCRE among them with its own lockup |
| Page rhythm | section 05 and 06 padded ~8px deeper than every band above them; four different card paddings | `--card-pad`, `--head-gap` and `--col-gap`, used everywhere |

**The empty dark box in section 04 was never a graphic.** `.rph-engine__head`
was `display:flex` with `justify-content:space-between` and both children
capped (`22ch` and `46ch`), so on a wide viewport a 513px heading and a 430px
paragraph were pushed to opposite ends of a 1328px row. The void between them
was bounded above by the band's top padding and below by the stages' red rule,
which is what made bare band read as a graphic that had failed to load. A DOM
scan of `#engine` found no empty element and no failed request. The design's
own section (`design-system/red-planet/ui_kits/red-planet/Sections.jsx`,
`HowItWorks`) is a two-column auto-fit grid — the `Col` primitive, the same one
sections 01 and 03 use — in which the columns sit next to each other. The fix
was to use it.

### Decisions that affect later phases

- **LeanCRE is a platform card now, and it carries LeanCRE's own logo.** The
  `.rph-licensees` strip it replaced carried a standing rule in its comment:
  "Red Planet never renders another company's logo or brand colour." The
  operator asked for the card and for the real mark, so that rule no longer
  holds for a licensee's own lockup. What it protected is carried instead by
  `.rph-platform__licence`, a line on the card itself reading "Run by a
  separate company that licenses Atlas. Not a Red Planet platform." Nothing
  else on the page uses a LeanCRE colour, font or token.
- **The lockup is LeanCRE's shipped file, not a recreation.**
  `public/brand/leancre-horizontal-{light,dark}.svg` are byte-identical to
  `C:\Users\Atlas\design\leancre\assets\logo\` and to
  `rpd/apps/leancre/public/brand/`, which are themselves identical to each
  other. They are rendered with `<img>` rather than inlined so they stay
  provably the same artwork. The theme picks the variant; neither is
  recoloured.
- **`.rph-platforms` sets its column count explicitly.** `auto-fit` on a 380px
  floor gives three columns at 1440 and would drop the fourth card onto a row
  of its own. Four above 1200px, two between 680 and 1200, one below. Rows are
  stretch, so a row's cards are equal height, and `.rph-platform__link` is
  `margin-top:auto` so every card's last line sits on the same baseline.
- **`.rph-bracket` is computed, not a percentage.** Its ends must land on the
  centres of the outer cards, so it is `calc((100% - 72px) / 8)` at four
  columns and `calc((100% - 24px) / 4)` at two, exact at every width. A fifth
  card would need both of these changed again.
- **Section 03 no longer uses the shared tick** and is a server component
  again. `lib/tick.ts` is still used by section 04.
- **Three tokens now own the page's spacing**: `--card-pad`, `--head-gap`,
  `--col-gap`. A new card or section should use them rather than hand-set
  numbers, which is how the rhythm drifted in the first place.

### Known issues left open

- At 1280 the four platform cards are 274px wide and the copy runs narrow
  (Signal's markets line wraps to two). It holds together and keeps the
  composition identical to 1440, but a fifth card would force the breakpoint
  up or the copy down.
- The section 05 intro still reads "These three are examples", which is still
  true of Red Planet's own three platforms; the sentence after it is what
  introduces a licensee. Left verbatim.

### Immediate next step

None pending.

## Current phase: COFOUNDER-2.2 — the job board at /jobs (2026-10-10)

### Completed in this phase

`redplanetdata.com/jobs` is the company's permanent careers page, and
`/jobs/<slug>` is one posting with its application form. The first posting is
`cofounder-coo`, Co-Founder & Chief Operating Officer.

**Nothing about a posting lives in page code.** Two tables carry it:

| Table | Holds |
|---|---|
| `public.job_postings` | slug, title, status (`open`/`closed`), location text, employment type, the description, and that posting's screening questions as `jsonb` |
| `public.job_applications` | one row per saved application: name, email, LinkedIn URL, note, the answers as asked, and the resume's path in storage |

**Adding a posting is one INSERT into `public.job_postings`** — see
`scripts/jobs_seed_cofounder_coo.sql` for the shape. The pages re-read every 300
seconds (`JOBS_REVALIDATE`), so a new row, or a status change to `closed`,
appears without a deploy. `scripts/jobs_schema.sql` is the DDL as applied.

Resumes go in the existing private `resumes` bucket (`public = false`, 10 MB
ceiling, PDF/.doc/.docx only — storage enforces all three independently). No
public URL for one is ever minted.

### Decisions that affect later phases

- **The record and source counts come from `lib/canonical-metrics.ts`, not from
  the posting text.** A description stores `{records}` and `{sources}` and the
  renderer substitutes them from `atlas_records_headline.records_held` and
  `atlas_stats_cache['active_sources_total']` — the same two canonical objects
  `redplanet-docs-site/scripts/build_atlas_snapshot.py` reads into its snapshot,
  which is what `redplanet-docs-site/lib/metrics.ts` serves. So this site and
  docs.redplanetdata.com cannot state different numbers. Both are floored, so a
  posting understates and never overstates. **With no reading at all the posting
  render throws**, and ISR goes on serving the last good render, for the same
  reason `lib/records-ledger.ts` carries no constant fallback: no page here
  publishes a figure nobody measured.
- **The screening rule is defined once, in `lib/jobs-screening.ts`, and applied
  twice.** The browser stops a disqualified applicant before anything is
  uploaded or saved and shows `DECLINE_NOTE`; `app/api/jobs/apply/route.ts`
  applies the same rule to the same answers and returns 422, because a
  hand-rolled POST walks straight past a client check. A 422 saves no row and
  deletes any resume already uploaded.
- **The route handler re-reads the questions from the posting row**, not from
  the payload, and matches answers onto them by key. An edited payload cannot
  invent a question, drop a required one or soften which answer disqualifies.
- **The resume never passes through the route handler.** A serverless request
  body is capped well below 10 MB, so `app/api/jobs/resume-url/route.ts` mints a
  one-time signed upload URL and the browser uploads straight to the bucket.
  The apply route then proves the object exists by signing a 30-day read URL for
  it, which is the link the notification email carries.
- **Both emails send from `hello@redplanetdata.com`** through the site's
  existing Resend setup (`redplanetdata.com` is a verified Resend domain). The
  applicant gets a short confirmation; `hello@redplanetdata.com` gets every
  answer, the LinkedIn URL, the resume attached when it is under 7 MB, and the
  30-day signed link either way. Both sends are best-effort: the application is
  saved first, so a mail failure never tells an applicant their application did
  not land.
- **Structured data is emitted only while a posting is open.** `JobPosting`
  JSON-LD on an open posting (full-time, `TELECOMMUTE`, United States
  applicants, the posting date, Red Planet Data as hiring organization, no
  salary). Closing the posting in the database removes the JSON-LD and
  `noindex`es the page, with no deploy.
- **Jobs is in the legal footer, not the header nav** (`components/LegalFooter.tsx`).
- **The jobs CSS is one appended block at the end of `app/globals.css`.** Both
  pages reuse `.rph-doc` and the `.rph-form__*`/`.rph-field` system the contact
  modal already defines, so no colour, radius or font is restated. The form
  inputs are 16px rather than the modal's 15px: iOS Safari zooms on focus below
  16px and does not zoom back, and this page is reached from a phone.

### Known issues left open

- **Spam protection is a honeypot, a fill-time floor and 3 submissions per email
  address per posting.** There is no CAPTCHA, by doctrine, and no IP-based
  limit.
- A resume uploaded on a signed URL by someone who then abandons the form stays
  in the bucket as an orphan. Nothing sweeps those yet.

### Immediate next step

None pending. Opening or closing a role is a database change.


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
