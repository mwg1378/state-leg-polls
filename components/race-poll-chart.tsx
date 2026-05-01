'use client'

import {
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format } from 'date-fns'
import { sponsorLean } from '@/lib/labels'
import type { SponsorType } from '@/lib/generated/prisma/enums'

export type ChartPoint = {
  endDate: string
  margin: number
  pollster: string
  sponsor: string
  sponsorType: SponsorType
}

export function RacePollChart({
  points,
  electionDate,
  actualMargin,
}: {
  points: ChartPoint[]
  electionDate: string
  actualMargin: number | null
}) {
  if (points.length === 0) return null

  const data = points.map((p) => ({
    ...p,
    t: new Date(p.endDate).getTime(),
  }))

  const electionT = new Date(electionDate).getTime()

  const allMargins = data.map((d) => d.margin)
  if (actualMargin != null) allMargins.push(actualMargin)
  const yMin = Math.min(...allMargins) - 5
  const yMax = Math.max(...allMargins) + 5

  // group by sponsor lean for color
  const dPoints = data.filter((d) => sponsorLean(d.sponsorType) === 'D')
  const rPoints = data.filter((d) => sponsorLean(d.sponsorType) === 'R')
  const nPoints = data.filter((d) => sponsorLean(d.sponsorType) === 'NEUTRAL')

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <ComposedChart margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            type="number"
            dataKey="t"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => format(new Date(t), 'MMM yy')}
            stroke="currentColor"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="margin"
            domain={[yMin, yMax]}
            tickFormatter={(v) => (v > 0 ? `D+${v}` : v < 0 ? `R+${Math.abs(v)}` : '0')}
            stroke="currentColor"
            tick={{ fontSize: 11 }}
            width={48}
          />
          <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.5} />
          <ReferenceLine x={electionT} stroke="currentColor" strokeOpacity={0.5} strokeDasharray="4 4" label={{ value: 'Election', position: 'top', fill: 'currentColor', fontSize: 11 }} />
          {actualMargin != null ? (
            <ReferenceLine
              y={actualMargin}
              stroke="#22c55e"
              strokeDasharray="4 4"
              label={{ value: `Actual ${actualMargin > 0 ? 'D+' : 'R+'}${Math.abs(actualMargin).toFixed(1)}`, position: 'right', fill: '#22c55e', fontSize: 11 }}
            />
          ) : null}
          <Tooltip
            contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
            labelFormatter={(t) => format(new Date(t as number), 'MMM d, yyyy')}
            formatter={(value: unknown, _name, item) => {
              const p = item.payload as ChartPoint & { t: number }
              const m = value as number
              return [
                `${m > 0 ? 'D+' : m < 0 ? 'R+' : ''}${Math.abs(m).toFixed(1)} — ${p.pollster}`,
                p.sponsor,
              ]
            }}
          />
          <Scatter name="D-sponsored" data={dPoints} fill="#3b82f6" />
          <Scatter name="R-sponsored" data={rPoints} fill="#ef4444" />
          <Scatter name="Nonpartisan" data={nPoints} fill="#a1a1aa" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
