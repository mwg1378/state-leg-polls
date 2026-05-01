import { format } from 'date-fns'

export const fmtDate = (d: Date | string) => format(typeof d === 'string' ? new Date(d) : d, 'MMM d, yyyy')
export const fmtDateShort = (d: Date | string) => format(typeof d === 'string' ? new Date(d) : d, 'MMM d')
export const fmtDateRange = (a: Date | string, b: Date | string) => {
  const da = typeof a === 'string' ? new Date(a) : a
  const db = typeof b === 'string' ? new Date(b) : b
  if (da.getTime() === db.getTime()) return fmtDate(da)
  if (da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth()) {
    return `${format(da, 'MMM d')}–${format(db, 'd, yyyy')}`
  }
  return `${format(da, 'MMM d')} – ${fmtDate(db)}`
}

export const fmtPct = (n: number | null | undefined, digits = 1) =>
  n == null ? '—' : `${n.toFixed(digits)}%`

export const fmtMargin = (n: number | null | undefined) => {
  if (n == null) return '—'
  if (Math.abs(n) < 0.05) return 'Tied'
  const sign = n > 0 ? 'D+' : 'R+'
  return `${sign}${Math.abs(n).toFixed(1)}`
}

export const fmtNum = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString()

export const fmtN = (n: number) => `n=${n.toLocaleString()}`
