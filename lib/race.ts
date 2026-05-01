import { CHAMBER_TYPE_SHORT } from '@/lib/labels'
import type { ChamberType } from '@db/enums'

export function raceTitle(args: {
  stateCode: string
  chamberType: ChamberType
  district: string
  electionYear: number
  isSpecial?: boolean
}): string {
  const ch = CHAMBER_TYPE_SHORT[args.chamberType]
  const dist = args.district === 'At-Large' ? 'At-Large' : `District ${args.district}`
  const special = args.isSpecial ? ' (Special)' : ''
  return `${args.stateCode} ${ch} — ${dist}, ${args.electionYear}${special}`
}

export function raceSlug(args: {
  stateCode: string
  chamberType: ChamberType
  district: string
  electionYear: number
  isSpecial?: boolean
}): string {
  const ch =
    args.chamberType === 'HOUSE' ? 'hd' : args.chamberType === 'SENATE' ? 'sd' : 'leg'
  const dist = args.district.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const sp = args.isSpecial ? '-special' : ''
  return `${args.stateCode.toLowerCase()}-${ch}-${dist}-${args.electionYear}${sp}`
}
