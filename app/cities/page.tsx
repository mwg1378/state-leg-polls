import Link from 'next/link'
import { prisma } from '@/prisma/client'
import { fmtNum } from '@/lib/format'

export const revalidate = 300

export default async function CitiesIndex() {
  const cities = await prisma.city.findMany({
    orderBy: [{ population: 'desc' }],
    include: {
      _count: { select: { races: true } },
      races: { select: { _count: { select: { polls: { where: { status: 'PUBLISHED' } } } } } },
    },
  })

  const rows = cities.map((c) => ({
    slug: c.slug,
    name: c.name,
    state: c.stateCode,
    pop: c.population,
    pollCount: c.races.reduce((s, r) => s + r._count.polls, 0),
    raceCount: c._count.races,
  }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Cities</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} US cities with population ≥ 200K. Sorted by population. Cities with at least one poll
          are highlighted.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <Link
            key={c.slug}
            href={`/cities/${c.slug}`}
            className={`flex items-baseline justify-between rounded border px-3 py-2 transition-colors ${
              c.pollCount > 0
                ? 'border-border hover:bg-muted/50'
                : 'border-border/40 text-muted-foreground hover:bg-muted/30'
            }`}
          >
            <div>
              <div className="font-medium">{c.name}, {c.state}</div>
              <div className="text-xs text-muted-foreground">pop. {fmtNum(c.pop)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono tabular-nums">{c.pollCount}</div>
              <div className="text-xs text-muted-foreground">polls</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
