import Link from 'next/link'
import { prisma } from '@/prisma/client'
import { computeStats, type ScoredPoll } from '@/lib/accuracy'
import { PARTISAN_LEAN_LABELS } from '@/lib/labels'

export const revalidate = 300

export default async function PollstersIndex() {
  const pollsters = await prisma.pollster.findMany({
    orderBy: { name: 'asc' },
    include: {
      polls: {
        where: { status: 'PUBLISHED' },
        select: {
          margin: true,
          daysToElection: true,
          sponsorType: true,
          race: { select: { actualMargin: true, electionYear: true } },
        },
      },
    },
  })

  const rows = pollsters
    .map((p) => {
      const scoreable: ScoredPoll[] = p.polls
        .filter((x) => x.race.actualMargin != null)
        .map((x) => ({
          margin: x.margin,
          daysToElection: x.daysToElection,
          sponsorType: x.sponsorType,
          electionYear: x.race.electionYear,
          actualMargin: x.race.actualMargin as number,
        }))
      return {
        slug: p.slug,
        name: p.name,
        lean: p.defaultPartisanLean,
        pollCount: p.polls.length,
        stats: computeStats(scoreable),
      }
    })
    .sort((a, b) => b.pollCount - a.pollCount)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Pollsters</h1>
        <p className="text-sm text-muted-foreground">
          Pollsters who have released or sponsored at least one state legislative poll. Accuracy stats only count
          polls in races whose results are known.
        </p>
      </header>
      <div className="overflow-x-auto rounded border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left font-medium">Pollster</th>
              <th className="px-3 py-2 text-left font-medium">Lean</th>
              <th className="px-3 py-2 text-left font-medium">Polls</th>
              <th className="px-3 py-2 text-left font-medium">Within 3 pts</th>
              <th className="px-3 py-2 text-left font-medium">Median |error|</th>
              <th className="px-3 py-2 text-left font-medium">Mean error (D−R)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-border/40 hover:bg-muted/40">
                <td className="px-3 py-2 align-top">
                  <Link href={`/pollsters/${r.slug}`} className="font-medium hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="px-3 py-2 align-top text-xs text-muted-foreground">{PARTISAN_LEAN_LABELS[r.lean]}</td>
                <td className="px-3 py-2 align-top font-mono tabular-nums">{r.pollCount}</td>
                <td className="px-3 py-2 align-top font-mono tabular-nums">
                  {r.stats.pctWithin3 == null ? '—' : `${r.stats.pctWithin3.toFixed(0)}%`}
                  <span className="ml-1 text-xs text-muted-foreground">(n={r.stats.n})</span>
                </td>
                <td className="px-3 py-2 align-top font-mono tabular-nums">
                  {r.stats.medianAbsError == null ? '—' : `${r.stats.medianAbsError.toFixed(1)}`}
                </td>
                <td className="px-3 py-2 align-top font-mono tabular-nums">
                  {r.stats.meanSignedError == null
                    ? '—'
                    : `${r.stats.meanSignedError > 0 ? '+' : r.stats.meanSignedError < 0 ? '−' : ''}${Math.abs(r.stats.meanSignedError).toFixed(1)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
