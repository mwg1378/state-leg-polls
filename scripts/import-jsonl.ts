#!/usr/bin/env tsx
/**
 * Import a polls JSONL file (output of research-seed) into the DB as PENDING polls.
 *
 * Usage:
 *   npm run research:import -- seed/polls-2026-05-01.jsonl
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import fs from 'node:fs'
import readline from 'node:readline'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

function makePrismaClient() {
  const cs = process.env.DIRECT_URL || process.env.DATABASE_URL!
  const u = new URL(cs)
  const pool = new pg.Pool({
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port || '5432', 10),
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}
const prisma = makePrismaClient()

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: tsx scripts/import-jsonl.ts <file.jsonl>')
    process.exit(1)
  }
  if (!fs.existsSync(file)) {
    console.error(`Not found: ${file}`)
    process.exit(1)
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity,
  })

  let total = 0
  let imported = 0
  let skipped = 0
  for await (const line of rl) {
    if (!line.trim()) continue
    total++
    try {
      const p = JSON.parse(line)
      const ok = await ingest(p, file)
      if (ok) imported++
      else skipped++
    } catch (err) {
      skipped++
      console.warn(`[skip] line ${total}: ${(err as Error).message}`)
    }
  }
  console.log(`Done. ${imported} imported, ${skipped} skipped (of ${total}).`)
  await prisma.$disconnect()
}

async function ingest(p: Record<string, unknown>, sourceFile: string): Promise<boolean> {
  const stateCode = String(p.stateCode ?? '').toUpperCase().slice(0, 2)
  const chamberType = String(p.chamberType ?? '').toUpperCase()
  if (!['HOUSE', 'SENATE', 'UNICAMERAL'].includes(chamberType)) return false
  if (!stateCode) return false

  const chamberId = stateCode === 'NE' && chamberType === 'UNICAMERAL' ? 'NE-LEG' : `${stateCode}-${chamberType}`
  const chamber = await prisma.chamber.findUnique({ where: { id: chamberId } })
  if (!chamber) return false

  const district = String(p.district ?? '').trim()
  const electionYear = Number(p.electionYear)
  if (!district || !Number.isFinite(electionYear)) return false
  const isSpecial = Boolean(p.isSpecial)
  const electionDate = parseDate(p.electionDate) ?? guessElectionDate(stateCode, electionYear)

  const race = await prisma.race.upsert({
    where: {
      chamberId_district_electionYear_isSpecial: { chamberId, district, electionYear, isSpecial },
    },
    update: {
      dCandidate: typeof p.dCandidate === 'string' ? p.dCandidate : undefined,
      rCandidate: typeof p.rCandidate === 'string' ? p.rCandidate : undefined,
      actualDPct: typeof p.actualDPct === 'number' ? p.actualDPct : undefined,
      actualRPct: typeof p.actualRPct === 'number' ? p.actualRPct : undefined,
      actualMargin: typeof p.actualMargin === 'number' ? p.actualMargin : undefined,
    },
    create: {
      id: `${stateCode.toLowerCase()}-${chamberType.toLowerCase()}-${district.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${electionYear}${isSpecial ? '-special' : ''}`,
      chamberId,
      stateCode,
      district,
      electionYear,
      electionDate,
      isSpecial,
      dCandidate: typeof p.dCandidate === 'string' ? p.dCandidate : null,
      rCandidate: typeof p.rCandidate === 'string' ? p.rCandidate : null,
      actualDPct: typeof p.actualDPct === 'number' ? p.actualDPct : null,
      actualRPct: typeof p.actualRPct === 'number' ? p.actualRPct : null,
      actualMargin: typeof p.actualMargin === 'number' ? p.actualMargin : null,
    },
  })

  const pollsterName = String(p.pollsterName ?? '').trim()
  if (!pollsterName) return false
  const pollsterSlug = pollsterName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
  await prisma.pollster.upsert({
    where: { slug: pollsterSlug },
    update: {},
    create: { slug: pollsterSlug, name: pollsterName },
  })

  const dPct = Number(p.dPct)
  const rPct = Number(p.rPct)
  if (!Number.isFinite(dPct) || !Number.isFinite(rPct)) return false
  const margin = dPct - rPct

  const startDate = parseDate(p.startDate) ?? parseDate(p.endDate)
  const endDate = parseDate(p.endDate) ?? startDate
  if (!startDate || !endDate) return false
  const daysToElection = Math.max(0, Math.round((+race.electionDate - +endDate) / 86400000))

  const sponsorType = (typeof p.sponsorType === 'string' ? p.sponsorType : 'UNKNOWN') as
    | 'CAMPAIGN_D' | 'CAMPAIGN_R' | 'PARTY_D' | 'PARTY_R'
    | 'INDEPENDENT_GROUP_D' | 'INDEPENDENT_GROUP_R'
    | 'NEWS_MEDIA' | 'NONPARTISAN_PUBLIC' | 'UNKNOWN'
  const isPartisan = !(sponsorType === 'NEWS_MEDIA' || sponsorType === 'NONPARTISAN_PUBLIC')

  const sourceUrl = typeof p.sourceUrl === 'string' && p.sourceUrl ? p.sourceUrl : ''
  if (!sourceUrl) return false

  // Idempotency: same (race, pollster, endDate, sponsor) is treated as duplicate.
  const existing = await prisma.poll.findFirst({
    where: { raceId: race.id, pollsterSlug, endDate, sponsor: typeof p.sponsor === 'string' ? p.sponsor : pollsterName },
  })
  if (existing) return false

  await prisma.poll.create({
    data: {
      raceId: race.id,
      pollsterSlug,
      sponsor: typeof p.sponsor === 'string' ? p.sponsor : pollsterName,
      sponsorType,
      isPartisan,
      startDate,
      endDate,
      sampleSize: Number.isFinite(Number(p.sampleSize)) ? Number(p.sampleSize) : null,
      population: (typeof p.population === 'string' ? p.population : 'UNKNOWN') as 'LV' | 'RV' | 'A' | 'UNKNOWN',
      mode: typeof p.mode === 'string' ? p.mode : null,
      dPct,
      rPct,
      otherPct: Number(p.otherPct ?? 0) || 0,
      undecidedPct: Number(p.undecidedPct ?? 0) || 0,
      margin,
      daysToElection,
      methodologyNotes: typeof p.methodologyNotes === 'string' ? p.methodologyNotes : null,
      sourceUrl,
      sourceType: (typeof p.sourceType === 'string' ? p.sourceType : 'OTHER') as
        | 'PRESS_RELEASE' | 'NEWS_ARTICLE' | 'POLLSTER_MEMO' | 'CAMPAIGN_SITE'
        | 'CAUCUS_SITE' | 'AGGREGATOR' | 'SOCIAL_MEDIA' | 'OTHER',
      status: 'PENDING',
      addedBy: `import:${sourceFile}`,
    },
  })
  return true
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(+d) ? null : d
}

function guessElectionDate(_state: string, year: number): Date {
  const d = new Date(Date.UTC(year, 10, 1))
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1)
  d.setUTCDate(d.getUTCDate() + 1)
  return d
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
