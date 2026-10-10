-- The job board behind /jobs on redplanetdata.com (COFOUNDER-2.2, 2026-10-10).
--
-- Two tables and one bucket, so that adding a posting is an INSERT and never a
-- deploy. Page code holds no posting text, no screening question and no
-- disqualifying answer: all of it is a row here, read at request time and
-- revalidated every five minutes.
--
-- Resumes live in the existing private `resumes` bucket (public = false, 10 MB
-- ceiling, PDF/.doc/.docx only -- storage enforces all three). No public URL is
-- ever minted for one; the notification email carries a signed link that expires
-- in 30 days.
--
-- RLS is ON with no policy on either table, which denies anon and authenticated
-- outright. Both read and write paths run from the Next.js server with the
-- service role, which bypasses RLS. Applications carry names, email addresses
-- and resume paths, so nothing here may be readable from a browser.

CREATE TABLE IF NOT EXISTS public.job_postings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  location_text   text NOT NULL,
  employment_type text NOT NULL,
  -- Paragraphs separated by a blank line. A line starting "- " is a bullet.
  -- {records} and {sources} are substituted at render time from the canonical
  -- metrics the docs site reads, so no count is ever typed into a row.
  description     text NOT NULL,
  -- [{key, prompt, type: 'yes_no'|'number', required: bool,
  --   disqualify: {equals:'no'} | {less_than: 5} | null}]
  questions       jsonb NOT NULL DEFAULT '[]'::jsonb,
  posted_at       timestamptz NOT NULL DEFAULT now(),
  -- Lower sorts first on /jobs; ties fall back to posted_at descending.
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_id      uuid NOT NULL REFERENCES public.job_postings(id) ON DELETE RESTRICT,
  -- Denormalised so an application can be read without the posting join.
  posting_slug    text NOT NULL,
  full_name       text NOT NULL,
  email           text NOT NULL,
  linkedin_url    text NOT NULL,
  note            text,
  -- [{key, prompt, type, answer}] -- the question text as it was shown, so a
  -- later edit to the posting cannot rewrite what someone was actually asked.
  answers         jsonb NOT NULL DEFAULT '[]'::jsonb,
  resume_path     text,
  resume_filename text,
  resume_bytes    bigint,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- The 3-per-email-per-posting cap counts on exactly this pair.
CREATE INDEX IF NOT EXISTS job_applications_posting_email_idx
  ON public.job_applications (posting_id, lower(email));
CREATE INDEX IF NOT EXISTS job_applications_created_idx
  ON public.job_applications (created_at DESC);

ALTER TABLE public.job_postings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.job_postings     FROM anon, authenticated;
REVOKE ALL ON public.job_applications FROM anon, authenticated;
