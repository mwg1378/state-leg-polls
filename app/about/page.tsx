export const metadata = {
  title: 'About / Methodology — state-leg-polls',
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-bold tracking-tight">About / Methodology</h1>

      <section>
        <h2 className="mt-6 text-lg font-semibold">What this site is</h2>
        <p className="mt-2">
          A best-effort exhaustive aggregator of polls released on individual <strong>state legislative
          general election</strong> races — all 50 states, both chambers, since 2017.
          Primary elections, gubernatorial / federal races, and generic-ballot or chamber-control polls are
          out of scope.
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-lg font-semibold">What counts as a poll</h2>
        <p className="mt-2">
          We include any poll that asks about head-to-head support among two or more named candidates
          for a specific state legislative seat in a regularly-scheduled or special general election.
          Both <em>nonpartisan/public</em> polls (universities, news media, independent firms) and
          <em> partisan internals</em> (campaigns, party committees, allied groups) are included — the
          latter are clearly labeled with a sponsor type and a colored badge.
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-lg font-semibold">How polls are sourced</h2>
        <p className="mt-2">
          Initial seed: a one-time research pass across pollster archives, news search,
          campaign press releases, party caucus releases, Ballotpedia, The Downballot, and other
          aggregators — orchestrated by Claude with manual review before import.
        </p>
        <p className="mt-2">
          Ongoing: a weekly cron job re-scans a list of configured sources, extracts candidate poll
          records via Claude, and queues them as <code>PENDING</code> for human review before
          publishing.
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-lg font-semibold">Margin convention</h2>
        <p className="mt-2">
          All margins are <strong>D−R</strong> in points. <code>D+5</code> means the Democrat leads by 5;
          <code> R+2</code> means the Republican leads by 2. Polls with no Democratic or no Republican
          candidate in the race are still included; the margin is computed against the strongest top-two
          candidates as released.
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-lg font-semibold">Accuracy scoring</h2>
        <p className="mt-2">
          A poll is &ldquo;in scope for accuracy&rdquo; if its race has an actual result entered. We
          report:
        </p>
        <ul className="ml-6 mt-2 list-disc space-y-1">
          <li><strong>% within 3 points</strong> of the actual D−R margin</li>
          <li><strong>% within 5 points</strong> of the actual D−R margin</li>
          <li><strong>Median absolute error</strong> on the D−R margin</li>
          <li><strong>Mean signed error</strong> (D−R) — positive values indicate a poll-side D-leaning bias</li>
        </ul>
        <p className="mt-2">
          Cuts are computed independently — a poll counts in every applicable bucket.
        </p>
      </section>

      <section>
        <h2 className="mt-6 text-lg font-semibold">Caveats</h2>
        <ul className="ml-6 mt-2 list-disc space-y-1">
          <li>State leg polling is sparse and uneven — most state-year combos have zero polls.</li>
          <li>Partisan internals are systematically biased; we publish them for transparency, not endorsement.</li>
          <li>Special elections are tracked when encountered but not exhaustively backfilled.</li>
          <li>Found a missing poll or an error? File an issue on{' '}
            <a className="hover:underline" href="https://github.com/mwg1378/state-leg-polls/issues" target="_blank" rel="noopener">GitHub</a>.</li>
        </ul>
      </section>
    </div>
  )
}
