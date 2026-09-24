# Infrastructure

```
postgres/001_init.sql    production DDL: schema v7 + row-level security + views
```

## Today: Option B — the free tier (₹0–25/month)

The platform runs with **no external services**: `node:sqlite` is built into Node 22, the app is a single Next.js process, fonts are self-hosted, and there is no ORM, queue, cache server or object store to operate. A ₹500/month VPS or a serverless host runs the whole product for a pilot.

This is a deliberate choice from the plan's Option B, and it is honest about its ceiling: one process, one file database, one writer node.

## When to move: the trigger

Move to Option A (managed Postgres + object storage + edge CDN) when **any** of these becomes true:

| Signal | Why it forces the move |
| --- | --- |
| GMV > ₹5 L/month | money volume deserves point-in-time recovery and a database that a finance team can audit |
| More than one app instance | SQLite is single-writer; horizontal scale needs a real server |
| Long-running renders | async PDFs want a queue, not a request |
| Multi-region or a compliance review | RLS, audit and backup SLAs belong in the database |

## How to move

```bash
# 1. provision Postgres 15+ (RDS, Neon, Supabase, Cloud SQL)
psql "$DATABASE_URL" -f infrastructure/postgres/001_init.sql

# 2. point the app at it
export DATABASE_URL='postgres://…'
#    and set DATABASE_PATH='' so the SQLite path is not used

# 3. migrate the rows (the shapes are 1:1)
#    scripts/export.mjs writes JSONL per table; COPY loads it back in FK order.
```

The application code does not change: `@mazi/store` is the only module that knows SQL, and every repository method already returns plain objects. The seams that would need work are the ones listed in `docs/ARCHITECTURE.md` — files to object storage, heavy renders to a queue.

## Environment

See `.env.example` at the repository root for the full annotated list. The variables that matter operationally:

| Variable | Purpose |
| --- | --- |
| `DATABASE_PATH` | SQLite file (default `apps/web/data/mazi.db`) |
| `DATABASE_URL` | Postgres connection string (Option A) |
| `APP_URL` | canonical origin, used for metadata, QR codes and share links |
| `ASSISTANT_MONTHLY_USD_CAP` | hard ceiling on AI spend — the assistant refuses rather than overspends |
| `AI_PROVIDER`, `AI_API_KEY` | assistant backend; the deterministic parser is the default so the product works with no key at all |

## Backups

- SQLite: nightly `sqlite3 .backup` to object storage (safe on a live database, unlike `cp`), 30-day retention, plus a weekly restore drill.
- Postgres: automated snapshots + PITR; the ledger views (`ledger_unbalanced`) are the first thing to check after any restore.
