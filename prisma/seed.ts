import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import { PrismaClient } from '../lib/generated/prisma/client'
import { ChamberType, PartisanLean, SourceKind } from '../lib/generated/prisma/enums'

const prisma = new PrismaClient()

const STATES: Array<[string, string]> = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
]

// State-specific lower / upper chamber names where they diverge from "House"/"Senate".
const LOWER_CHAMBER_NAMES: Record<string, string> = {
  CA: 'State Assembly',
  NV: 'State Assembly',
  NJ: 'General Assembly',
  NY: 'State Assembly',
  WI: 'State Assembly',
  VA: 'House of Delegates',
  WV: 'House of Delegates',
  MD: 'House of Delegates',
  MA: 'House of Representatives',
}

const UPPER_CHAMBER_NAMES: Record<string, string> = {}

const POLLSTERS: Array<{ slug: string; name: string; lean: PartisanLean; url?: string }> = [
  { slug: 'public-policy-polling', name: 'Public Policy Polling', lean: PartisanLean.D, url: 'https://www.publicpolicypolling.com' },
  { slug: 'global-strategy-group', name: 'Global Strategy Group', lean: PartisanLean.D, url: 'https://globalstrategygroup.com' },
  { slug: 'tulchin-research', name: 'Tulchin Research', lean: PartisanLean.D, url: 'https://tulchinresearch.com' },
  { slug: 'gbao-strategies', name: 'GBAO Strategies', lean: PartisanLean.D, url: 'https://gbaostrategies.com' },
  { slug: 'fm3-research', name: 'FM3 Research', lean: PartisanLean.D, url: 'https://fm3research.com' },
  { slug: 'garin-hart-yang', name: 'Garin-Hart-Yang Research Group', lean: PartisanLean.D },
  { slug: 'change-research', name: 'Change Research', lean: PartisanLean.D, url: 'https://changeresearch.com' },
  { slug: 'patinkin-research', name: 'Patinkin Research Strategies', lean: PartisanLean.D },
  { slug: 'lake-research', name: 'Lake Research Partners', lean: PartisanLean.D, url: 'https://lakeresearch.com' },
  { slug: 'normington-petts', name: 'Normington, Petts & Associates', lean: PartisanLean.D },
  { slug: 'public-opinion-strategies', name: 'Public Opinion Strategies', lean: PartisanLean.R, url: 'https://pos.org' },
  { slug: 'cygnal', name: 'Cygnal', lean: PartisanLean.R, url: 'https://www.cygn.al' },
  { slug: 'echelon-insights', name: 'Echelon Insights', lean: PartisanLean.R, url: 'https://echeloninsights.com' },
  { slug: 'onmessage-inc', name: 'OnMessage Inc.', lean: PartisanLean.R },
  { slug: 'mclaughlin-associates', name: 'McLaughlin & Associates', lean: PartisanLean.R },
  { slug: 'trafalgar-group', name: 'Trafalgar Group', lean: PartisanLean.R, url: 'https://www.thetrafalgargroup.org' },
  { slug: 'co-efficient', name: 'co/efficient', lean: PartisanLean.R, url: 'https://coefficient.us' },
  { slug: 'fabrizio-lee', name: 'Fabrizio, Lee & Associates', lean: PartisanLean.R },
  { slug: 'remington-research', name: 'Remington Research Group', lean: PartisanLean.R },
  { slug: 'susquehanna-polling', name: 'Susquehanna Polling & Research', lean: PartisanLean.R, url: 'https://susquehannapolling.com' },
  { slug: 'mason-dixon', name: 'Mason-Dixon Polling & Strategy', lean: PartisanLean.NONPARTISAN, url: 'https://www.masondixonpolling.com' },
  { slug: 'emerson-college-polling', name: 'Emerson College Polling', lean: PartisanLean.NONPARTISAN, url: 'https://www.emerson.edu/polling' },
  { slug: 'suffolk-university', name: 'Suffolk University Political Research Center', lean: PartisanLean.NONPARTISAN },
  { slug: 'marist-poll', name: 'Marist Poll', lean: PartisanLean.NONPARTISAN, url: 'https://maristpoll.marist.edu' },
  { slug: 'monmouth-university', name: 'Monmouth University Polling Institute', lean: PartisanLean.NONPARTISAN, url: 'https://www.monmouth.edu/polling-institute' },
  { slug: 'siena-college-research', name: 'Siena College Research Institute', lean: PartisanLean.NONPARTISAN, url: 'https://scri.siena.edu' },
  { slug: 'roanoke-college', name: 'Roanoke College Institute for Policy and Opinion Research', lean: PartisanLean.NONPARTISAN, url: 'https://www.roanoke.edu/ipor' },
  { slug: 'wason-center', name: 'Wason Center for Civic Leadership (Christopher Newport)', lean: PartisanLean.NONPARTISAN },
  { slug: 'eagleton-rutgers', name: 'Eagleton Center for Public Interest Polling (Rutgers)', lean: PartisanLean.NONPARTISAN },
  { slug: 'hofstra-university', name: 'Hofstra University', lean: PartisanLean.NONPARTISAN },
  { slug: 'quinnipiac-university', name: 'Quinnipiac University Poll', lean: PartisanLean.NONPARTISAN, url: 'https://poll.qu.edu' },
  { slug: 'university-of-new-hampshire', name: 'University of New Hampshire Survey Center', lean: PartisanLean.NONPARTISAN, url: 'https://carsey.unh.edu' },
  { slug: 'st-pete-polls', name: 'St. Pete Polls', lean: PartisanLean.NONPARTISAN, url: 'https://www.stpetepolls.org' },
  { slug: 'data-orbital', name: 'Data Orbital', lean: PartisanLean.R, url: 'https://www.dataorbital.com' },
  { slug: 'morning-consult', name: 'Morning Consult', lean: PartisanLean.NONPARTISAN, url: 'https://morningconsult.com' },
  { slug: 'spry-strategies', name: 'Spry Strategies', lean: PartisanLean.R },
  { slug: 'embold-research', name: 'Embold Research', lean: PartisanLean.D },
  { slug: 'noble-predictive-insights', name: 'Noble Predictive Insights', lean: PartisanLean.NONPARTISAN, url: 'https://noblepredictiveinsights.com' },
  { slug: 'opinion-savvy', name: 'OpinionSavvy / InsiderAdvantage', lean: PartisanLean.R },
  { slug: 'cherry-communications', name: 'Cherry Communications', lean: PartisanLean.R },
]

const SOURCES: Array<{ url: string; label: string; kind: SourceKind; notes?: string }> = [
  { url: 'https://www.dailykos.com/blogs/elections', label: 'The Downballot — Daily Kos Elections', kind: SourceKind.HTML, notes: 'Aggregator the user flagged. Sweeps state legislative coverage.' },
  { url: 'https://ballotpedia.org/Polling_on_state_legislative_elections', label: 'Ballotpedia — Polling on state legislative elections', kind: SourceKind.HTML },
  { url: 'https://www.publicpolicypolling.com/polls/', label: 'Public Policy Polling — polls archive', kind: SourceKind.HTML },
  { url: 'https://www.cygn.al/category/polls/', label: 'Cygnal — polls archive', kind: SourceKind.HTML },
  { url: 'https://changeresearch.com/insights/', label: 'Change Research — insights archive', kind: SourceKind.HTML },
  { url: 'https://emersoncollegepolling.com/category/polls/', label: 'Emerson College Polling — polls', kind: SourceKind.HTML },
  { url: 'https://www.monmouth.edu/polling-institute/reports/', label: 'Monmouth — polling reports', kind: SourceKind.HTML },
  { url: 'https://scri.siena.edu/category/polls/', label: 'Siena College Research Institute — polls', kind: SourceKind.HTML },
  { url: 'https://maristpoll.marist.edu/category/polls/', label: 'Marist Poll archive', kind: SourceKind.HTML },
  { url: 'https://carsey.unh.edu/research/publications-research?topic=polls', label: 'UNH Survey Center publications', kind: SourceKind.HTML },
  { url: 'https://wason.cnu.edu/wason-center-polls/', label: 'Wason Center polls (CNU)', kind: SourceKind.HTML },
  { url: 'https://www.roanoke.edu/inside/a-z_index/ipor/poll_archive', label: 'Roanoke College IPOR poll archive', kind: SourceKind.HTML },
  { url: 'https://www.stpetepolls.org/', label: 'St. Pete Polls archive', kind: SourceKind.HTML },
  { url: 'https://www.dataorbital.com/news/', label: 'Data Orbital news/poll releases', kind: SourceKind.HTML },
  { url: 'https://noblepredictiveinsights.com/insights/', label: 'Noble Predictive Insights releases', kind: SourceKind.HTML },
  { url: 'https://www.dailykos.com/stories/poll-roundup', label: 'Daily Kos Elections — poll roundups', kind: SourceKind.HTML },
  { url: 'https://politicsny.com/category/polls/', label: 'PoliticsNY — polls', kind: SourceKind.HTML },
  { url: 'https://www.politico.com/news/state-politics', label: 'Politico — state politics', kind: SourceKind.HTML },
  { url: 'https://www.virginiamercury.com/category/polls/', label: 'Virginia Mercury — polls', kind: SourceKind.HTML },
  { url: 'https://newjerseyglobe.com/category/polls/', label: 'New Jersey Globe — polls', kind: SourceKind.HTML },
]

async function main() {
  console.log('Seeding states…')
  for (const [code, name] of STATES) {
    await prisma.state.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    })
  }

  console.log('Seeding chambers…')
  for (const [code, _name] of STATES) {
    if (code === 'NE') {
      await prisma.chamber.upsert({
        where: { id: 'NE-LEG' },
        update: {},
        create: {
          id: 'NE-LEG',
          stateCode: code,
          type: ChamberType.UNICAMERAL,
          name: 'Nebraska Legislature',
        },
      })
      continue
    }
    const lower = LOWER_CHAMBER_NAMES[code] ?? 'House of Representatives'
    const upper = UPPER_CHAMBER_NAMES[code] ?? 'State Senate'
    await prisma.chamber.upsert({
      where: { id: `${code}-HOUSE` },
      update: { name: lower },
      create: { id: `${code}-HOUSE`, stateCode: code, type: ChamberType.HOUSE, name: lower },
    })
    await prisma.chamber.upsert({
      where: { id: `${code}-SENATE` },
      update: { name: upper },
      create: { id: `${code}-SENATE`, stateCode: code, type: ChamberType.SENATE, name: upper },
    })
  }

  console.log('Seeding pollsters…')
  for (const p of POLLSTERS) {
    await prisma.pollster.upsert({
      where: { slug: p.slug },
      update: { name: p.name, defaultPartisanLean: p.lean, websiteUrl: p.url ?? null },
      create: {
        slug: p.slug,
        name: p.name,
        defaultPartisanLean: p.lean,
        websiteUrl: p.url ?? null,
      },
    })
  }

  console.log('Seeding sources…')
  for (const s of SOURCES) {
    await prisma.source.upsert({
      where: { url: s.url },
      update: { label: s.label, kind: s.kind, notes: s.notes ?? null },
      create: { url: s.url, label: s.label, kind: s.kind, notes: s.notes ?? null },
    })
  }

  const [stateCount, chamberCount, pollsterCount, sourceCount] = await Promise.all([
    prisma.state.count(),
    prisma.chamber.count(),
    prisma.pollster.count(),
    prisma.source.count(),
  ])
  console.log(`Seeded: ${stateCount} states, ${chamberCount} chambers, ${pollsterCount} pollsters, ${sourceCount} sources.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
