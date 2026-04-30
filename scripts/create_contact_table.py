"""Create contact_submissions table with RLS + anon insert policy in Atlas Supabase."""
import os
import sys
import psycopg2

DB_URL = os.environ.get("SUPABASE_DB_DIRECT_URL")
if not DB_URL:
    print("SUPABASE_DB_DIRECT_URL not set in environment.")
    sys.exit(1)

SQL = """
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  email       text NOT NULL,
  company     text NOT NULL,
  building    text NOT NULL,
  source      text,
  status      text NOT NULL DEFAULT 'new'
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contact_submissions_anon_insert ON public.contact_submissions;
CREATE POLICY contact_submissions_anon_insert
  ON public.contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

GRANT INSERT ON public.contact_submissions TO anon;
GRANT USAGE ON SCHEMA public TO anon;
"""

def main():
    with psycopg2.connect(DB_URL) as conn:
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(SQL)
            cur.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema='public' AND table_name='contact_submissions'
                ORDER BY ordinal_position
            """)
            print("Columns:")
            for row in cur.fetchall():
                print(f"  {row[0]:12s} {row[1]:20s} nullable={row[2]:3s} default={row[3]}")
            cur.execute("""
                SELECT polname, polcmd, polroles::regrole[]
                FROM pg_policy
                WHERE polrelid = 'public.contact_submissions'::regclass
            """)
            print("Policies:")
            for row in cur.fetchall():
                print(f"  {row}")
            cur.execute("""
                SELECT relrowsecurity FROM pg_class
                WHERE oid = 'public.contact_submissions'::regclass
            """)
            print(f"RLS enabled: {cur.fetchone()[0]}")

if __name__ == "__main__":
    main()
