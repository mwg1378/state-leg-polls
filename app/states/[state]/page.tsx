import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/prisma/client'
import { PollsTable } from '@/components/polls-table'
import { CHAMBER_TYPE_SHORT } from '@/lib/labels'
import { fmtMargin } from '@/lib/format'

export const revalidate = 300

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>
}) {
  const { state } = await params
  const code = state.toUpperCase()
  const stateRow = await prisma.state.findUnique({
    where: { code },
    include: {
      chambers: {
        orderBy: { type: 'asc' },
        include: {
          races: {
            where: { polls: { some: { status: 'PUBLISHED' } } },
            orderBy: [{ electionYear: 'desc' }, { district: 'asc' }],
            include: {
              _count: { select: { polls: { where: { status: 'PUBLISHED' } } } },
            },
          },
        },
      },
    },
  })
  if (!stateRow) return notFound()

  const recentPolls = await prisma.poll.findMany({
    where: { status: 'PUBLISHED', race: { stateCode: code } },
    orderBy: { endDate: 'desc' },
    take: 30,
    include: {
      pollster: { select: { slug: true, name: true } },
      race: {
        select: {
          id: true, stateCode: true, district: true, electionYear: true, dCandidate: true, rCandidate: true,
          chamber: { select: { type: true, name: true } },
        },
      },
    },
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
      <header className="space-y-1">
        <div className="text-sm uppercase tracking-wide text-muted-foreground">{stateRow.code}</div>
        <h1 className="text-2xl font-bold tracking-tight">{stateRow.name}</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Polled races by chamber</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {stateRow.chambers.map((c) => (
            <div key={c.id} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{c.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {c.races.length} polled race{c.races.length === 1 ? '' : 's'}
                </span>
              </div>
              {c.races.length === 0 ? (
                <div className="rounded border border-dashed border-border/60 px-3 py-4 text-xs text-muted-foreground">
                  No polled races yet.
                </div>
              ) : (
                <ul className="divide-y divide-border/40 rounded border border-border/60">
                  {c.races.map((r) => (
                    <li key={r.id}>
                      <Link href={`/races/${r.id}`} className="flex items-baseline justify-between px-3 py-2 hover:bg-muted/40">
                        <span className="font-medium">
                          {CHAMBER_TYPE_SHORT[c.type]} {r.district === 'At-Large' ? 'At-Large' : `District ${r.district}`}
                          <span className="ml-2 text-xs text-muted-foreground">{r.electionYear}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {r._count.polls} poll{r._count.polls === 1 ? '' : 's'}
                          {r.actualMargin != null ? ` · result ${fmtMargin(r.actualMargin)}` : ''}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent polls in {stateRow.name}</h2>
        <PollsTable polls={recentPolls} />
      </section>
    </div>
  )
}
