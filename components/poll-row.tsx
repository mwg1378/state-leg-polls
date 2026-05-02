import Link from 'next/link'
import { fmtDateRange, fmtNum, fmtPct } from '@/lib/format'
import { SponsorBadge } from '@/components/sponsor-badge'
import { partyColor, RACE_TYPE_SHORT } from '@/lib/labels'
import type { Population, RaceType, SponsorType } from '@db/enums'

export type Candidate = { name: string; party?: string | null; pct: number }

export type PollRowData = {
  id: string
  startDate: Date | string
  endDate: Date | string
  daysToElection: number
  sponsor: string
  sponsorType: SponsorType
  candidates: Candidate[]
  topName: string
  topPct: number
  runnerUpName: string | null
  runnerUpPct: number | null
  topMargin: number
  undecidedPct: number
  sampleSize: number | null
  population: Population
  sourceUrl: string
  pollster: { slug: string; name: string }
  race: {
    id: string
    citySlug: string
    raceType: RaceType
    electionYear: number
    party: string | null
    city: { name: string; stateCode: string }
  }
}

export function PollRow({ poll, showRace = true }: { poll: PollRowData; showRace?: boolean }) {
  const r = poll.race
  return (
    <tr className="border-b border-border/40 hover:bg-muted/40">
      {showRace ? (
        <td className="px-3 py-2 align-top">
          <Link href={`/races/${r.id}`} className="font-medium hover:underline">
            {r.city.name}, {r.city.stateCode}
          </Link>
          <div className="text-xs text-muted-foreground">
            {r.electionYear} · {RACE_TYPE_SHORT[r.raceType]}
            {r.party ? ` (${r.party})` : ''}
          </div>
        </td>
      ) : null}
      <td className="px-3 py-2 align-top">
        <div className="text-sm">{fmtDateRange(poll.startDate, poll.endDate)}</div>
        <div className="text-xs text-muted-foreground">{poll.daysToElection}d to election</div>
      </td>
      <td className="px-3 py-2 align-top">
        <Link href={`/pollsters/${poll.pollster.slug}`} className="text-sm hover:underline">
          {poll.pollster.name}
        </Link>
      </td>
      <td className="px-3 py-2 align-top">
        <SponsorBadge sponsor={poll.sponsor} sponsorType={poll.sponsorType} compact />
      </td>
      <td className="px-3 py-2 align-top text-sm">
        <div className="space-y-0.5">
          {poll.candidates.slice(0, 4).map((c, i) => (
            <div key={i} className="flex items-baseline gap-2 leading-tight">
              <span className={`text-xs ${partyColor(c.party)}`}>{c.party ?? ''}</span>
              <span className="font-medium">{shortName(c.name)}</span>
              <span className="ml-auto font-mono tabular-nums">{c.pct.toFixed(1)}</span>
            </div>
          ))}
          {poll.candidates.length > 4 ? (
            <div className="text-xs text-muted-foreground">+{poll.candidates.length - 4} more</div>
          ) : null}
          {poll.undecidedPct > 0 ? (
            <div className="text-xs text-muted-foreground">und {poll.undecidedPct.toFixed(0)}%</div>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-2 align-top text-sm font-mono">+{poll.topMargin.toFixed(1)}</td>
      <td className="px-3 py-2 align-top text-xs text-muted-foreground">
        {poll.sampleSize ? `${fmtNum(poll.sampleSize)} ${poll.population === 'LV' ? 'LV' : poll.population === 'RV' ? 'RV' : poll.population === 'A' ? 'A' : ''}` : '—'}
      </td>
      <td className="px-3 py-2 align-top">
        <a
          href={poll.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          source ↗
        </a>
      </td>
    </tr>
  )
}

export function PollTableHeader({ showRace = true }: { showRace?: boolean }) {
  return (
    <thead className="sticky top-0 bg-background text-xs uppercase tracking-wide text-muted-foreground">
      <tr className="border-b border-border">
        {showRace ? <th className="px-3 py-2 text-left font-medium">Race</th> : null}
        <th className="px-3 py-2 text-left font-medium">Field dates</th>
        <th className="px-3 py-2 text-left font-medium">Pollster</th>
        <th className="px-3 py-2 text-left font-medium">Sponsor</th>
        <th className="px-3 py-2 text-left font-medium">Top candidates</th>
        <th className="px-3 py-2 text-left font-medium">Lead</th>
        <th className="px-3 py-2 text-left font-medium">Sample</th>
        <th className="px-3 py-2 text-left font-medium">Source</th>
      </tr>
    </thead>
  )
}

function shortName(name: string): string {
  // Take last word as a heuristic short label.
  const parts = name.replace(/\(.+?\)/g, '').trim().split(/\s+/)
  return parts.length > 1 ? parts[parts.length - 1] : name
}
