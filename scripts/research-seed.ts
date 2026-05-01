#!/usr/bin/env tsx
/**
 * One-time research orchestrator.
 *
 * For each (state × cycle) slice we ask Claude to surface every state-legislative-general-election
 * poll it can find and to extract structured records. Results are appended to seed/polls.jsonl
 * for review (via review-pending.ts → import-from-jsonl) before being inserted into the DB.
 *
 * Usage:
 *   npm run research:seed -- --state=VA --year=2023
 *   npm run research:seed -- --year=2024
 *   npm run research:seed                            # all states × all cycles
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import fs from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY',
] as const

const CYCLES = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

const SYSTEM = `You are a research assistant gathering polls of US state legislative GENERAL elections.

Goal: surface every poll you can find for the given state and election cycle, then return structured records.

In scope:
- Polls of individual state house / state senate / Nebraska unicameral races, general election.
- Both nonpartisan/public polls (universities, news media, independent firms) and partisan internals
  (campaigns, party committees, allied groups).
- Special elections that fell within the cycle, when easy to identify.

Out of scope (skip):
- Primary polls.
- Generic-ballot or "control of chamber" polls (these are not race-level).
- Federal / gubernatorial / statewide non-legislative races.
- Polls without both a D and R figure (or equivalent top-two if the state uses jungle primaries).

Use web search liberally. Look at:
- Pollster archives (PPP, Cygnal, Change Research, Emerson, Monmouth, Siena, Marist, Wason, Roanoke,
  Mason-Dixon, FM3, Tulchin, GBAO, GHY, Public Opinion Strategies, McLaughlin, OnMessage, etc.).
- News coverage that quotes a state legislative poll (NJ.com, Politico, Politicoo, Virginia Mercury,
  state-specific outlets, AP).
- Campaign press releases and campaign Twitter/X.
- Party caucus committee press releases (state-leg HMP / HRCC equivalents).
- Aggregators: Ballotpedia, The Downballot (Daily Kos Elections), 538 archives where applicable.

Return JSON only:
{
  "polls": [
    {
      "stateCode": "VA",
      "chamberType": "HOUSE" | "SENATE" | "UNICAMERAL",
      "district": "21",
      "electionYear": 2023,
      "isSpecial": false,
      "electionDate": "2023-11-07",
      "dCandidate": "Jane Doe",
      "rCandidate": "John Smith",
      "pollsterName": "Public Policy Polling",
      "sponsor": "Friends of Jane Doe",
      "sponsorType": "CAMPAIGN_D" | "CAMPAIGN_R" | "PARTY_D" | "PARTY_R" | "INDEPENDENT_GROUP_D" | "INDEPENDENT_GROUP_R" | "NEWS_MEDIA" | "NONPARTISAN_PUBLIC" | "UNKNOWN",
      "startDate": "2023-09-15",
      "endDate": "2023-09-18",
      "sampleSize": 600,
      "population": "LV" | "RV" | "A" | "UNKNOWN",
      "mode": "live phone" | "IVR" | "online panel" | "mixed" | null,
      "dPct": 48.0,
      "rPct": 45.0,
      "otherPct": 0.0,
      "undecidedPct": 7.0,
      "methodologyNotes": "Mixed-mode IVR + online; MoE ±4.0",
      "sourceUrl": "https://...",
      "sourceType": "PRESS_RELEASE" | "NEWS_ARTICLE" | "POLLSTER_MEMO" | "CAMPAIGN_SITE" | "CAUCUS_SITE" | "AGGREGATOR" | "SOCIAL_MEDIA" | "OTHER",
      "actualDPct": 49.2,
      "actualRPct": 50.3,
      "actualMargin": -1.1,
      "confidence": "high" | "medium" | "low",
      "notes": "any disambiguation"
    }
  ],
  "searchSummary": "what you searched and any caveats"
}

If a piece of info is genuinely unavailable, set it to null. Do not fabricate. If you cannot find any
qualifying poll, return { "polls": [], "searchSummary": "..." }.

Be exhaustive. It is far better to overshoot and let a human reviewer reject duplicates than to miss polls.`

const args = process.argv.slice(2).reduce<Record<string, string>>((acc, a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/)
  if (m) acc[m[1]] = m[2] ?? 'true'
  return acc
}, {})

async function main() {
  const states = args.state ? args.state.split(',').map((s) => s.trim().toUpperCase()) : (STATES as readonly string[])
  const years = args.year ? args.year.split(',').map((y) => parseInt(y, 10)) : CYCLES
  const concurrency = parseInt(args.concurrency ?? '4', 10) || 4
  const outDir = path.join(process.cwd(), 'seed')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `polls-${new Date().toISOString().slice(0, 10)}.jsonl`)
  const out = fs.createWriteStream(outPath, { flags: 'a' })

  const tasks: Array<{ state: string; year: number }> = []
  for (const s of states) for (const y of years) tasks.push({ state: s, year: y })

  console.log(`Research pass: ${tasks.length} (state × year) slices, concurrency=${concurrency}, writing to ${outPath}`)

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 30 * 60 * 1000,
    maxRetries: 1,
  })

  let completed = 0
  let totalPolls = 0
  const queue = [...tasks]
  const workers = Array.from({ length: concurrency }, () => worker())
  await Promise.all(workers)
  out.end()
  console.log(`\nDone. ${totalPolls} candidate polls across ${completed} slices → ${outPath}`)
  console.log(`Next: review the file, then import via 'tsx scripts/import-jsonl.ts ${outPath}'.`)

  async function worker() {
    while (queue.length) {
      const task = queue.shift()
      if (!task) return
      try {
        const { polls } = await runSlice(anthropic, task.state, task.year)
        for (const p of polls) out.write(JSON.stringify({ ...p, _slice: task }) + '\n')
        totalPolls += polls.length
        completed++
        process.stdout.write(`\r${completed}/${tasks.length} · ${task.state} ${task.year} → ${polls.length} polls (total ${totalPolls})    `)
      } catch (err) {
        completed++
        process.stdout.write(`\n[error] ${task.state} ${task.year}: ${(err as Error).message}\n`)
      }
    }
  }
}

async function runSlice(
  anthropic: Anthropic,
  state: string,
  year: number,
): Promise<{ polls: Array<Record<string, unknown>> }> {
  const userPrompt = `Find every poll of a ${state} state legislative GENERAL election race held in the ${year} cycle.
- Both partisan internals and nonpartisan/public polls.
- Race-level only (no chamber-control or generic ballot).
- Use web search aggressively across pollster archives, news, campaigns, party committees, and aggregators.
- Return the JSON described in your system instructions.`

  const useWebSearch = process.env.RESEARCH_WEB_SEARCH === '1'
  const opts: Anthropic.MessageStreamParams = {
    model: 'claude-sonnet-4-6',
    max_tokens: 12288,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  }
  if (useWebSearch) {
    opts.tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 } as never]
  }

  const stream = anthropic.messages.stream(opts)
  const final = await stream.finalMessage()
  const text = final.content
    .filter((c) => c.type === 'text')
    .map((c) => (c as { text: string }).text)
    .join('\n')

  if (process.env.RESEARCH_DEBUG === '1') {
    process.stdout.write(`\n--- RAW RESPONSE for ${state} ${year} ---\n${text.slice(0, 3000)}\n--- END ---\n`)
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { polls: [] }
  try {
    const parsed = JSON.parse(jsonMatch[0])
    return { polls: Array.isArray(parsed.polls) ? parsed.polls : [] }
  } catch {
    return { polls: [] }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
