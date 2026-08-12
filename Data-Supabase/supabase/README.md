# Supabase database backup

`backup.sql` is a logical backup of the complete application database in the
`public` schema. It contains the schema, rows, sequences, constraints, indexes,
functions, triggers, grants, and row-level-security configuration.

The backup intentionally excludes Supabase-managed schemas (`auth`, `storage`,
`realtime`, and internal schemas), connection strings, API keys, and environment
secrets. At backup time, `auth.users` and Storage contained no user/object data;
the application's account records are stored in `public` and are included.

## Restore

Create a fresh Supabase project, copy its Session Pooler connection string, then
run:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/backup.sql
```

Use a PostgreSQL client version equal to or newer than the target server. Keep
`DATABASE_URL` in the environment only; never commit it.

## Backup snapshot

- Generated: 2026-08-11 (Asia/Jakarta)
- Source PostgreSQL: 17.6
- Schema: `public`
- Tables: 15
- Source database size: approximately 12 MB

This repository must remain private because the dump contains application data,
including student/teacher identifiers and password hashes.
