import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { THEME_COLORS, getCategory } from '../data/categories'

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/**
 * The signature element: a card torn into two stubs by a dashed
 * perforation, echoing a real lottery ticket. Left stub carries the
 * draw's identity, right stub carries the number and prize.
 */
export default function TicketStub({
  id, categoryId, categoryName, drawCode, date, number, tier, amount, highlightQuery, compact = false,
}) {
  const category = getCategory(categoryId)
  const theme = THEME_COLORS[category?.theme || 'gold']

  const numberDisplay = highlightQuery ? highlight(number, highlightQuery) : number

  return (
    <Link
      to={`/result/${id}`}
      className="group grid grid-cols-[1fr_auto] overflow-hidden rounded-2xl border border-ink-line bg-ink-panel/70 shadow-[0_8px_35px_rgba(0,0,0,0.22)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_10px_45px_rgba(212,167,44,0.10)]"
    >
     <div className={`relative flex flex-col justify-center gap-1.5 px-5 ${compact ? 'py-3.5' : 'py-5'}`}>
  <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full ${theme.bg} ${theme.text} px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide`}>
          {categoryName}
        </span>
        <span className="font-display text-base font-semibold text-text-hi">{drawCode}</span>
        <span className="flex items-center gap-1.5 text-xs text-text-lo">
          <CalendarDays size={12} /> {formatDate(date)}
        </span>
      </div>

      <div className={`perforation relative flex flex-col items-end justify-center gap-1 bg-ink-soft px-5 ${compact ? 'py-3.5' : 'py-5'} min-w-[9.5rem]`}>
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(212,167,44,0.06),transparent_65%)]" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-lo">{tier}</span>
        <span className="font-mono-num text-lg font-bold text-gold-bright">{numberDisplay}</span>
        <span className="text-xs font-semibold text-emerald-bright">{amount}</span>
      </div>
    </Link>
  )
}

function highlight(text, query) {
  if (!query) return text
  const idx = text.indexOf(query)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-gold/30 px-0.5 text-gold-bright">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}
