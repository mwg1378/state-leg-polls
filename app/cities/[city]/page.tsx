import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/prisma/client'
import { PollsTable } from '@/components/polls-table'
import { RACE_TYPE_LABELS } from '@/lib/labels'
import { fmtDate, fmtNum } from '@/lib/format'
import { toPollRow } from '@/app/page'

export const revalidate = 300

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city: citySlug } = await params
  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
    include: {
      races: {
        where: { polls: { some: { status: 'PUBLISHED' } } },
        orderBy: [{ electionDate: 'desc' }],
        include: {
          _count: { select: { polls: { where: { status: 'PUBLISHED' } } } },
        },
      },
    },
  })
  if (!city) return notFound()

  const recentPollsRaw = await prisma.poll.findMany({
    where: { status: 'PUBLISHED', race: { citySlug } },
    orderBy: { endDate: 'desc' },
    take: 30,
    include: {
      pollster: { select: { slug: true, name: true } },
      race: {
        select: {
          id: true, citySlug: true, raceType: true, electionYear: true, party: true,
          city: { select: { name: true, stateCode: true } },
        },
      },
    },
  })
  const recentPolls = recentPollsRaw.map(toPollRow)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
      <header className="space-y-1">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">{city.stateCode}</div>
        <h1 className="text-2xl font-bold tracking-tight">{city.name}</h1>
        <div className="text-sm text-muted-foreground">Population {fmtNum(city.population)}</div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Polled races</h2>
        {city.races.length === 0 ? (
          <div className="rounded border border-dashed border-border/60 px-6 py-8 text-center text-sm text-muted-foreground">
            No polled races yet.
          </div>
        ) : (
          <ul className="divide-y divide-border/40 rounded border border-border/60">
            {city.races.map((r) => (
              <li key={r.id}>
                <Link href={`/races/${r.id}`} className="flex items-baseline justify-between px-4 py-3 hover:bg-muted/40">
                  <span>
                    <span className="font-medium">{RACE_TYPE_LABELS[r.raceType]}</span>
                    {r.party ? <span className="ml-2 text-xs text-muted-foreground">({r.party})</span> : null}
                    <span className="ml-2 text-sm text-muted-foreground">{fmtDate(r.electionDate)}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r._count.polls} poll{r._count.polls === 1 ? '' : 's'}
                    {r.winnerName ? ` · ${r.winnerName} won` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent polls in {city.name}</h2>
        <PollsTable polls={recentPolls} />
      </section>
    </div>
  )
}
