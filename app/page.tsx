import Link from 'next/link'
import { prisma } from '@/prisma/client'
import { PollsTable } from '@/components/polls-table'
import { fmtNum } from '@/lib/format'

export const revalidate = 300

export default async function Home() {
  const [pollCount, raceCount, states, recentPolls] = await Promise.all([
    prisma.poll.count({ where: { status: 'PUBLISHED' } }),
    prisma.race.count({ where: { polls: { some: { status: 'PUBLISHED' } } } }),
    prisma.state.findMany({
      where: { races: { some: { polls: { some: { status: 'PUBLISHED' } } } } },
      select: { code: true },
    }),
    prisma.poll.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { endDate: 'desc' },
      take: 25,
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
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">State legislative polling, 2017–present</h1>
        <p className="max-w-2xl text-muted-foreground">
          A best-effort exhaustive aggregator of polls on state legislative general elections — all 50 states,
          both chambers. Includes both nonpartisan public polls and clearly-labeled partisan internals.
        </p>
        <div className="flex gap-6 text-sm">
          <Stat label="Polls" value={fmtNum(pollCount)} />
          <Stat label="Races polled" value={fmtNum(raceCount)} />
          <Stat label="States with polling" value={`${states.length} / 50`} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent polls</h2>
          <Link href="/polls" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            See all polls →
          </Link>
        </div>
        <PollsTable polls={recentPolls} />
      </section>

      <section className="rounded border border-border/60 bg-muted/30 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold">How accurate are state legislative polls?</h2>
          <Link href="/accuracy" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            Full breakdown →
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          We score every poll against the actual D−R margin for races whose results are known.
          See accuracy by days-to-election, sponsor type, and cycle.
        </p>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
