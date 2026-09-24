# Deployment

## The two options (and which one we are on)

The plan gave a choice, and this repository implements **Option B** while keeping Option A a configuration change rather than a rewrite.

| | **Option B — free/open-source tier (current)** | **Option A — managed cloud** |
| --- | --- | --- |
| Cost | ₹0–25 / month | ₹3,000–15,000 / month |
| Database | `node:sqlite` (built into Node 22) | managed PostgreSQL 15+ |
| App | one Next.js process | same app, N instances behind a load balancer |
| Files | app-local, served by Next | object storage + signed URLs |
| Renders | in-request | queue + worker |
| Cache | in-process + HTTP + CDN | + Redis where a shared cache is needed |
| Move when | — | GMV > ₹5 L/month, >1 instance, or a compliance review |

## Deploying Option B (pilot / demo)

```bash
git clone <repo> && cd MaziPrarika
npm ci
npm run db:reset                 # schema v7 + seeded marketplace
npm run build                    # production build of apps/web
npm run start -w @mazi/web       # PORT=3000 by default
```

On a single VPS behind Caddy or nginx:

```caddy
mazipatrika.in {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
```

Requirements and expectations:

- **Node ≥ 22.5** — `node:sqlite` is still flagged; the `db:*` scripts pass `--experimental-sqlite` for you, and Next runs it in-process.
- **One process, one writer.** Do not run two app instances against the same SQLite file; WAL handles readers, not multiple writers. This is the constraint that triggers the move to Option A.
- **Persist `apps/web/data/`** across deploys (or set `DATABASE_PATH` to a mounted volume). Wiping it wipes the marketplace.
- **Backups**: `sqlite3 data/mazi.db ".backup 'backup.db'"` on a schedule — safe on a live database, unlike copying the file.

### Serverless platforms

Anything that runs Node 22 with a writable volume works (Fly.io machines with a volume, Railway, Render with a disk, a plain VM). Serverless *functions* with an ephemeral filesystem do **not** work with SQLite — that is the point at which you take Option A. Vercel + Neon is the shortest path:

```bash
DATABASE_URL='postgres://…'  # after running infrastructure/postgres/001_init.sql
```

## Deploying Option A

1. `psql "$DATABASE_URL" -f infrastructure/postgres/001_init.sql` — creates schema v7 + RLS policies + `ledger_unbalanced` and `ledger_booking_totals` views.
2. Set the session variables the policies read, on every connection checkout:
   ```sql
   SET LOCAL mazi.user_id = '<the signed-in user>';
   SET LOCAL mazi.role    = 'customer' | 'vendor' | 'admin';
   ```
3. Move files (print proofs, exports) to object storage; replace local reads with signed URLs.
4. Move print PDF rendering to a queue worker — `renderPrintHtml` is a pure function, so the worker imports the same package.
5. Put a CDN in front for `/fonts`, `/icons` and `/_next/static` (they are already `immutable`).

## Environments

| | dev | staging | production |
| --- | --- | --- | --- |
| Database | `apps/web/data/mazi.db`, reseeded freely | a copy of production shape, synthetic data | real, backed up, no seed |
| Seed | `npm run db:reset` | `npm run db:seed` | never |
| Console logs | full | full | errors + audit-driven |
| Assistant | deterministic parser (no key needed) | deterministic + optional provider | provider with a monthly cap |
| `APP_URL` | `http://localhost:3000` | staging origin | canonical origin (used in metadata, QR codes, share links) |

## Pre-deploy checklist

```bash
npm run typecheck                # every package + the app
npm test                         # 205 unit tests
npm run build                    # 23 routes must compile
npm run db:stats                 # ledger balanced: yes
npm run test:e2e                 # 40 checks against a running server
```

Then confirm by hand on the deployed origin: `/`, `/create`, `/e/<slug>` (with JavaScript disabled — it must still render), `/studio/<slug>/invitation` (`?download=1` returns an SVG), `/vendors`, `/vendor`, `/admin`, `/panchang`, `/events`, `/manifest.webmanifest`, `/sw.js`, `/offline`.

## Observability

- `/api/health` — version, schema version, row counts, ledger balance, uptime. Wire it to the platform's health check; a deploy that unbalances the ledger should fail the check, not the customer.
- `audit_log` — every state change with actor, entity and before/after. "What happened to this booking?" is one indexed query.
- `metrics_daily` — 60 days of leads, quotes, bookings, GMV, commission, response times; the admin console charts it and the same table is the source for the plan's weekly review.
- Logs are structured ids and actions, never guest phone numbers.

## Local and demo operation

- **Never delete `apps/web/data/mazi.db` while the server runs.** Use `npm run db:reset`, which drops the tables in place, so a live dev server and the CLI stay on the same database file.
- **`next dev` writes to `.next-dev`, `next build` to `.next`.** They can run side by side; a production build no longer breaks a running dev server (and vice versa).
- **`npm run measure`** prints the SLO table from a production build. It needs a server on `:3100` (`npx next start -p 3100` in `apps/web`).
- **Seed ids are stable** (`evt_patil_vivah`, `lead_2`, `vnd_pune_kulkarni_studio`, `dsg_patil_main`) so screenshots, tests and the demo script stay reproducible.

## Rollback

- **Code**: redeploy the previous build; nothing in the app writes schema at boot except the idempotent `migrate()`.
- **Migrations**: forward-only by design. To undo a migration, ship a new one — do not hand-edit production.
- **Data**: restore from the last snapshot; then run `SELECT * FROM ledger_unbalanced` (Postgres) or `npm run db:stats` (SQLite) before reopening traffic. Money integrity is the gate.

## Secrets

Set through the platform's secret store; never in the repository. `.env.example` documents every variable and its default. Rotating `AI_API_KEY` must never break the product: with no key, the deterministic parser answers instead.

## What is intentionally not automated yet

- No CI pipeline file ships in this repository: the test commands above are the pipeline, and they run identically on a laptop and in any runner. Adding `.github/workflows/ci.yml` is a ten-line follow-up (see `docs/ROADMAP.md`).
- No infrastructure-as-code. One box and one database does not need Terraform; it needs a backup script. Terraform arrives with Option A.
