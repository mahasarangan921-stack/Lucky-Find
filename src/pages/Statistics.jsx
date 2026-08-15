import { useState, useMemo } from 'react'
import { Search, AlertTriangle, BarChart3 } from 'lucide-react'
import {
  getNumberFrequency, getOverviewStats, getDrawCountByCategory,
  getPrizeDistribution, getResultsByMonth,
} from '../data/queries'
import TicketStub from '../components/TicketStub'
import { SectionHeading, StatCard, EmptyState } from '../components/ui'
import { useLotteryData } from '../data/LotteryDataContext'

export default function Statistics() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { results } = useLotteryData()
  const stats = getOverviewStats(results)
  const byCategory = useMemo(() => getDrawCountByCategory(results), [results])
  const byPrize = useMemo(() => getPrizeDistribution(results), [results])
  const byMonth = useMemo(() => getResultsByMonth(results).slice(-12), [results])

  const frequency = submitted ? getNumberFrequency(submitted, results) : null

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(query.trim())
  }

  const maxCategory = Math.max(...byCategory.map(([, v]) => v), 1)
  const maxPrize = Math.max(...byPrize.map(([, v]) => v), 1)
  const maxMonth = Math.max(...byMonth.map(([, v]) => v), 1)

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <SectionHeading eyebrow="Understand the data" title="Statistics & Insights" />

      <div className="mb-10 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-gold-bright" />
        <p className="text-sm text-text-lo">
          <span className="font-semibold text-gold-bright">These are historical statistics, not predictions.</span>{' '}
          Past appearance frequency has no bearing on future draws — every draw is independent.
        </p>
      </div>

      {/* Number frequency lookup */}
      <section className="mb-14">
        <h2 className="mb-3 font-display text-xl font-semibold text-text-hi">Look up a number's history</h2>
        <form onSubmit={handleSubmit} className="flex max-w-md gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-line bg-ink-panel px-3.5 py-2.5">
            <Search size={16} className="text-gold-bright" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 123"
              inputMode="numeric"
              className="w-full bg-transparent font-mono-num text-text-hi placeholder:font-body focus:outline-none"
            />
          </div>
          <button className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-gold-bright">Look up</button>
        </form>

        {frequency && (
          <div className="mt-6">
            {frequency.totalAppearances === 0 ? (
              <EmptyState title={`No appearances of "${frequency.query}"`} body="Try fewer digits for a broader search." />
            ) : (
              <>
                <div className="mb-5 rounded-2xl border border-ink-line bg-ink-panel/60 p-5">
                  <p className="font-display text-lg font-semibold text-text-hi">
                    Number <span className="text-gold-bright">{frequency.query}</span>
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-text-lo">Appeared</p>
                      <p className="mt-0.5 font-semibold text-text-hi">{frequency.totalAppearances} time{frequency.totalAppearances !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-text-lo">Highest prize</p>
                      <p className="mt-0.5 font-semibold text-emerald-bright">{frequency.highestPrize}</p>
                    </div>
                    <div>
                      <p className="text-text-lo">Most frequent in</p>
                      <p className="mt-0.5 font-semibold text-text-hi">{frequency.mostFrequentCategory}</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {frequency.appearances.slice(0, 6).map((a, i) => (
                    <TicketStub
                      key={i}
                      id={a.resultId}
                      categoryId={a.categoryId}
                      categoryName={a.categoryName}
                      drawCode={a.drawCode}
                      date={a.date}
                      number={a.number}
                      tier={a.tier}
                      amount={a.amount}
                      highlightQuery={frequency.query}
                      compact
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Overview stats */}
      <section className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total draws" value={stats.totalDraws} icon={BarChart3} />
        <StatCard label="Numbers indexed" value={stats.totalNumbers.toLocaleString('en-IN')} icon={BarChart3} />
        <StatCard label="Categories" value={stats.categoriesCovered} icon={BarChart3} />
        <StatCard label="Years covered" value={stats.years.length} icon={BarChart3} />
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Draws by category */}
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-text-hi">Draws by category</h2>
          <div className="space-y-3">
            {byCategory.map(([name, count]) => (
              <BarRow key={name} label={name} value={count} max={maxCategory} />
            ))}
          </div>
        </section>

        {/* Prize distribution */}
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-text-hi">Prize distribution</h2>
          <div className="space-y-3">
            {byPrize.map(([tier, count]) => (
              <BarRow key={tier} label={tier} value={count} max={maxPrize} tone="emerald" />
            ))}
          </div>
        </section>
      </div>

      {/* Results by month */}
      <section className="mt-14">
        <h2 className="mb-4 font-display text-xl font-semibold text-text-hi">Results published by month</h2>
        <div className="flex h-40 items-end gap-2 rounded-2xl border border-ink-line bg-ink-panel/40 p-5">
          {byMonth.map(([month, count]) => (
            <div key={month} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] text-text-lo opacity-0 transition-opacity group-hover:opacity-100">{count}</span>
              <div
                className="w-full rounded-t-md bg-gold/60 transition-colors group-hover:bg-gold-bright"
                style={{ height: `${(count / maxMonth) * 100}%`, minHeight: 4 }}
              />
              <span className="text-[10px] text-text-lo">{month.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function BarRow({ label, value, max, tone = 'gold' }) {
  const colors = { gold: 'bg-gold', emerald: 'bg-emerald' }
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-text-hi">{label}</span>
        <span className="text-text-lo">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-soft">
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}
