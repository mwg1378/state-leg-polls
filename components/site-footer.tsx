import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-6 text-xs text-muted-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          state-leg-polls — aggregating state legislative general election polls since 2017.
        </div>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-foreground">Methodology</Link>
          <a
            href="https://github.com/mwg1378/state-leg-polls"
            target="_blank"
            rel="noopener"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <Link href="/api/polls" className="hover:text-foreground">API</Link>
        </div>
      </div>
    </footer>
  )
}
