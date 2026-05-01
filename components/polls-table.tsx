import { PollRow, PollTableHeader, type PollRowData } from '@/components/poll-row'

export function PollsTable({ polls, showRace = true }: { polls: PollRowData[]; showRace?: boolean }) {
  if (polls.length === 0) {
    return (
      <div className="rounded border border-dashed border-border/60 px-6 py-12 text-center text-sm text-muted-foreground">
        No polls match these filters yet.
      </div>
    )
  }
  return (
    <div className="overflow-x-auto rounded border border-border/60">
      <table className="w-full text-sm">
        <PollTableHeader showRace={showRace} />
        <tbody>
          {polls.map((p) => (
            <PollRow key={p.id} poll={p} showRace={showRace} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
