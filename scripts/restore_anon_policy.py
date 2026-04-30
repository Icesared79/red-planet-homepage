import os, psycopg2
url = os.environ["SUPABASE_DB_DIRECT_URL"]
SQL = """
DROP POLICY IF EXISTS contact_submissions_public_insert ON public.contact_submissions;
DROP POLICY IF EXISTS contact_submissions_anon_insert ON public.contact_submissions;
CREATE POLICY contact_submissions_anon_insert
  ON public.contact_submissions
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);
"""
with psycopg2.connect(url) as conn:
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(SQL)
        cur.execute("""
          SELECT polname, polcmd, polroles::regrole[]::text[], pg_get_expr(polwithcheck, polrelid), polpermissive
          FROM pg_policy WHERE polrelid='public.contact_submissions'::regclass
          ORDER BY polname
        """)
        print("Final policy state:")
        for row in cur.fetchall():
            print(f"  {row}")
