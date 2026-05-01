import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'
import { anthropic, MODEL_FAST } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const EXTRACTION_SYSTEM = `You extract structured poll records from web pages about US state legislative general elections.

Return JSON only, no prose. Use this schema:
{
  "polls": [
    {
      "stateCode": "VA",
      "chamberType": "HOUSE" | "SENATE" | "UNICAMERAL",
      "district": "21",
      "electionYear": 2025,
      "isSpecial": false,
      "dCandidate": "Jane Doe",
      "rCandidate": "John Smith",
      "pollsterName": "Public Policy Polling",
      "sponsor": "Friends of Jane Doe campaign",
      "sponsorType": "CAMPAIGN_D" | "CAMPAIGN_R" | "PARTY_D" | "PARTY_R" | "INDEPENDENT_GROUP_D" | "INDEPENDENT_GROUP_R" | "NEWS_MEDIA" | "NONPARTISAN_PUBLIC" | "UNKNOWN",
      "startDate": "2025-09-15",
      "endDate": "2025-09-18",
      "sampleSize": 600,
      "population": "LV" | "RV" | "A" | "UNKNOWN",
      "mode": "live phone" | "IVR" | "online panel" | "mixed" | null,
      "dPct": 48.0,
      "rPct": 45.0,
      "otherPct": 0.0,
      "undecidedPct": 7.0,
      "methodologyNotes": "...",
      "sourceUrl": "https://..."
    }
  ]
}

Hard rules:
- Only state legislative GENERAL election races (state house, state senate, or NE unicameral). Skip primaries, federal, gubernatorial, and statewide-control polls.
- If you can't determine state + chamber + district + year + a D% and R%, skip the poll.
- "isSpecial" is true if this is a special election.
- Use the LATEST poll wave shown (don't combine waves).
- If sponsor partisan lean is ambiguous, use UNKNOWN.
- Return an empty polls array if nothing applies.`

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sources = await prisma.source.findMany({
    where: { isActive: true },
    orderBy: { lastScannedAt: { sort: 'asc', nulls: 'first' } },
    take: 5,
  })

  const results: Array<{ url: string; found: number; pending: number; error?: string }> = []

  for (const src of sources) {
    try {
      const html = await fetch(src.url, {
        headers: { 'User-Agent': 'state-leg-polls bot (+https://state-leg-polls.vercel.app)' },
      }).then((r) => r.text())

      const stripped = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 80_000)

      const msg = await anthropic.messages.create({
        model: MODEL_FAST,
        max_tokens: 8192,
        system: EXTRACTION_SYSTEM,
        messages: [
          {
            role: 'user',
            content: `Source: ${src.url}\nLabel: ${src.label}\n\n---\n\n${stripped}`,
          },
        ],
      })

      const text = msg.content
        .filter((c) => c.type === 'text')
        .map((c) => (c as { text: string }).text)
        .join('')
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { polls: [] }
      const polls = Array.isArray(parsed.polls) ? parsed.polls : []

      let pendingCount = 0
      for (const p of polls) {
        try {
          const created = await ingestCandidatePoll(p, src.id)
          if (created) pendingCount++
        } catch {
          // skip malformed
        }
      }

      await prisma.source.update({ where: { id: src.id }, data: { lastScannedAt: new Date() } })
      results.push({ url: src.url, found: polls.length, pending: pendingCount })
    } catch (err) {
      results.push({ url: src.url, found: 0, pending: 0, error: (err as Error).message })
    }
  }

  return NextResponse.json({ scanned: sources.length, results })
}

export async function GET(req: Request) {
  return POST(req)
}

async function ingestCandidatePoll(p: Record<string, unknown>, sourceId: string): Promise<boolean> {
  const stateCode = String(p.stateCode ?? '').toUpperCase().slice(0, 2)
  const chamberType = p.chamberType as 'HOUSE' | 'SENATE' | 'UNICAMERAL'
  if (!stateCode || !chamberType) return false

  const chamberId = stateCode === 'NE' && chamberType === 'UNICAMERAL' ? 'NE-LEG' : `${stateCode}-${chamberType}`
  const chamber = await prisma.chamber.findUnique({ where: { id: chamberId } })
  if (!chamber) return false

  const district = String(p.district ?? '').trim()
  const electionYear = Number(p.electionYear)
  if (!district || !Number.isFinite(electionYear)) return false
  const isSpecial = Boolean(p.isSpecial)

  const electionDate =
    typeof p.endDate === 'string'
      ? guessElectionDate(stateCode, electionYear)
      : guessElectionDate(stateCode, electionYear)

  const race = await prisma.race.upsert({
    where: {
      chamberId_district_electionYear_isSpecial: {
        chamberId,
        district,
        electionYear,
        isSpecial,
      },
    },
    update: {
      dCandidate: typeof p.dCandidate === 'string' ? p.dCandidate : undefined,
      rCandidate: typeof p.rCandidate === 'string' ? p.rCandidate : undefined,
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
  const otherPct = Number(p.otherPct ?? 0) || 0
  const undecidedPct = Number(p.undecidedPct ?? 0) || 0
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
      otherPct,
      undecidedPct,
      margin,
      daysToElection,
      methodologyNotes: typeof p.methodologyNotes === 'string' ? p.methodologyNotes : null,
      sourceUrl: typeof p.sourceUrl === 'string' && p.sourceUrl ? p.sourceUrl : '',
      sourceType: 'AGGREGATOR',
      status: 'PENDING',
      addedBy: `cron:${sourceId}`,
    },
  })
  return true
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null
  const d = new Date(v)
  return Number.isNaN(+d) ? null : d
}

function guessElectionDate(stateCode: string, year: number): Date {
  // VA / NJ hold legislative generals in odd years on the first Tuesday after the first Monday of November.
  // For other states, regular general elections fall on the first Tuesday after the first Monday of November of even years.
  // This is a fallback when the source page doesn't include an explicit election date.
  return firstTuesdayAfterFirstMonday(year, 10)
}

function firstTuesdayAfterFirstMonday(year: number, monthIdx: number): Date {
  const d = new Date(Date.UTC(year, monthIdx, 1))
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1)
  d.setUTCDate(d.getUTCDate() + 1)
  return d
}
