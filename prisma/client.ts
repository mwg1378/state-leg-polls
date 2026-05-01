import { PrismaClient } from '@db/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function makeClient() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not set')
  const url = raw.replace(/\?pgbouncer=true&?/, '?').replace(/[?&]$/, '')
  const adapter = new PrismaPg({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? makeClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
