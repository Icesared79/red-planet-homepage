"""Create/repair contact_submissions in the locked-down (service-role-only) state.

The contact form inserts via the SERVICE ROLE through /api/contact and reads the
row back server-side — it never uses the anon/publishable key. So this table
must NOT carry any anon/public policy or grant. Re-running this script asserts
that locked-down shape (idempotent): RLS on, all access revoked from
PUBLIC/anon/authenticated, service_role only. (Hardened 2026-06-19; Atlas
migration 20260619140000_drop_contact_anon_writepath.sql.)
"""
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

-- Default-deny lockdown. The form uses the service role; never grant anon.
DROP POLICY IF EXISTS contact_submissions_anon_insert   ON public.contact_submissions;
DROP POLICY IF EXISTS contact_submissions_public_insert ON public.contact_submissions;
REVOKE ALL ON public.contact_submissions FROM PUBLIC, anon, authenticated;
GRANT ALL  ON public.contact_submissions TO service_role;

DROP POLICY IF EXISTS service_role_full_access ON public.contact_submissions;
CREATE POLICY service_role_full_access
  ON public.contact_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
"""


def main():
    with psycopg2.connect(DB_URL) as conn:
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(SQL)
            cur.execute("""
                SELECT polname, polcmd, polroles::regrole[]
                FROM pg_policy
                WHERE polrelid = 'public.contact_submissions'::regclass
            """)
            print("Policies (expect service_role only):")
            for row in cur.fetchall():
                print(f"  {row}")
            cur.execute("""
                SELECT grantee, string_agg(privilege_type, ',' ORDER BY privilege_type)
                FROM information_schema.role_table_grants
                WHERE table_schema='public' AND table_name='contact_submissions'
                  AND grantee IN ('anon','authenticated','PUBLIC','service_role')
                GROUP BY grantee ORDER BY grantee
            """)
            print("Grants (expect service_role only):")
            for row in cur.fetchall():
                print(f"  {row[0]:14s} {row[1]}")


if __name__ == "__main__":
    main()
