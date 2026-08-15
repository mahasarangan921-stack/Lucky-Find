import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react'
import { getHistoryTree } from '../data/queries'
import { THEME_COLORS, getCategory } from '../data/categories'
import TicketStub from '../components/TicketStub'
import { SectionHeading, EmptyState } from '../components/ui'
import { useLotteryData } from '../data/LotteryDataContext'

export default function HistoricalExplorer() {
  
  const { results } = useLotteryData()
  console.log('TOTAL RESULTS:', results?.length)
console.log(
  'YEARS IN RESULTS:',
  [...new Set(results?.map(r => new Date(r.date).getFullYear()))]
)
  const tree = useMemo(() => getHistoryTree(results), [results])
  const years = useMemo(() => Object.keys(tree).sort((a, b) => b - a), [tree])

  const [year, setYear] = useState(null)
  const [categoryId, setCategoryId] = useState(null)

  const categories = year ? Object.entries(tree[year]) : []
  const draws = year && categoryId ? tree[year][categoryId].draws : []

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <SectionHeading eyebrow="Browse the archive" title="Historical Results Explorer" />

      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-sm">
        <Crumb active={!year} onClick={() => { setYear(null); setCategoryId(null) }}>All years</Crumb>
        {year && (
          <>
            <ChevronRight size={14} className="text-text-lo" />
            <Crumb active={year && !categoryId} onClick={() => setCategoryId(null)}>{year}</Crumb>
          </>
        )}
        {categoryId && (
          <>
            <ChevronRight size={14} className="text-text-lo" />
            <Crumb active>{tree[year][categoryId].categoryName}</Crumb>
          </>
        )}
      </div>

      {/* Level 1: Years */}
      {!year && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {years.map((y) => {
            const drawCount = Object.values(tree[y]).reduce((s, c) => s + c.draws.length, 0)
            return (
              <button
                key={y}
                onClick={() => setYear(y)}
                className="group rounded-2xl border border-ink-line bg-ink-panel/60 p-6 text-left transition-colors hover:border-gold/40 hover:bg-ink-panel"
              >
                <CalendarRange size={18} className="text-gold-bright/70" />
                <p className="mt-3 font-display text-3xl font-bold text-text-hi">{y}</p>
                <p className="mt-1 text-xs text-text-lo">{drawCount} draws recorded</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Level 2: Categories within a year */}
      {year && !categoryId && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map(([catId, data]) => {
            const cat = getCategory(catId)
            const theme = THEME_COLORS[cat?.theme || 'gold']
            return (
              <button
                key={catId}
                onClick={() => setCategoryId(catId)}
                className={`rounded-2xl border ${theme.border} bg-ink-panel/50 p-5 text-left transition-colors hover:bg-ink-panel`}
              >
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.text}`}>{cat?.type}</p>
                <p className="mt-1 font-display text-lg font-semibold text-text-hi">{data.categoryName}</p>
                <p className="mt-1 text-xs text-text-lo">{data.draws.length} draw{data.draws.length !== 1 ? 's' : ''} in {year}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Level 3: Draws */}
      {year && categoryId && (
        <div className="grid gap-3 sm:grid-cols-2">
          {draws.map((d) => {
            const top = d.prizes[0]
            return (
              <TicketStub
                key={d.id}
                id={d.id}
                categoryId={d.categoryId}
                categoryName={d.categoryName}
                drawCode={d.drawCode}
                date={d.date}
                number={top.numbers[0].full}
                tier={top.tier}
                amount={top.amount}
              />
            )
          })}
        </div>
      )}

      {year && categoryId && draws.length === 0 && (
        <EmptyState title="No draws found" body="Try a different category or year." />
      )}

      {(year || categoryId) && (
        <button
          onClick={() => (categoryId ? setCategoryId(null) : setYear(null))}
          className="mt-8 flex items-center gap-1 text-sm text-text-lo hover:text-gold-bright"
        >
          <ChevronLeft size={15} /> Back
        </button>
      )}
    </div>
  )
}

function Crumb({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={active && !onClick}
      className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
        active ? 'text-gold-bright' : 'text-text-lo hover:text-text-hi'
      }`}
    >
      {children}
    </button>
  )
}
