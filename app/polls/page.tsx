import { prisma } from '@/prisma/client'
import { PollFilters } from '@/components/poll-filters'
import { PollsTable } from '@/components/polls-table'
import { buildPollWhere, type PollFilterParams } from '@/lib/poll-filters-server'

export const revalidate = 300

export default async function PollsPage({
  searchParams,
}: {
  searchParams: Promise<PollFilterParams>
}) {
  const params = await searchParams
  const where = buildPollWhere(params)

  const [polls, states, pollsters, years] = await Promise.all([
    prisma.poll.findMany({
      where,
      orderBy: [{ endDate: 'desc' }, { id: 'desc' }],
      take: 500,
      include: {
        pollster: { select: { slug: true, name: true } },
        race: {
          select: {
            id: true,
            stateCode: true,
            district: true,
            electionYear: true,
            dCandidate: true,
            rCandidate: true,
            chamber: { select: { type: true, name: true } },
          },
        },
      },
    }),
    prisma.state.findMany({ orderBy: { name: 'asc' }, select: { code: true, name: true } }),
    prisma.pollster.findMany({ orderBy: { name: 'asc' }, select: { slug: true, name: true } }),
    prisma.race.findMany({ select: { electionYear: true }, distinct: ['electionYear'], orderBy: { electionYear: 'desc' } }),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">All polls</h1>
        <p className="text-sm text-muted-foreground">
          {polls.length === 500 ? 'Showing the 500 most recent matches. Narrow with filters.' : `Showing ${polls.length} polls.`}
        </p>
      </header>
      <PollFilters
        states={states.map((s) => ({ value: s.code, label: `${s.code} — ${s.name}` }))}
        pollsters={pollsters.map((p) => ({ value: p.slug, label: p.name }))}
        years={years.map((y) => y.electionYear)}
      />
      <PollsTable polls={polls} />
    </div>
  )
}
