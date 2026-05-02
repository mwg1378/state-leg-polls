import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv()

import { PrismaClient } from '../lib/generated/prisma/client'
import { PartisanLean, SourceKind } from '../lib/generated/prisma/enums'
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

// 2020 census + 2024 estimates. US cities with population ≥ 200,000.
// Slugs: lowercase, state suffix to disambiguate (e.g. portland-or, portland-me).
const CITIES: Array<{ slug: string; name: string; state: string; pop: number }> = [
  { slug: 'new-york-ny', name: 'New York', state: 'NY', pop: 8336817 },
  { slug: 'los-angeles-ca', name: 'Los Angeles', state: 'CA', pop: 3898747 },
  { slug: 'chicago-il', name: 'Chicago', state: 'IL', pop: 2746388 },
  { slug: 'houston-tx', name: 'Houston', state: 'TX', pop: 2304580 },
  { slug: 'phoenix-az', name: 'Phoenix', state: 'AZ', pop: 1608139 },
  { slug: 'philadelphia-pa', name: 'Philadelphia', state: 'PA', pop: 1603797 },
  { slug: 'san-antonio-tx', name: 'San Antonio', state: 'TX', pop: 1434625 },
  { slug: 'san-diego-ca', name: 'San Diego', state: 'CA', pop: 1386932 },
  { slug: 'dallas-tx', name: 'Dallas', state: 'TX', pop: 1304379 },
  { slug: 'san-jose-ca', name: 'San Jose', state: 'CA', pop: 1013240 },
  { slug: 'austin-tx', name: 'Austin', state: 'TX', pop: 961855 },
  { slug: 'jacksonville-fl', name: 'Jacksonville', state: 'FL', pop: 949611 },
  { slug: 'fort-worth-tx', name: 'Fort Worth', state: 'TX', pop: 918915 },
  { slug: 'columbus-oh', name: 'Columbus', state: 'OH', pop: 905748 },
  { slug: 'indianapolis-in', name: 'Indianapolis', state: 'IN', pop: 887642 },
  { slug: 'charlotte-nc', name: 'Charlotte', state: 'NC', pop: 874579 },
  { slug: 'san-francisco-ca', name: 'San Francisco', state: 'CA', pop: 873965 },
  { slug: 'seattle-wa', name: 'Seattle', state: 'WA', pop: 737015 },
  { slug: 'denver-co', name: 'Denver', state: 'CO', pop: 715522 },
  { slug: 'washington-dc', name: 'Washington', state: 'DC', pop: 689545 },
  { slug: 'nashville-tn', name: 'Nashville', state: 'TN', pop: 689447 },
  { slug: 'oklahoma-city-ok', name: 'Oklahoma City', state: 'OK', pop: 681054 },
  { slug: 'el-paso-tx', name: 'El Paso', state: 'TX', pop: 678815 },
  { slug: 'boston-ma', name: 'Boston', state: 'MA', pop: 675647 },
  { slug: 'portland-or', name: 'Portland', state: 'OR', pop: 652503 },
  { slug: 'las-vegas-nv', name: 'Las Vegas', state: 'NV', pop: 641903 },
  { slug: 'detroit-mi', name: 'Detroit', state: 'MI', pop: 639111 },
  { slug: 'memphis-tn', name: 'Memphis', state: 'TN', pop: 633104 },
  { slug: 'louisville-ky', name: 'Louisville', state: 'KY', pop: 615366 },
  { slug: 'baltimore-md', name: 'Baltimore', state: 'MD', pop: 585708 },
  { slug: 'milwaukee-wi', name: 'Milwaukee', state: 'WI', pop: 577222 },
  { slug: 'albuquerque-nm', name: 'Albuquerque', state: 'NM', pop: 564559 },
  { slug: 'tucson-az', name: 'Tucson', state: 'AZ', pop: 542629 },
  { slug: 'fresno-ca', name: 'Fresno', state: 'CA', pop: 542107 },
  { slug: 'sacramento-ca', name: 'Sacramento', state: 'CA', pop: 524943 },
  { slug: 'mesa-az', name: 'Mesa', state: 'AZ', pop: 504258 },
  { slug: 'kansas-city-mo', name: 'Kansas City', state: 'MO', pop: 508090 },
  { slug: 'atlanta-ga', name: 'Atlanta', state: 'GA', pop: 498715 },
  { slug: 'long-beach-ca', name: 'Long Beach', state: 'CA', pop: 466742 },
  { slug: 'colorado-springs-co', name: 'Colorado Springs', state: 'CO', pop: 478221 },
  { slug: 'raleigh-nc', name: 'Raleigh', state: 'NC', pop: 467665 },
  { slug: 'miami-fl', name: 'Miami', state: 'FL', pop: 442241 },
  { slug: 'virginia-beach-va', name: 'Virginia Beach', state: 'VA', pop: 459470 },
  { slug: 'omaha-ne', name: 'Omaha', state: 'NE', pop: 486051 },
  { slug: 'oakland-ca', name: 'Oakland', state: 'CA', pop: 440646 },
  { slug: 'minneapolis-mn', name: 'Minneapolis', state: 'MN', pop: 429954 },
  { slug: 'tulsa-ok', name: 'Tulsa', state: 'OK', pop: 413066 },
  { slug: 'arlington-tx', name: 'Arlington', state: 'TX', pop: 394266 },
  { slug: 'tampa-fl', name: 'Tampa', state: 'FL', pop: 384959 },
  { slug: 'new-orleans-la', name: 'New Orleans', state: 'LA', pop: 383997 },
  { slug: 'wichita-ks', name: 'Wichita', state: 'KS', pop: 397532 },
  { slug: 'cleveland-oh', name: 'Cleveland', state: 'OH', pop: 372624 },
  { slug: 'bakersfield-ca', name: 'Bakersfield', state: 'CA', pop: 403455 },
  { slug: 'aurora-co', name: 'Aurora', state: 'CO', pop: 386261 },
  { slug: 'anaheim-ca', name: 'Anaheim', state: 'CA', pop: 346824 },
  { slug: 'honolulu-hi', name: 'Honolulu', state: 'HI', pop: 350964 },
  { slug: 'santa-ana-ca', name: 'Santa Ana', state: 'CA', pop: 310227 },
  { slug: 'riverside-ca', name: 'Riverside', state: 'CA', pop: 314998 },
  { slug: 'corpus-christi-tx', name: 'Corpus Christi', state: 'TX', pop: 317863 },
  { slug: 'lexington-ky', name: 'Lexington', state: 'KY', pop: 322570 },
  { slug: 'stockton-ca', name: 'Stockton', state: 'CA', pop: 320804 },
  { slug: 'henderson-nv', name: 'Henderson', state: 'NV', pop: 322178 },
  { slug: 'saint-paul-mn', name: 'Saint Paul', state: 'MN', pop: 311527 },
  { slug: 'st-louis-mo', name: 'St. Louis', state: 'MO', pop: 301578 },
  { slug: 'cincinnati-oh', name: 'Cincinnati', state: 'OH', pop: 309317 },
  { slug: 'pittsburgh-pa', name: 'Pittsburgh', state: 'PA', pop: 302971 },
  { slug: 'greensboro-nc', name: 'Greensboro', state: 'NC', pop: 299035 },
  { slug: 'anchorage-ak', name: 'Anchorage', state: 'AK', pop: 291247 },
  { slug: 'plano-tx', name: 'Plano', state: 'TX', pop: 285494 },
  { slug: 'lincoln-ne', name: 'Lincoln', state: 'NE', pop: 291082 },
  { slug: 'orlando-fl', name: 'Orlando', state: 'FL', pop: 307573 },
  { slug: 'irvine-ca', name: 'Irvine', state: 'CA', pop: 307670 },
  { slug: 'newark-nj', name: 'Newark', state: 'NJ', pop: 311549 },
  { slug: 'durham-nc', name: 'Durham', state: 'NC', pop: 283506 },
  { slug: 'chula-vista-ca', name: 'Chula Vista', state: 'CA', pop: 275487 },
  { slug: 'toledo-oh', name: 'Toledo', state: 'OH', pop: 270871 },
  { slug: 'fort-wayne-in', name: 'Fort Wayne', state: 'IN', pop: 263886 },
  { slug: 'jersey-city-nj', name: 'Jersey City', state: 'NJ', pop: 292449 },
  { slug: 'st-petersburg-fl', name: 'St. Petersburg', state: 'FL', pop: 258308 },
  { slug: 'laredo-tx', name: 'Laredo', state: 'TX', pop: 261639 },
  { slug: 'madison-wi', name: 'Madison', state: 'WI', pop: 269840 },
  { slug: 'lubbock-tx', name: 'Lubbock', state: 'TX', pop: 257141 },
  { slug: 'winston-salem-nc', name: 'Winston-Salem', state: 'NC', pop: 249545 },
  { slug: 'garland-tx', name: 'Garland', state: 'TX', pop: 246018 },
  { slug: 'glendale-az', name: 'Glendale', state: 'AZ', pop: 248325 },
  { slug: 'hialeah-fl', name: 'Hialeah', state: 'FL', pop: 223109 },
  { slug: 'reno-nv', name: 'Reno', state: 'NV', pop: 264165 },
  { slug: 'chesapeake-va', name: 'Chesapeake', state: 'VA', pop: 249422 },
  { slug: 'gilbert-az', name: 'Gilbert', state: 'AZ', pop: 267918 },
  { slug: 'baton-rouge-la', name: 'Baton Rouge', state: 'LA', pop: 227470 },
  { slug: 'irving-tx', name: 'Irving', state: 'TX', pop: 256684 },
  { slug: 'scottsdale-az', name: 'Scottsdale', state: 'AZ', pop: 241361 },
  { slug: 'north-las-vegas-nv', name: 'North Las Vegas', state: 'NV', pop: 262527 },
  { slug: 'fremont-ca', name: 'Fremont', state: 'CA', pop: 230504 },
  { slug: 'boise-id', name: 'Boise', state: 'ID', pop: 235684 },
  { slug: 'richmond-va', name: 'Richmond', state: 'VA', pop: 226610 },
  { slug: 'san-bernardino-ca', name: 'San Bernardino', state: 'CA', pop: 222203 },
  { slug: 'birmingham-al', name: 'Birmingham', state: 'AL', pop: 200733 },
  { slug: 'spokane-wa', name: 'Spokane', state: 'WA', pop: 228989 },
  { slug: 'rochester-ny', name: 'Rochester', state: 'NY', pop: 211328 },
  { slug: 'des-moines-ia', name: 'Des Moines', state: 'IA', pop: 214133 },
  { slug: 'modesto-ca', name: 'Modesto', state: 'CA', pop: 218464 },
  { slug: 'fayetteville-nc', name: 'Fayetteville', state: 'NC', pop: 208501 },
  { slug: 'tacoma-wa', name: 'Tacoma', state: 'WA', pop: 219346 },
  { slug: 'oxnard-ca', name: 'Oxnard', state: 'CA', pop: 202063 },
  { slug: 'fontana-ca', name: 'Fontana', state: 'CA', pop: 208393 },
  { slug: 'columbus-ga', name: 'Columbus', state: 'GA', pop: 206922 },
  { slug: 'montgomery-al', name: 'Montgomery', state: 'AL', pop: 200603 },
  { slug: 'moreno-valley-ca', name: 'Moreno Valley', state: 'CA', pop: 208634 },
  { slug: 'shreveport-la', name: 'Shreveport', state: 'LA', pop: 187593 },
  { slug: 'aurora-il', name: 'Aurora', state: 'IL', pop: 180542 },
  { slug: 'yonkers-ny', name: 'Yonkers', state: 'NY', pop: 211569 },
  { slug: 'akron-oh', name: 'Akron', state: 'OH', pop: 190469 },
  { slug: 'huntington-beach-ca', name: 'Huntington Beach', state: 'CA', pop: 198711 },
  { slug: 'glendale-ca', name: 'Glendale', state: 'CA', pop: 196543 },
  { slug: 'grand-rapids-mi', name: 'Grand Rapids', state: 'MI', pop: 198917 },
  { slug: 'salt-lake-city-ut', name: 'Salt Lake City', state: 'UT', pop: 199723 },
  { slug: 'tallahassee-fl', name: 'Tallahassee', state: 'FL', pop: 196169 },
  { slug: 'huntsville-al', name: 'Huntsville', state: 'AL', pop: 215006 },
  { slug: 'worcester-ma', name: 'Worcester', state: 'MA', pop: 206518 },
  { slug: 'knoxville-tn', name: 'Knoxville', state: 'TN', pop: 190740 },
  { slug: 'newport-news-va', name: 'Newport News', state: 'VA', pop: 186247 },
  { slug: 'providence-ri', name: 'Providence', state: 'RI', pop: 190934 },
]

const POLLSTERS: Array<{ slug: string; name: string; lean: PartisanLean; url?: string }> = [
  { slug: 'siena-college-research', name: 'Siena College Research Institute', lean: PartisanLean.NONPARTISAN },
  { slug: 'nyt-siena', name: 'New York Times / Siena College', lean: PartisanLean.NONPARTISAN },
  { slug: 'marist-poll', name: 'Marist Poll', lean: PartisanLean.NONPARTISAN, url: 'https://maristpoll.marist.edu' },
  { slug: 'quinnipiac-university', name: 'Quinnipiac University Poll', lean: PartisanLean.NONPARTISAN, url: 'https://poll.qu.edu' },
  { slug: 'monmouth-university', name: 'Monmouth University Polling Institute', lean: PartisanLean.NONPARTISAN },
  { slug: 'suffolk-university', name: 'Suffolk University Political Research Center', lean: PartisanLean.NONPARTISAN },
  { slug: 'emerson-college-polling', name: 'Emerson College Polling', lean: PartisanLean.NONPARTISAN },
  { slug: 'mason-dixon', name: 'Mason-Dixon Polling & Strategy', lean: PartisanLean.NONPARTISAN },
  { slug: 'public-policy-polling', name: 'Public Policy Polling', lean: PartisanLean.D },
  { slug: 'change-research', name: 'Change Research', lean: PartisanLean.D },
  { slug: 'global-strategy-group', name: 'Global Strategy Group', lean: PartisanLean.D },
  { slug: 'tulchin-research', name: 'Tulchin Research', lean: PartisanLean.D },
  { slug: 'fm3-research', name: 'FM3 Research', lean: PartisanLean.D },
  { slug: 'embold-research', name: 'Embold Research', lean: PartisanLean.D },
  { slug: 'public-opinion-strategies', name: 'Public Opinion Strategies', lean: PartisanLean.R },
  { slug: 'cygnal', name: 'Cygnal', lean: PartisanLean.R },
  { slug: 'echelon-insights', name: 'Echelon Insights', lean: PartisanLean.R },
  { slug: 'co-efficient', name: 'co/efficient', lean: PartisanLean.R },
  { slug: 'fabrizio-lee', name: 'Fabrizio, Lee & Associates', lean: PartisanLean.R },
  { slug: 'm4-strategies', name: 'M4 Strategies', lean: PartisanLean.R },
  { slug: 'noble-predictive-insights', name: 'Noble Predictive Insights', lean: PartisanLean.NONPARTISAN, url: 'https://noblepredictiveinsights.com' },
  { slug: 'data-orbital', name: 'Data Orbital', lean: PartisanLean.R },
  { slug: 'morning-consult', name: 'Morning Consult', lean: PartisanLean.NONPARTISAN },
  { slug: 'st-pete-polls', name: 'St. Pete Polls', lean: PartisanLean.NONPARTISAN },
  { slug: 'spry-strategies', name: 'Spry Strategies', lean: PartisanLean.R },
  { slug: 'wpa-intelligence', name: 'WPA Intelligence', lean: PartisanLean.R },
  { slug: 'normington-petts', name: 'Normington, Petts & Associates', lean: PartisanLean.D },
  { slug: 'lake-research', name: 'Lake Research Partners', lean: PartisanLean.D },
  { slug: 'oh-predictive-insights', name: 'OH Predictive Insights', lean: PartisanLean.NONPARTISAN },
  { slug: 'kpcc-loyola-marymount', name: 'KPCC / Loyola Marymount University', lean: PartisanLean.NONPARTISAN },
  { slug: 'berkeley-igs', name: 'UC Berkeley IGS', lean: PartisanLean.NONPARTISAN },
  { slug: 'university-of-chicago-gsi', name: 'University of Chicago GenForward / Center for Effective Government', lean: PartisanLean.NONPARTISAN },
  { slug: 'capitol-fax-mr-research', name: 'Capitol Fax / M.R. Research', lean: PartisanLean.NONPARTISAN },
  { slug: 'crain-ogden', name: 'Crain\'s / Ogden & Fry', lean: PartisanLean.NONPARTISAN },
  { slug: 'wbez-suffolk', name: 'WBEZ / Suffolk University', lean: PartisanLean.NONPARTISAN },
  { slug: 'patinkin-research', name: 'Patinkin Research Strategies', lean: PartisanLean.D },
  { slug: 'gbao-strategies', name: 'GBAO Strategies', lean: PartisanLean.D },
  { slug: 'survey-usa', name: 'SurveyUSA', lean: PartisanLean.NONPARTISAN },
  { slug: 'kff-public-policy', name: 'KFF', lean: PartisanLean.NONPARTISAN },
  { slug: 'edison-research', name: 'Edison Research', lean: PartisanLean.NONPARTISAN },
]

const SOURCES: Array<{ url: string; label: string; kind: SourceKind; notes?: string }> = [
  { url: 'https://en.wikipedia.org/wiki/Category:Mayoral_elections_in_the_United_States', label: 'Wikipedia: mayoral elections category', kind: SourceKind.HTML },
]

async function main() {
  console.log('Seeding cities…')
  for (const c of CITIES) {
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: { name: c.name, stateCode: c.state, population: c.pop },
      create: { slug: c.slug, name: c.name, stateCode: c.state, population: c.pop },
    })
  }

  console.log('Seeding pollsters…')
  for (const p of POLLSTERS) {
    await prisma.pollster.upsert({
      where: { slug: p.slug },
      update: { name: p.name, defaultPartisanLean: p.lean, websiteUrl: p.url ?? null },
      create: { slug: p.slug, name: p.name, defaultPartisanLean: p.lean, websiteUrl: p.url ?? null },
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

  const [cityCount, pollsterCount, sourceCount] = await Promise.all([
    prisma.city.count(),
    prisma.pollster.count(),
    prisma.source.count(),
  ])
  console.log(`Seeded: ${cityCount} cities, ${pollsterCount} pollsters, ${sourceCount} sources.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
