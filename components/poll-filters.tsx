'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { DAYS_BUCKETS } from '@/lib/accuracy'

type Option = { value: string; label: string }

type FiltersProps = {
  states: Option[]
  pollsters: Option[]
  years: number[]
}

export function PollFilters({ states, pollsters, years }: FiltersProps) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value === '') next.delete(key)
    else next.set(key, value)
    startTransition(() => router.replace(`/polls?${next.toString()}`))
  }

  const v = (k: string) => params.get(k) ?? ''

  return (
    <div className="flex flex-wrap items-end gap-3 text-sm" data-pending={pending ? '' : undefined}>
      <Field label="State">
        <select
          value={v('state')}
          onChange={(e) => update('state', e.target.value)}
          className="rounded border border-border bg-background px-2 py-1"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Chamber">
        <select
          value={v('chamber')}
          onChange={(e) => update('chamber', e.target.value)}
          className="rounded border border-border bg-background px-2 py-1"
        >
          <option value="">Both</option>
          <option value="HOUSE">House</option>
          <option value="SENATE">Senate</option>
          <option value="UNICAMERAL">Unicameral</option>
        </select>
      </Field>
      <Field label="Year">
        <select
          value={v('year')}
          onChange={(e) => update('year', e.target.value)}
          className="rounded border border-border bg-background px-2 py-1"
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sponsor type">
        <select
          value={v('sponsor')}
          onChange={(e) => update('sponsor', e.target.value)}
          className="rounded border border-border bg-background px-2 py-1"
        >
          <option value="">All</option>
          <option value="nonpartisan">Nonpartisan / News</option>
          <option value="D">D-sponsored</option>
          <option value="R">R-sponsored</option>
        </select>
      </Field>
      <Field label="Pollster">
        <select
          value={v('pollster')}
          onChange={(e) => update('pollster', e.target.value)}
          className="rounded border border-border bg-background px-2 py-1"
        >
          <option value="">All</option>
          {pollsters.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Days to election">
        <select
          value={v('days')}
          onChange={(e) => update('days', e.target.value)}
          className="rounded border border-border bg-background px-2 py-1"
        >
          <option value="">Any</option>
          {DAYS_BUCKETS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </Field>
      {params.size > 0 ? (
        <button
          onClick={() => startTransition(() => router.replace('/polls'))}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Clear
        </button>
      ) : null}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
