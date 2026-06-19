"""DISABLED 2026-06-19 — do not re-create a public/anon write path.

This script used to create `contact_submissions_public_insert` (FOR INSERT
TO public WITH CHECK (true)) — an even broader exposure than the anon policy.
The contact form inserts via the SERVICE ROLE through /api/contact, so no
anon/public policy is needed. The anon write path was dropped as a security
hardening (Atlas migration 20260619140000_drop_contact_anon_writepath.sql).
Re-creating a public/anon insert policy would re-open a consumer-less write
path and trip the daily security scanner. Make any deliberate change in a
migration instead.
"""
import sys

print(__doc__)
print("Refusing to run: this script would re-open a public/anon write path.")
sys.exit(1)
