# state-leg-polls

A best-effort exhaustive aggregator of polls on state legislative general elections — all 50 states, both chambers, since 2017. Includes both nonpartisan/public polls and clearly-labeled partisan internals, with race history pages and pollster accuracy stats.

Live: https://state-leg-polls.vercel.app

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Prisma ORM (`prisma-client` generator) on Supabase Postgres
- Anthropic Claude for source extraction (research pass + weekly cron)
- Recharts for race timelines

## Local development

```bash
cp .env.local.example .env.local   # if present, otherwise see SETTINGS.md from app-factory
npm install
npx prisma generate
npm run db:push   # if schema changed
npm run db:seed   # seeds states, chambers, pollsters, source feeds
npm run dev       # http://localhost:3007
```

## Data ingestion

Two pipelines feed the database, both producing `PENDING` polls that require human review.

### One-time research pass

Orchestrator that dispatches Claude across (state × cycle) slices via web search.

```bash
npm run research:seed                       # all 50 states × 2017–2025
npm run research:seed -- --state=VA         # single state
npm run research:seed -- --year=2023        # single cycle
npm run research:seed -- --state=NJ --year=2025 --concurrency=2
```

Output goes to `seed/polls-YYYY-MM-DD.jsonl`. Then:

```bash
npm run research:import -- seed/polls-YYYY-MM-DD.jsonl   # → DB as PENDING
npm run research:review                                  # interactive approval
# or:
npm run research:review -- --approve-all                 # bulk publish
npm run research:review -- --count                       # show pending count
```

### Weekly cron

`/api/cron/scan-sources` (Mondays 14:00 UTC, defined in `vercel.json`) iterates active rows in the `Source` table, fetches each URL, and asks Claude to extract any new state-leg poll references — also written as `PENDING`.

Add new sources via the DB:

```sql
INSERT INTO sources (id, url, label, kind, "isActive")
VALUES ('manual1', 'https://example.com/polls', 'Example pollster archive', 'HTML', true);
```

## Deployment

```bash
vercel --prod --scope=mwg1378-gmailcoms-projects
```

Required env vars in Vercel: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`.

## License

Code: MIT. Data: caveat lector — see `/about` for methodology and limitations.
