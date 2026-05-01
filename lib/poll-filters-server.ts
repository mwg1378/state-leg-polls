import { DAYS_BUCKETS } from '@/lib/accuracy'
import type { Prisma } from '@/lib/generated/prisma/client'

export type PollFilterParams = {
  state?: string
  chamber?: string
  year?: string
  sponsor?: string
  pollster?: string
  days?: string
}

export function buildPollWhere(p: PollFilterParams): Prisma.PollWhereInput {
  const where: Prisma.PollWhereInput = { status: 'PUBLISHED' }
  const raceWhere: Prisma.RaceWhereInput = {}
  if (p.state) raceWhere.stateCode = p.state.toUpperCase()
  if (p.year) raceWhere.electionYear = parseInt(p.year, 10) || undefined
  if (p.chamber) raceWhere.chamber = { type: p.chamber as 'HOUSE' | 'SENATE' | 'UNICAMERAL' }
  if (Object.keys(raceWhere).length) where.race = raceWhere
  if (p.pollster) where.pollsterSlug = p.pollster
  if (p.sponsor === 'D') {
    where.sponsorType = { in: ['CAMPAIGN_D', 'PARTY_D', 'INDEPENDENT_GROUP_D'] }
  } else if (p.sponsor === 'R') {
    where.sponsorType = { in: ['CAMPAIGN_R', 'PARTY_R', 'INDEPENDENT_GROUP_R'] }
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
