import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'
import { buildPollWhere, type PollFilterParams } from '@/lib/poll-filters-server'

export const revalidate = 60

export async function GET(req: Request) {
  const url = new URL(req.url)
  const params: PollFilterParams = {
    state: url.searchParams.get('state') ?? undefined,
    city: url.searchParams.get('city') ?? undefined,
    year: url.searchParams.get('year') ?? undefined,
    raceType: url.searchParams.get('raceType') ?? undefined,
    sponsor: url.searchParams.get('sponsor') ?? undefined,
    pollster: url.searchParams.get('pollster') ?? undefined,
    days: url.searchParams.get('days') ?? undefined,
  }
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '500', 10) || 500, 2000)

  const where = buildPollWhere(params)
  const polls = await prisma.poll.findMany({
    where,
    orderBy: [{ endDate: 'desc' }, { id: 'desc' }],
    take: limit,
    include: {
      pollster: { select: { slug: true, name: true } },
      race: {
        select: {
          id: true, citySlug: true, electionDate: true, electionYear: true, raceType: true, party: true,
          winnerName: true, winnerPct: true, runnerUpName: true, runnerUpPct: true, topMargin: true,
          actualResults: true,
          city: { select: { slug: true, name: true, stateCode: true } },
        },
      },
    },
  })

  return NextResponse.json({
    count: polls.length,
    limit,
    filters: params,
    polls,
  })
}
