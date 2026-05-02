import { DAYS_BUCKETS } from '@/lib/accuracy'
import type { Prisma } from '@db/client'

export type PollFilterParams = {
  state?: string
  city?: string
  year?: string
  raceType?: string
  sponsor?: string
  pollster?: string
  days?: string
}

export function buildPollWhere(p: PollFilterParams): Prisma.PollWhereInput {
  const where: Prisma.PollWhereInput = { status: 'PUBLISHED' }
  const raceWhere: Prisma.RaceWhereInput = {}
  if (p.city) raceWhere.citySlug = p.city
  if (p.year) raceWhere.electionYear = parseInt(p.year, 10) || undefined
  if (p.state) raceWhere.city = { stateCode: p.state.toUpperCase() }
  if (p.raceType) {
    if (p.raceType === 'primary') {
      raceWhere.raceType = { in: ['PARTISAN_PRIMARY', 'NONPARTISAN_PRIMARY', 'SPECIAL_PRIMARY'] }
    } else if (p.raceType === 'general') {
      raceWhere.raceType = { in: ['GENERAL', 'NONPARTISAN_GENERAL', 'SPECIAL_GENERAL'] }
    } else if (p.raceType === 'runoff') {
      raceWhere.raceType = { in: ['RUNOFF', 'SPECIAL_RUNOFF'] }
    }
  }
  if (Object.keys(raceWhere).length) where.race = raceWhere
  if (p.pollster) where.pollsterSlug = p.pollster
  if (p.sponsor === 'partisan') {
    where.sponsorType = { in: ['CAMPAIGN', 'PARTY', 'INDEPENDENT_GROUP'] }
  } else if (p.sponsor === 'nonpartisan') {
    where.sponsorType = { in: ['NEWS_MEDIA', 'NONPARTISAN_PUBLIC'] }
  }
  if (p.days) {
    const b = DAYS_BUCKETS.find((x) => x.id === p.days)
    if (b) {
      where.daysToElection = { gte: b.min, ...(b.max !== Number.POSITIVE_INFINITY ? { lte: b.max } : {}) }
    }
  }
  return where
}
