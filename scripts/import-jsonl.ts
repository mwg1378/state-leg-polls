#!/usr/bin/env tsx
/**
 * Import a polls JSONL file (output of research-curated) into the DB.
 *
 * Usage:
 *   npm run research:import -- seed/polls-curated-YYYY-MM-DD.jsonl
 *   npm run research:import -- --status=PUBLISHED seed/polls-curated-YYYY-MM-DD.jsonl
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import fs from 'node:fs'
import readline from 'node:readline'
import { ingestCandidatePoll } from '../lib/ingest'

async function main() {
  const args = process.argv.slice(2)
  let status: 'PENDING' | 'PUBLISHED' = 'PENDING'
  const positional: string[] = []
  for (const a of args) {
    if (a === '--published' || a === '--status=PUBLISHED') status = 'PUBLISHED'
    else if (!a.startsWith('--')) positional.push(a)
  }
  const file = positional[0]
  if (!file) {
    console.error('Usage: tsx scripts/import-jsonl.ts <file.jsonl> [--published]')
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
      const ok = await ingestCandidatePoll(p, `import:${file}`, status)
      if (ok) imported++
      else skipped++
    } catch (err) {
      skipped++
      console.warn(`[skip] line ${total}: ${(err as Error).message}`)
    }
  }
  console.log(`Done. ${imported} imported (${status}), ${skipped} skipped (of ${total}).`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
