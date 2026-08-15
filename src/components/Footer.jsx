import { Ticket } from 'lucide-react'
import { LAST_SYNCED } from '../data/announcements'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-line/60 bg-ink-soft/60">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold-bright">
                <Ticket size={14} />
              </span>
              <span className="font-display text-lg font-semibold">Lucky Find</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-text-lo">
              An independent result finder. Always verify winnings against the official
              published result before making any claim.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-ink-line bg-ink-panel px-4 py-2 text-xs text-text-lo">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-bright opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-bright" />
            </span>
            Last synced {LAST_SYNCED.date === '2026-07-25' ? 'today' : LAST_SYNCED.date}, {LAST_SYNCED.time}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-line/60 pt-6 text-xs text-text-lo sm:flex-row sm:items-center sm:justify-between">
          <p>Statistics shown are historical only and are not predictions of future results.</p>
          <p>&copy; 2026 Lucky Find Result Finder</p>
        </div>
      </div>
    </footer>
  )
}
