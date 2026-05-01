#!/usr/bin/env tsx
/**
 * Review PENDING polls (from cron or research-import) and mark each as PUBLISHED or REJECTED.
 *
 * Usage:
 *   npm run research:review                  # interactive
 *   npm run research:review -- --approve-all # bulk publish all pending (use with care)
 *   npm run research:review -- --count       # just show how many are pending
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { PrismaClient } from '../lib/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = new Set(process.argv.slice(2))

  if (args.has('--count')) {
    const n = await prisma.poll.count({ where: { status: 'PENDING' } })
    console.log(`${n} polls pending review.`)
    return
  }

  if (args.has('--approve-all')) {
    const n = await prisma.poll.updateMany({ where: { status: 'PENDING' }, data: { status: 'PUBLISHED' } })
    console.log(`Approved ${n.count} polls.`)
    return
  }

  const rl = readline.createInterface({ input: stdin, output: stdout })
  while (true) {
    const poll = await prisma.poll.findFirst({
      where: { status: 'PENDING' },
      orderBy: { addedAt: 'asc' },
      include: {
        pollster: true,
        race: { include: { state: true, chamber: true } },
      },
    })
    if (!poll) {
      console.log('No pending polls.')
      break
    }
    console.log('\n' + '─'.repeat(60))
    console.log(`${poll.race.state.name} — ${poll.race.chamber.name} District ${poll.race.district} · ${poll.race.electionYear}`)
    console.log(`Pollster: ${poll.pollster.name}`)
    console.log(`Sponsor:  ${poll.sponsor} [${poll.sponsorType}]`)
    console.log(`Field:    ${poll.startDate.toISOString().slice(0, 10)} → ${poll.endDate.toISOString().slice(0, 10)} (${poll.daysToElection}d to election)`)
    console.log(`Result:   D ${poll.dPct.toFixed(1)} / R ${poll.rPct.toFixed(1)} → margin ${poll.margin.toFixed(1)}`)
    if (poll.sampleSize) console.log(`Sample:   ${poll.sampleSize} (${poll.population})`)
    if (poll.mode) console.log(`Mode:     ${poll.mode}`)
    if (poll.methodologyNotes) console.log(`Notes:    ${poll.methodologyNotes}`)
    console.log(`Source:   ${poll.sourceUrl}`)

    const ans = (await rl.question('[y]es / [n]o / [s]kip / [q]uit > ')).trim().toLowerCase()
    if (ans === 'q' || ans === 'quit') break
    if (ans === 's' || ans === 'skip') continue
    if (ans === 'y' || ans === 'yes') {
      await prisma.poll.update({ where: { id: poll.id }, data: { status: 'PUBLISHED' } })
      console.log('  → PUBLISHED')
    } else if (ans === 'n' || ans === 'no') {
      await prisma.poll.update({ where: { id: poll.id }, data: { status: 'REJECTED' } })
      console.log('  → REJECTED')
    } else {
      console.log('  ? unknown — skipping')
    }
  }
  rl.close()
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
