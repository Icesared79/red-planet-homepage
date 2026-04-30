import os, psycopg2
url = os.environ["SUPABASE_DB_DIRECT_URL"]
SQL = """
DROP POLICY IF EXISTS contact_submissions_anon_insert ON public.contact_submissions;
DROP POLICY IF EXISTS contact_submissions_public_insert ON public.contact_submissions;
CREATE POLICY contact_submissions_public_insert
  ON public.contact_submissions
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (true);
"""
with psycopg2.connect(url) as conn:
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(SQL)
        cur.execute("""
          SELECT polname, polcmd, polroles::regrole[]::text[], pg_get_expr(polwithcheck, polrelid), polpermissive
          FROM pg_policy WHERE polrelid='public.contact_submissions'::regclass
        """)
        print("Policies after fix:")
        for row in cur.fetchall():
            print(f"  {row}")

        # Test as anon
        cur.execute("SET ROLE anon;")
        try:
            cur.execute("""
              INSERT INTO public.contact_submissions(name, email, company, building)
              VALUES ('debug', 'debug@x.y', 'debug', 'debug') RETURNING id
            """)
            print(f"Anon insert OK: {cur.fetchone()[0]}")
        except Exception as e:
            print(f"Anon insert FAILED: {e}")
        finally:
            cur.execute("RESET ROLE")
            cur.execute("DELETE FROM public.contact_submissions WHERE name='debug'")
