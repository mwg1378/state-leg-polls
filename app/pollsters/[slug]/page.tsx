import { notFound } from 'next/navigation'
import { prisma } from '@/prisma/client'
import { PollsTable } from '@/components/polls-table'
import { AccuracyCard } from '@/components/accuracy-card'
import { computeStats, type ScoredPoll } from '@/lib/accuracy'
import { PARTISAN_LEAN_LABELS } from '@/lib/labels'

export const revalidate = 300

export default async function PollsterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pollster = await prisma.pollster.findUnique({
    where: { slug },
    include: {
      polls: {
        where: { status: 'PUBLISHED' },
        orderBy: [{ endDate: 'desc' }, { id: 'desc' }],
        include: {
          pollster: { select: { slug: true, name: true } },
          race: {
            select: {
              id: true, stateCode: true, district: true, electionYear: true, dCandidate: true, rCandidate: true,
              actualMargin: true,
              chamber: { select: { type: true, name: true } },
            },
          },
        },
      },
    },
  })
  if (!pollster) return notFound()

  const scoreable: ScoredPoll[] = pollster.polls
    .filter((p) => p.race.actualMargin != null)
    .map((p) => ({
      margin: p.margin,
      daysToElection: p.daysToElection,
      sponsorType: p.sponsorType,
      electionYear: p.race.electionYear,
      actualMargin: p.race.actualMargin as number,
    }))

  const stats = computeStats(scoreable)
  const within30 = computeStats(scoreable.filter((s) => s.daysToElection <= 30))

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-8">
      <header className="space-y-1">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">Pollster</div>
        <h1 className="text-2xl font-bold tracking-tight">{pollster.name}</h1>
        <div className="text-sm text-muted-foreground">
          {PARTISAN_LEAN_LABELS[pollster.defaultPartisanLean]} · {pollster.polls.length} state-leg poll{pollster.polls.length === 1 ? '' : 's'}
          {pollster.websiteUrl ? (
            <>
              {' · '}
              <a href={pollster.websiteUrl} target="_blank" rel="noopener" className="hover:text-foreground hover:underline">
                website ↗
              </a>
            </>
          ) : null}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <AccuracyCard title="All scoreable polls" sub="Races with known result" stats={stats} />
        <AccuracyCard title="Within 30 days of election" sub="Races with known result" stats={within30} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Polls</h2>
        <PollsTable polls={pollster.polls} />
      </section>
    </div>
  )
}
