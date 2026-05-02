import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'
import { anthropic, MODEL_FAST } from '@/lib/anthropic'
import { ingestCandidatePoll } from '@/lib/ingest'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const EXTRACTION_SYSTEM = `You extract structured poll records from web pages about US big-city mayoral elections (cities of 200K+ population).

Return JSON only, no prose. Use this schema:
{
  "polls": [
    {
      "cityName": "Chicago",
      "stateCode": "IL",
      "electionYear": 2023,
      "electionDate": "2023-04-04",
      "raceType": "PARTISAN_PRIMARY" | "NONPARTISAN_PRIMARY" | "GENERAL" | "NONPARTISAN_GENERAL" | "RUNOFF" | "SPECIAL_GENERAL" | "SPECIAL_PRIMARY" | "SPECIAL_RUNOFF",
      "party": "D" | "R" | null,
      "pollsterName": "Quinnipiac University",
      "sponsor": "Quinnipiac University",
      "sponsorType": "CAMPAIGN" | "PARTY" | "INDEPENDENT_GROUP" | "NEWS_MEDIA" | "NONPARTISAN_PUBLIC" | "UNKNOWN",
      "startDate": "2023-03-25",
      "endDate": "2023-03-29",
      "sampleSize": 1042,
      "population": "LV" | "RV" | "A" | "UNKNOWN",
      "mode": "live phone" | "IVR" | "online panel" | "mixed" | null,
      "candidates": [
        { "name": "Brandon Johnson", "party": "D", "pct": 49.0 },
        { "name": "Paul Vallas", "party": "D", "pct": 47.0 }
      ],
      "undecidedPct": 4.0,
      "methodologyNotes": "MoE ±3.5",
      "sourceUrl": "https://...",
      "sourceType": "PRESS_RELEASE" | "NEWS_ARTICLE" | "POLLSTER_MEMO" | "CAMPAIGN_SITE" | "AGGREGATOR" | "WIKIPEDIA" | "SOCIAL_MEDIA" | "OTHER"
    }
  ]
}

Hard rules:
- Only mayoral races (city mayor). Skip city council, comptroller, gubernatorial, state-leg, federal.
- Only cities with population ≥ 200K (use your judgment if unsure; prefer to include).
- Polls must give numeric % for at least 2 named candidates. Skip favorability-only or generic polls.
- For races with several candidates, list ALL candidates the poll measured (not just top 2).
- For top-two systems (Chicago, Seattle, etc.), the first round is NONPARTISAN_PRIMARY, the second is RUNOFF.
- Don't fabricate. Return polls: [] if nothing applies.`

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
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        },
      }).then((r) => r.text())

      const stripped = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 180_000)

      const msg = await anthropic.messages.create({
        model: MODEL_FAST,
        max_tokens: 8192,
        system: EXTRACTION_SYSTEM,
        messages: [{ role: 'user', content: `Source: ${src.url}\nLabel: ${src.label}\n\n---\n\n${stripped}` }],
      })

      const text = msg.content
        .filter((c) => c.type === 'text')
        .map((c) => (c as { text: string }).text)
        .join('')
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { polls: [] }
      const polls = Array.isArray(parsed.polls) ? parsed.polls : []

      let pending = 0
      for (const p of polls) {
        try {
          const ok = await ingestCandidatePoll(p, `cron:${src.id}`, 'PENDING')
          if (ok) pending++
        } catch {
          // skip malformed
        }
      }

      await prisma.source.update({ where: { id: src.id }, data: { lastScannedAt: new Date() } })
      results.push({ url: src.url, found: polls.length, pending })
    } catch (err) {
      results.push({ url: src.url, found: 0, pending: 0, error: (err as Error).message })
    }
  }

  return NextResponse.json({ scanned: sources.length, results })
}

export async function GET(req: Request) {
  return POST(req)
}
