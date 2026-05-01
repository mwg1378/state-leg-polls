import { cn } from '@/lib/utils'
import { sponsorLean, SPONSOR_TYPE_LABELS } from '@/lib/labels'
import type { SponsorType } from '@db/enums'

export function SponsorBadge({
  sponsor,
  sponsorType,
  compact = false,
}: {
  sponsor: string
  sponsorType: SponsorType
  compact?: boolean
}) {
  const lean = sponsorLean(sponsorType)
  const cls =
    lean === 'D'
      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      : lean === 'R'
        ? 'bg-red-500/15 text-red-300 border-red-500/30'
        : 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30'
  const partisan = lean !== 'NEUTRAL'
  return (
    <span
      title={SPONSOR_TYPE_LABELS[sponsorType]}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        cls,
      )}
    >
      {partisan ? <span className="font-bold">{lean}</span> : null}
      <span className="font-normal opacity-90">{compact ? truncate(sponsor, 28) : sponsor}</span>
    </span>
  )
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}
