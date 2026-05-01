import Link from 'next/link'
import { fmtDateRange, fmtMargin, fmtNum, fmtPct } from '@/lib/format'
import { SponsorBadge } from '@/components/sponsor-badge'
import type { ChamberType, Population, SponsorType } from '@/lib/generated/prisma/enums'

export type PollRowData = {
  id: string
  startDate: Date | string
  endDate: Date | string
  daysToElection: number
  sponsor: string
  sponsorType: SponsorType
  dPct: number
  rPct: number
  otherPct: number
  undecidedPct: number
  margin: number
  sampleSize: number | null
  population: Population
  sourceUrl: string
  pollster: { slug: string; name: string }
  race: {
    id: string
    stateCode: string
    district: string
    electionYear: number
    dCandidate: string | null
    rCandidate: string | null
    chamber: { type: ChamberType; name: string }
  }
}

export function PollRow({ poll, showRace = true }: { poll: PollRowData; showRace?: boolean }) {
  const r = poll.race
  return (
    <tr className="border-b border-border/40 hover:bg-muted/40">
      {showRace ? (
        <td className="px-3 py-2 align-top">
          <Link href={`/races/${r.id}`} className="font-medium hover:underline">
            {r.stateCode} {r.chamber.type === 'HOUSE' ? 'House' : r.chamber.type === 'SENATE' ? 'Senate' : 'Leg'} {r.district}
          </Link>
          <div className="text-xs text-muted-foreground">{r.electionYear}</div>
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
        <span className="text-blue-400">{fmtPct(poll.dPct)}</span>
        {' / '}
        <span className="text-red-400">{fmtPct(poll.rPct)}</span>
        {poll.otherPct > 0 ? <span className="text-muted-foreground"> / {fmtPct(poll.otherPct)}</span> : null}
        {poll.undecidedPct > 0 ? <span className="text-muted-foreground"> · und {fmtPct(poll.undecidedPct, 0)}</span> : null}
      </td>
      <td className="px-3 py-2 align-top text-sm font-mono">{fmtMargin(poll.margin)}</td>
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
        <th className="px-3 py-2 text-left font-medium">D / R / 3rd</th>
        <th className="px-3 py-2 text-left font-medium">Margin</th>
        <th className="px-3 py-2 text-left font-medium">Sample</th>
        <th className="px-3 py-2 text-left font-medium">Source</th>
      </tr>
    </thead>
  )
}
