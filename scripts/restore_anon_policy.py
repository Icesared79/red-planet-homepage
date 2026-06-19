"""DISABLED 2026-06-19 — do not re-create the anon write path.

This script used to (re)create the `contact_submissions_anon_insert` policy
back when the contact form inserted directly with the anon/publishable key.
The form no longer does that: it POSTs to /api/contact, which inserts with the
SERVICE ROLE (app/api/contact/route.ts) and reads the row back server-side.

The anon INSERT policy + grant were dropped as a security hardening (Atlas
migration 20260619140000_drop_contact_anon_writepath.sql). Re-creating them
would re-open a public write path with no consumer and trip the daily security
scanner. If the form ever needs anon again, do it deliberately in a migration —
not via this script.
"""
import sys

print(__doc__)
print("Refusing to run: this script would re-open the dropped anon write path.")
sys.exit(1)
