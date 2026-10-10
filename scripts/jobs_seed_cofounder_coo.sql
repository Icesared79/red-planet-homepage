-- The first posting on /jobs (COFOUNDER-2.2, 2026-10-10).
--
-- The description is stored exactly as written, with two substitution tokens in
-- the second paragraph: {records} and {sources}. lib/canonical-metrics.ts fills
-- them from the records ledger headline and atlas_stats_cache, the same two
-- objects the docs site's snapshot builder reads, so the careers page and
-- docs.redplanetdata.com cannot show different numbers.

INSERT INTO public.job_postings
  (slug, title, status, location_text, employment_type, posted_at, sort_order, description, questions)
VALUES (
  'cofounder-coo',
  'Co-Founder & Chief Operating Officer',
  'open',
  'United States (Remote)',
  'Full-time',
  '2026-10-10T00:00:00-04:00'::timestamptz,
  0,
  $desc$I have spent the last 25 years around real estate and technology, and for most of it I purchased the same data everyone else did, from the same choice vendors, at the same inflated prices. This year I built something different.

It is called Atlas. It is a data engine that finds its own sources, checks every record against the original document, and improves every day. Atlas currently holds more than {records} million verified records from over {sources} unique sources. I built it in a few months with hundreds of AI agents and no outside engineering team. A few years ago that would have taken a large company millions of dollars and several years. You can read more about Atlas at docs.redplanetdata.com.

I am posting this because I need a co-founder to help me grow and scale the business.

We already have several products currently operating, and can build new ones in a few days to a few weeks. We can work with a variety of industries. We simply build the product for them, wrapped around our data, and sell them a license to operate it. That could be a regional lender, an insurer, a developer or a brokerage. Until now only the largest institutions could afford to have a custom SaaS built around their operation. I think that is where the real value is, and AI makes it possible.

Additionally, local government systems often overwrite their records as filings are settled, withdrawn or replaced. But Atlas keeps these versions, a record in history that is often lost by even the largest data companies.

I will keep building Atlas and the products. Your job is to run the business side: sales, licensing, fundraising and hiring. Larger decisions would be a combined effort.

You are probably a fit if:

- You have built or run an early-stage company before, as a founder or senior operator, through a funding round or an exit
- You have sold software or data to companies and know how to close those deals
- You want ownership more than a salary at this point in your career

This is a founder ownership position. You would receive a sizable founder equity stake in Red Planet Data, Inc., vesting over four years, on the same terms I hold. There is no salary today. Salaries for both founders begin once the company closes outside funding. We would start with a defined 60-day working period before stock is issued.

Apply below. I will reply personally to everyone who fits the role.$desc$,
  $q$[
    {
      "key": "equity_basis",
      "prompt": "This is a founder ownership role paid in equity, with no salary until the company closes outside funding. Are you able to work on that basis?",
      "type": "yes_no",
      "required": true,
      "disqualify": { "equals": "no" }
    },
    {
      "key": "us_authorized",
      "prompt": "Are you legally authorized to work in the United States?",
      "type": "yes_no",
      "required": true,
      "disqualify": { "equals": "no" }
    },
    {
      "key": "founder_or_exec",
      "prompt": "Have you been a founder or senior executive at a startup that raised outside capital or was acquired?",
      "type": "yes_no",
      "required": true,
      "disqualify": { "equals": "no" }
    },
    {
      "key": "years_startups",
      "prompt": "How many years of work experience do you have with startups?",
      "type": "number",
      "required": true,
      "disqualify": { "less_than": 5 }
    },
    {
      "key": "years_bizdev",
      "prompt": "How many years of work experience do you have with business development?",
      "type": "number",
      "required": false,
      "disqualify": null
    }
  ]$q$::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title           = EXCLUDED.title,
  status          = EXCLUDED.status,
  location_text   = EXCLUDED.location_text,
  employment_type = EXCLUDED.employment_type,
  description     = EXCLUDED.description,
  questions       = EXCLUDED.questions,
  updated_at      = now();
