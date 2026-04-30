import os, psycopg2
url = os.environ["SUPABASE_DB_DIRECT_URL"]
with psycopg2.connect(url) as conn:
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute("""
          SELECT polname, polcmd, polroles::regrole[]::text[], pg_get_expr(polqual, polrelid), pg_get_expr(polwithcheck, polrelid)
          FROM pg_policy WHERE polrelid='public.contact_submissions'::regclass
        """)
        print("Policies on contact_submissions:")
        for row in cur.fetchall():
            print(f"  name={row[0]} cmd={row[1]} roles={row[2]} using={row[3]} check={row[4]}")
        cur.execute("""
          SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid='public.contact_submissions'::regclass
        """)
        print("RLS state:", cur.fetchone())
        cur.execute("""
          SELECT grantee, privilege_type FROM information_schema.role_table_grants
          WHERE table_schema='public' AND table_name='contact_submissions' ORDER BY grantee, privilege_type
        """)
        print("Grants:")
        for row in cur.fetchall():
            print(f"  {row}")
        # Try insert as anon
        cur.execute("SET ROLE anon;")
        try:
            cur.execute("""
              INSERT INTO public.contact_submissions(name, email, company, building, source)
              VALUES ('debug', 'debug@debug', 'debug', 'debug', 'debug') RETURNING id
            """)
            row = cur.fetchone()
            print(f"Anon insert OK, id={row[0]}")
            cur.execute("RESET ROLE; DELETE FROM public.contact_submissions WHERE name='debug';")
        except Exception as e:
            print(f"Anon insert FAILED: {e}")
            cur.execute("ROLLBACK")
            cur.execute("RESET ROLE")
