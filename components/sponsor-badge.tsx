import { cn } from '@/lib/utils'
import { SPONSOR_TYPE_LABELS } from '@/lib/labels'
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
  const partisan =
    sponsorType === 'CAMPAIGN' || sponsorType === 'PARTY' || sponsorType === 'INDEPENDENT_GROUP'
  const cls = partisan
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    : sponsorType === 'NEWS_MEDIA'
      ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
      : 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30'
  return (
    <span
      title={SPONSOR_TYPE_LABELS[sponsorType]}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        cls,
      )}
    >
      {partisan ? <span className="font-bold">P</span> : null}
      <span className="font-normal opacity-90">{compact ? truncate(sponsor, 30) : sponsor}</span>
    </span>
  )
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}
