import type { SponsorType } from '@/lib/generated/prisma/enums'
import { sponsorLean } from '@/lib/labels'

export type ScoredPoll = {
  margin: number
  daysToElection: number
  sponsorType: SponsorType
  electionYear: number
  actualMargin: number
}

export type AccuracyStats = {
  n: number
  pctWithin3: number | null
  pctWithin5: number | null
  medianAbsError: number | null
  meanSignedError: number | null
}

export function computeStats(polls: ScoredPoll[]): AccuracyStats {
  if (polls.length === 0) {
    return { n: 0, pctWithin3: null, pctWithin5: null, medianAbsError: null, meanSignedError: null }
  }
  const errors = polls.map((p) => p.margin - p.actualMargin)
  const absErrors = errors.map((e) => Math.abs(e))
  const within3 = absErrors.filter((e) => e <= 3).length
  const within5 = absErrors.filter((e) => e <= 5).length
  const sorted = [...absErrors].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  const mean = errors.reduce((s, e) => s + e, 0) / errors.length
  return {
    n: polls.length,
    pctWithin3: (within3 / polls.length) * 100,
    pctWithin5: (within5 / polls.length) * 100,
    medianAbsError: median,
    meanSignedError: mean,
  }
}

export const DAYS_BUCKETS: Array<{ id: string; label: string; min: number; max: number }> = [
  { id: '0-14', label: '0–14 days out', min: 0, max: 14 },
  { id: '15-30', label: '15–30 days out', min: 15, max: 30 },
  { id: '31-60', label: '31–60 days out', min: 31, max: 60 },
  { id: '61-120', label: '61–120 days out', min: 61, max: 120 },
  { id: '120+', label: '120+ days out', min: 121, max: Number.POSITIVE_INFINITY },
]

export function inDaysBucket(days: number, bucketId: string): boolean {
  const b = DAYS_BUCKETS.find((x) => x.id === bucketId)
  if (!b) return true
  return days >= b.min && days <= b.max
}

export function filterBySponsor(polls: ScoredPoll[], cut: 'all' | 'nonpartisan' | 'D' | 'R'): ScoredPoll[] {
  if (cut === 'all') return polls
  if (cut === 'nonpartisan') {
    return polls.filter((p) => p.sponsorType === 'NEWS_MEDIA' || p.sponsorType === 'NONPARTISAN_PUBLIC')
  }
  return polls.filter((p) => sponsorLean(p.sponsorType) === cut)
}
