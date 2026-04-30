import os, psycopg2
url = os.environ["SUPABASE_DB_DIRECT_URL"]
with psycopg2.connect(url) as conn:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, created_at, name, email, company, left(building, 60), source, status
            FROM public.contact_submissions
            ORDER BY created_at DESC LIMIT 5
        """)
        print("Latest 5 contact_submissions:")
        for row in cur.fetchall():
            print(f"  {row}")
