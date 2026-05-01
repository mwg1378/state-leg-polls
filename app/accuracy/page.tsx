import { prisma } from '@/prisma/client'
import { AccuracyCard } from '@/components/accuracy-card'
import { computeStats, DAYS_BUCKETS, filterBySponsor, inDaysBucket, type ScoredPoll } from '@/lib/accuracy'

export const revalidate = 300

export default async function AccuracyPage() {
  const rows = await prisma.poll.findMany({
    where: {
      status: 'PUBLISHED',
      race: { actualMargin: { not: null } },
    },
    select: {
      margin: true,
      daysToElection: true,
      sponsorType: true,
      race: { select: { actualMargin: true, electionYear: true } },
    },
  })

  const polls: ScoredPoll[] = rows.map((r) => ({
    margin: r.margin,
    daysToElection: r.daysToElection,
    sponsorType: r.sponsorType,
    electionYear: r.race.electionYear,
    actualMargin: r.race.actualMargin as number,
  }))

  const overall = computeStats(polls)
  const cycles = Array.from(new Set(polls.map((p) => p.electionYear))).sort((a, b) => b - a)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Pollster accuracy</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Every poll in our database whose race has a known result is scored against the actual D−R margin.
          We report % of polls landing within 3 and 5 points, the median absolute error, and the mean signed
          error (positive = D-leaning bias). All slices are independent — a poll counts in every applicable cut.
        </p>
        <div className="text-xs text-muted-foreground">In scope: {polls.length} polls</div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">By days to election</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AccuracyCard title="All polls (any timing)" stats={overall} />
          {DAYS_BUCKETS.map((b) => (
            <AccuracyCard
              key={b.id}
              title={b.label}
              stats={computeStats(polls.filter((p) => inDaysBucket(p.daysToElection, b.id)))}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">By sponsor type (within 30 days)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(['all', 'nonpartisan', 'D', 'R'] as const).map((cut) => {
            const subset = filterBySponsor(
              polls.filter((p) => p.daysToElection <= 30),
              cut,
            )
            return (
              <AccuracyCard
                key={cut}
                title={
                  cut === 'all'
                    ? 'All sponsors'
                    : cut === 'nonpartisan'
                      ? 'Nonpartisan / news'
                      : cut === 'D'
                        ? 'D-sponsored'
                        : 'R-sponsored'
                }
                sub="≤30 days to election"
                stats={computeStats(subset)}
              />
            )
          })}
        </div>
      </section>

      {cycles.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">By cycle</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cycles.map((y) => (
              <AccuracyCard
                key={y}
                title={String(y)}
                sub="all timings"
                stats={computeStats(polls.filter((p) => p.electionYear === y))}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
