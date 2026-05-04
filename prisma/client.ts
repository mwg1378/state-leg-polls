import { PrismaClient } from '@db/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function makeClient() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!connectionString) throw new Error('DATABASE_URL not set')
  const url = new URL(connectionString)
  const pool = new pg.Pool({
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

// Lazy proxy so the underlying PrismaClient isn't constructed until first use.
// This lets scripts call dotenv.config() between import time and first DB use.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = makeClient()
    }
    const value = (globalForPrisma.prisma as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value
  },
})

export default prisma
