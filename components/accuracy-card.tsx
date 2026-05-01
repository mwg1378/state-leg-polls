import type { AccuracyStats } from '@/lib/accuracy'

export function AccuracyCard({ title, sub, stats }: { title: string; sub?: string; stats: AccuracyStats }) {
  return (
    <div className="rounded border border-border/60 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{title}</div>
          {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
        </div>
        <div className="text-xs text-muted-foreground">n={stats.n}</div>
      </div>
      {stats.n === 0 ? (
        <div className="mt-4 text-sm text-muted-foreground">No polls in scope.</div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Within 3 pts" value={pct(stats.pctWithin3)} />
          <Stat label="Within 5 pts" value={pct(stats.pctWithin5)} />
          <Stat label="Median |error|" value={pts(stats.medianAbsError)} />
          <Stat label="Mean error (D−R)" value={signedPts(stats.meanSignedError)} />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  )
}

const pct = (n: number | null | undefined) => (n == null ? '—' : `${n.toFixed(0)}%`)
const pts = (n: number | null | undefined) => (n == null ? '—' : `${n.toFixed(1)} pts`)
const signedPts = (n: number | null | undefined) => {
  if (n == null) return '—'
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  return `${sign}${Math.abs(n).toFixed(1)} pts`
}
