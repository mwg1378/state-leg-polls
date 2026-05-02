import type { PartisanLean, Population, RaceType, SourceType, SponsorType } from '@db/enums'

export const RACE_TYPE_LABELS: Record<RaceType, string> = {
  PARTISAN_PRIMARY: 'Partisan primary',
  NONPARTISAN_PRIMARY: 'Nonpartisan primary',
  GENERAL: 'General',
  NONPARTISAN_GENERAL: 'Nonpartisan general',
  RUNOFF: 'Runoff',
  SPECIAL_GENERAL: 'Special general',
  SPECIAL_PRIMARY: 'Special primary',
  SPECIAL_RUNOFF: 'Special runoff',
}

export const RACE_TYPE_SHORT: Record<RaceType, string> = {
  PARTISAN_PRIMARY: 'Primary',
  NONPARTISAN_PRIMARY: 'Primary',
  GENERAL: 'General',
  NONPARTISAN_GENERAL: 'General',
  RUNOFF: 'Runoff',
  SPECIAL_GENERAL: 'Special',
  SPECIAL_PRIMARY: 'Special primary',
  SPECIAL_RUNOFF: 'Special runoff',
}

export const SPONSOR_TYPE_LABELS: Record<SponsorType, string> = {
  CAMPAIGN: 'Campaign',
  PARTY: 'Party committee',
  INDEPENDENT_GROUP: 'Independent group',
  NEWS_MEDIA: 'News media',
  NONPARTISAN_PUBLIC: 'Nonpartisan / public',
  UNKNOWN: 'Unknown',
}

export const PARTISAN_LEAN_LABELS: Record<PartisanLean, string> = {
  D: 'D-leaning',
  R: 'R-leaning',
  NONPARTISAN: 'Nonpartisan',
  UNKNOWN: 'Unknown',
}

export const POPULATION_LABELS: Record<Population, string> = {
  LV: 'Likely voters',
  RV: 'Registered voters',
  A: 'All adults',
  UNKNOWN: '—',
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  PRESS_RELEASE: 'Press release',
  NEWS_ARTICLE: 'News article',
  POLLSTER_MEMO: 'Pollster memo',
  CAMPAIGN_SITE: 'Campaign site',
  AGGREGATOR: 'Aggregator',
  WIKIPEDIA: 'Wikipedia',
  SOCIAL_MEDIA: 'Social media',
  OTHER: 'Other',
}

const PARTY_PALETTE: Record<string, string> = {
  D: 'text-blue-400',
  R: 'text-red-400',
  I: 'text-yellow-400',
  G: 'text-emerald-400',
  L: 'text-amber-400',
  W: 'text-sky-300',
  REP: 'text-red-400',
  DEM: 'text-blue-400',
}

export function partyColor(party: string | null | undefined): string {
  if (!party) return 'text-zinc-300'
  return PARTY_PALETTE[party.toUpperCase()] ?? 'text-zinc-300'
}
