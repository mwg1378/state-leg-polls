import Link from 'next/link'
import { prisma } from '@/prisma/client'

export const revalidate = 300

export default async function StatesIndex() {
  const states = await prisma.state.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { races: true } },
      races: { select: { _count: { select: { polls: true } } } },
    },
  })

  const rows = states.map((s) => ({
    code: s.code,
    name: s.name,
    pollCount: s.races.reduce((sum, r) => sum + r._count.polls, 0),
    raceCount: s._count.races,
  }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">States</h1>
        <p className="text-sm text-muted-foreground">Click a state to see its chambers, polled races, and recent polls.</p>
      </header>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {rows.map((s) => (
          <Link
            key={s.code}
            href={`/states/${s.code}`}
            className="group flex items-baseline justify-between rounded border border-border/60 px-3 py-2 hover:border-border hover:bg-muted/40"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.code}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono tabular-nums">{s.pollCount}</div>
              <div className="text-xs text-muted-foreground">polls</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
