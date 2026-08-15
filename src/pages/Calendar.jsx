import { Link } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import { UPCOMING_DRAWS } from '../data/announcements'
import { THEME_COLORS, getCategory } from '../data/categories'
import { SectionHeading } from '../components/ui'

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })
}

function groupByDate(draws) {
  const map = {}
  draws.forEach((d) => {
    map[d.date] ??= []
    map[d.date].push(d)
  })
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

export default function Calendar() {
  const grouped = groupByDate(UPCOMING_DRAWS)

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionHeading eyebrow="What's next" title="Upcoming Lottery Draw Calendar" />
      <p className="-mt-3 mb-8 max-w-xl text-sm text-text-lo">
        Every scheduled draw ahead, grouped by date. Tap a draw to browse that category's
        past results while you wait.
      </p>

      <div className="space-y-8">
        {grouped.map(([date, draws]) => (
          <div key={date}>
            <div className="mb-3 flex items-center gap-3">
              <p className="font-display text-lg font-semibold text-text-hi">{formatDate(date)}</p>
              <span className="h-px flex-1 bg-ink-line" />
            </div>
            <div className="space-y-2.5">
              {draws.map((d) => {
                const cat = getCategory(d.categoryId)
                const theme = THEME_COLORS[cat?.theme || 'gold']
                return (
                  <Link
                    key={d.id}
                    to={`/finder?category=${d.categoryId}`}
                    className="flex items-center justify-between rounded-xl border border-ink-line bg-ink-panel/50 px-4 py-3.5 transition-colors hover:border-gold/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${theme.solid}`} />
                      <div>
                        <p className="font-semibold text-text-hi">{d.categoryName}</p>
                        <p className="flex items-center gap-1 text-xs text-text-lo">
                          <Clock size={11} /> {d.time}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-text-lo" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
