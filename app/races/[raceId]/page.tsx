import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/prisma/client'
import { PollsTable } from '@/components/polls-table'
import { RacePollChart } from '@/components/race-poll-chart'
import { fmtDate, fmtMargin, fmtPct } from '@/lib/format'
import { CHAMBER_TYPE_SHORT } from '@/lib/labels'

export const revalidate = 300

export default async function RacePage({
  params,
}: {
  params: Promise<{ raceId: string }>
}) {
  const { raceId } = await params
  const race = await prisma.race.findUnique({
    where: { id: raceId },
    include: {
      state: true,
      chamber: true,
      polls: {
        where: { status: 'PUBLISHED' },
        orderBy: [{ endDate: 'desc' }, { id: 'desc' }],
        include: {
          pollster: { select: { slug: true, name: true } },
          race: {
            select: {
              id: true, stateCode: true, district: true, electionYear: true, dCandidate: true, rCandidate: true,
              chamber: { select: { type: true, name: true } },
            },
          },
        },
      },
    },
  })
  if (!race) return notFound()

  const avgMargin =
    race.polls.length > 0
      ? race.polls.reduce((s, p) => s + p.margin, 0) / race.polls.length
      : null

  const chartPoints = race.polls.map((p) => ({
    endDate: p.endDate.toString(),
    margin: p.margin,
    pollster: p.pollster.name,
    sponsor: p.sponsor,
    sponsorType: p.sponsorType,
  }))

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <Link href={`/states/${race.stateCode}`} className="hover:text-foreground hover:underline">
            {race.state.name}
          </Link>{' '}
          · {race.chamber.name}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {CHAMBER_TYPE_SHORT[race.chamber.type]}{' '}
          {race.district === 'At-Large' ? 'At-Large' : `District ${race.district}`} — {race.electionYear}
          {race.isSpecial ? <span className="ml-2 text-base font-medium text-muted-foreground">(Special)</span> : null}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>Election: {fmtDate(race.electionDate)}</span>
          {race.dCandidate ? <span><span className="text-blue-400">D:</span> {race.dCandidate}</span> : null}
          {race.rCandidate ? <span><span className="text-red-400">R:</span> {race.rCandidate}</span> : null}
          {race.otherCandidates ? <span>Other: {race.otherCandidates}</span> : null}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryStat label="Polls" value={String(race.polls.length)} />
        <SummaryStat label="Poll average (D−R)" value={fmtMargin(avgMargin)} />
        <SummaryStat
          label="Actual result (D−R)"
          value={
            race.actualMargin != null
              ? `${fmtMargin(race.actualMargin)} · ${fmtPct(race.actualDPct)} / ${fmtPct(race.actualRPct)}`
              : 'Not yet known'
          }
        />
      </section>

      {chartPoints.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Margin over time</h2>
          <div className="rounded border border-border/60 p-3">
            <RacePollChart
              points={chartPoints}
              electionDate={race.electionDate.toString()}
              actualMargin={race.actualMargin}
            />
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All polls</h2>
        <PollsTable polls={race.polls} showRace={false} />
      </section>

      {race.notes ? (
        <section>
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{race.notes}</p>
        </section>
      ) : null}
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border/60 p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-mono tabular-nums">{value}</div>
    </div>
  )
}
