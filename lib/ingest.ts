import { prisma } from '@/prisma/client'
import type { CandidateResult } from '@/lib/accuracy'

export type CandidatePollInput = {
  cityName?: string
  citySlug?: string
  stateCode?: string
  electionYear?: number
  electionDate?: string
  raceType?: string
  party?: string | null
  pollsterName?: string
  sponsor?: string
  sponsorType?: string
  startDate?: string
  endDate?: string
  sampleSize?: number | null
  population?: string
  mode?: string | null
  candidates?: Array<{ name: string; party?: string | null; pct: number }>
  undecidedPct?: number
  methodologyNotes?: string | null
  sourceUrl?: string
  sourceType?: string
  // Optional actual results for the race (Wikipedia pages provide these alongside polling tables)
  actualResults?: CandidateResult[]
}

const RACE_TYPES = new Set([
  'PARTISAN_PRIMARY',
  'NONPARTISAN_PRIMARY',
  'GENERAL',
  'NONPARTISAN_GENERAL',
  'RUNOFF',
  'SPECIAL_GENERAL',
  'SPECIAL_PRIMARY',
  'SPECIAL_RUNOFF',
])

const SPONSOR_TYPES = new Set([
  'CAMPAIGN',
  'PARTY',
  'INDEPENDENT_GROUP',
  'NEWS_MEDIA',
  'NONPARTISAN_PUBLIC',
  'UNKNOWN',
])

const SOURCE_TYPES = new Set([
  'PRESS_RELEASE',
  'NEWS_ARTICLE',
  'POLLSTER_MEMO',
  'CAMPAIGN_SITE',
  'AGGREGATOR',
  'WIKIPEDIA',
  'SOCIAL_MEDIA',
  'OTHER',
])

const POPULATIONS = new Set(['LV', 'RV', 'A', 'UNKNOWN'])

export async function ingestCandidatePoll(
  p: CandidatePollInput,
  addedBy: string,
  status: 'PENDING' | 'PUBLISHED' = 'PENDING',
): Promise<boolean> {
  const stateCode = String(p.stateCode ?? '').toUpperCase().slice(0, 2)
  const cityName = String(p.cityName ?? '').trim()
  const electionYear = Number(p.electionYear)
  const raceType = String(p.raceType ?? '').toUpperCase()
  if (!stateCode || !cityName || !Number.isFinite(electionYear) || !RACE_TYPES.has(raceType)) return false

  // Resolve city by name + state. Prefer slug if explicitly given.
  let city = p.citySlug ? await prisma.city.findUnique({ where: { slug: p.citySlug } }) : null
  if (!city) {
    const normalized = normalizeCityName(cityName)
    city = await prisma.city.findFirst({
      where: { stateCode, name: { equals: cityName, mode: 'insensitive' } },
    })
    if (!city) {
      city = await prisma.city.findFirst({
        where: { stateCode, name: { equals: normalized, mode: 'insensitive' } },
      })
    }
    if (!city) {
      // Try contains match (handles "St." vs "Saint", etc.)
      city = await prisma.city.findFirst({
        where: { stateCode, name: { contains: normalized, mode: 'insensitive' } },
      })
    }
  }
  if (!city) return false

  const electionDate = parseDate(p.electionDate)
  if (!electionDate) return false
  const party = p.party ? String(p.party).toUpperCase().slice(0, 4) : null

  // Build canonical race id; find-or-create (upsert can't handle nullable party in compound unique).
  const raceId = `${city.slug}-${electionDate.toISOString().slice(0, 10)}-${raceType.toLowerCase().replace(/_/g, '-')}${party ? '-' + party.toLowerCase() : ''}`
  const actuals = Array.isArray(p.actualResults) ? p.actualResults : null
  const sortedActuals = actuals ? [...actuals].sort((a, b) => b.pct - a.pct) : null

  const existingRace = await prisma.race.findFirst({
    where: { citySlug: city.slug, electionDate, raceType: raceType as never, party },
  })

  const raceData = sortedActuals
    ? {
        actualResults: sortedActuals as never,
        winnerName: sortedActuals[0]?.name ?? null,
        winnerPct: sortedActuals[0]?.pct ?? null,
        runnerUpName: sortedActuals[1]?.name ?? null,
        runnerUpPct: sortedActuals[1]?.pct ?? null,
        topMargin:
          sortedActuals[0] && sortedActuals[1] ? sortedActuals[0].pct - sortedActuals[1].pct : null,
      }
    : {}

  const race = existingRace
    ? await prisma.race.update({ where: { id: existingRace.id }, data: raceData })
    : await prisma.race.create({
        data: {
          id: raceId,
          citySlug: city.slug,
          electionDate,
          electionYear,
          raceType: raceType as never,
          party,
          ...raceData,
        },
      })

  // Pollster
  const pollsterName = String(p.pollsterName ?? '').trim()
  if (!pollsterName) return false
  const pollsterSlug = pollsterName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
  await prisma.pollster.upsert({
    where: { slug: pollsterSlug },
    update: {},
    create: { slug: pollsterSlug, name: pollsterName },
  })

  // Candidate data
  const candidates = (p.candidates ?? [])
    .map((c) => ({
      name: String(c.name ?? '').trim(),
      party: c.party ? String(c.party).toUpperCase().slice(0, 4) : null,
      pct: Number(c.pct),
    }))
    .filter((c) => c.name && Number.isFinite(c.pct))
  if (candidates.length < 2) return false
  const sorted = [...candidates].sort((a, b) => b.pct - a.pct)
  const top = sorted[0]
  const runnerUp = sorted[1]
  const topMargin = runnerUp ? top.pct - runnerUp.pct : top.pct

  const startDate = parseDate(p.startDate) ?? parseDate(p.endDate)
  const endDate = parseDate(p.endDate) ?? startDate
  if (!startDate || !endDate) return false
  const daysToElection = Math.max(0, Math.round((+electionDate - +endDate) / 86400000))

  const sponsorType = SPONSOR_TYPES.has(String(p.sponsorType ?? '').toUpperCase())
    ? (String(p.sponsorType).toUpperCase() as never)
    : ('UNKNOWN' as never)
  const sourceType = SOURCE_TYPES.has(String(p.sourceType ?? '').toUpperCase())
    ? (String(p.sourceType).toUpperCase() as never)
    : ('OTHER' as never)
  const population = POPULATIONS.has(String(p.population ?? '').toUpperCase())
    ? (String(p.population).toUpperCase() as never)
    : ('UNKNOWN' as never)

  const sourceUrl = typeof p.sourceUrl === 'string' && p.sourceUrl ? p.sourceUrl : ''
  if (!sourceUrl) return false

  // Idempotency: same (race, pollster, endDate, sponsor) is treated as duplicate.
  const existing = await prisma.poll.findFirst({
    where: {
      raceId: race.id,
      pollsterSlug,
      endDate,
      sponsor: typeof p.sponsor === 'string' ? p.sponsor : pollsterName,
    },
  })
  if (existing) return false

  await prisma.poll.create({
    data: {
      raceId: race.id,
      pollsterSlug,
      sponsor: typeof p.sponsor === 'string' ? p.sponsor : pollsterName,
      sponsorType,
      candidates: candidates as never,
      topName: top.name,
      topPct: top.pct,
      runnerUpName: runnerUp?.name ?? null,
      runnerUpPct: runnerUp?.pct ?? null,
      topMargin,
      undecidedPct: Number(p.undecidedPct ?? 0) || 0,
      startDate,
      endDate,
      sampleSize: Number.isFinite(Number(p.sampleSize)) ? Number(p.sampleSize) : null,
      population,
      mode: typeof p.mode === 'string' ? p.mode : null,
      daysToElection,
      methodologyNotes: typeof p.methodologyNotes === 'string' ? p.methodologyNotes : null,
      sourceUrl,
      sourceType,
      status,
      addedBy,
    },
  })
  return true
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(+d) ? null : d
}

function normalizeCityName(name: string): string {
  return name
    .replace(/^City of /i, '')
    .replace(/ City$/i, '')                 // "New York City" → "New York"
    .replace(/, D\.C\.?$/i, '')              // "Washington, D.C." → "Washington"
    .replace(/^Saint /i, 'St. ')             // "Saint Paul" → "St. Paul"
    .replace(/^St\b\.?\s+/i, 'St. ')         // normalize "St" / "St." → "St. "
    .trim()
}
