import type { ChamberType, PartisanLean, Population, SourceType, SponsorType } from '@db/enums'

export const SPONSOR_TYPE_LABELS: Record<SponsorType, string> = {
  CAMPAIGN_D: 'D campaign',
  CAMPAIGN_R: 'R campaign',
  PARTY_D: 'D party committee',
  PARTY_R: 'R party committee',
  INDEPENDENT_GROUP_D: 'D-aligned group',
  INDEPENDENT_GROUP_R: 'R-aligned group',
  NEWS_MEDIA: 'News media',
  NONPARTISAN_PUBLIC: 'Nonpartisan / public',
  UNKNOWN: 'Unknown',
}

export function sponsorLean(t: SponsorType): 'D' | 'R' | 'NEUTRAL' {
  if (t === 'CAMPAIGN_D' || t === 'PARTY_D' || t === 'INDEPENDENT_GROUP_D') return 'D'
  if (t === 'CAMPAIGN_R' || t === 'PARTY_R' || t === 'INDEPENDENT_GROUP_R') return 'R'
  return 'NEUTRAL'
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
  CAUCUS_SITE: 'Caucus site',
  AGGREGATOR: 'Aggregator',
  SOCIAL_MEDIA: 'Social media',
  OTHER: 'Other',
}

export const CHAMBER_TYPE_SHORT: Record<ChamberType, string> = {
  HOUSE: 'House',
  SENATE: 'Senate',
  UNICAMERAL: 'Legislature',
}
