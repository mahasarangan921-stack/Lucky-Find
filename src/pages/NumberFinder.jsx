import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { getAvailableYears, getAllPrizeTiers } from '../data/queries'
import TicketStub from '../components/TicketStub'
import { EmptyState, SectionHeading } from '../components/ui'
import { useLotteryData } from '../data/LotteryDataContext'
import { searchLotteryResults } from '../data/lotteryApi'

export default function NumberFinder() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [mode, setMode] = useState('partial')
  const [categoryId, setCategoryId] = useState(params.get('category') || 'all')
  const [year, setYear] = useState('all')
  const [prizeTier, setPrizeTier] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [submitted, setSubmitted] = useState(query)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const { results: liveResults } = useLotteryData()

  const years = useMemo(() => {
  const currentYear = new Date().getFullYear()
  return Array.from(
    { length: currentYear - 2012 + 1 },
    (_, i) => currentYear - i
  )
}, [])
  const tiers = useMemo(() => getAllPrizeTiers(liveResults), [liveResults])

  const runSearch = useCallback(async (q, filters) => {
    if (!q) {
      setSubmitted('')
      setResults([])
      return
    }
    setSearching(true)
    setSearchError(null)
    try {
      const matches = await searchLotteryResults({ query: q, ...filters })
      setResults(matches)
    } catch (err) {
      setSearchError(err)
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const q = params.get('q')
    if (q) {
      setQuery(q)
      setSubmitted(q)
      runSearch(q, { mode, categoryId, year, prizeTier })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    setSubmitted(q)
    setParams(q ? { q } : {})
    runSearch(q, { mode, categoryId, year, prizeTier })
  }

  function handleFilterChange(setter, value) {
    setter(value)
    if (submitted) {
      runSearch(submitted, {
        mode: setter === setMode ? value : mode,
        categoryId: setter === setCategoryId ? value : categoryId,
        year: setter === setYear ? value : year,
        prizeTier: setter === setPrizeTier ? value : prizeTier,
      })
    }
  }

  function clearFilters() {
    setCategoryId('all')
    setYear('all')
    setPrizeTier('all')
    if (submitted) {
      runSearch(submitted, { mode, categoryId: 'all', year: 'all', prizeTier: 'all' })
    }
  }

  const filtersActive = categoryId !== 'all' || year !== 'all' || prizeTier !== 'all'

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <SectionHeading eyebrow="The main event" title="Advanced Number Finder" />
      <p className="-mt-3 mb-6 max-w-xl text-sm text-text-lo">
        Enter a full ticket number for an exact match, or just the last few digits for a
        partial search across every stored draw.
      </p>

      <form onSubmit={handleSubmit} className="perforation-h rounded-2xl border border-ink-line bg-ink-panel/80 p-4 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-ink-line bg-ink-soft px-3.5 py-2.5">
            <Search size={17} className="shrink-0 text-gold-bright" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your number, e.g. 123"
              inputMode="numeric"
              autoComplete="off"
              className="w-full bg-transparent font-mono-num text-lg text-text-hi placeholder:font-body placeholder:text-base placeholder:tracking-normal placeholder:text-text-lo/60 focus:outline-none"
            />
          </div>
          <button type="submit" disabled={searching} className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60">
            {searching ? 'Searching…' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilters || filtersActive
                ? 'border-gold/40 bg-gold/10 text-gold-bright'
                : 'border-ink-line text-text-lo hover:text-text-hi'
            }`}
          >
            <SlidersHorizontal size={15} /> Filters {filtersActive && <span className="ml-0.5 rounded-full bg-gold px-1.5 text-[10px] font-bold text-ink">•</span>}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-text-lo">Search mode:</span>
          {[
            { id: 'partial', label: 'Partial (any part of number)' },
            { id: 'exact', label: 'Exact number' },
          ].map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => handleFilterChange(setMode, m.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mode === m.id ? 'bg-gold/20 text-gold-bright' : 'bg-ink-soft text-text-lo hover:text-text-hi'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-3 border-t border-ink-line/60 pt-4 sm:grid-cols-3">
            <Select label="Lottery category" value={categoryId} onChange={(v) => handleFilterChange(setCategoryId, v)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Year" value={year} onChange={(v) => handleFilterChange(setYear, v)}>
              <option value="all">All years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            <Select label="Prize category" value={prizeTier} onChange={(v) => handleFilterChange(setPrizeTier, v)}>
              <option value="all">All prizes</option>
              {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex w-fit items-center gap-1 text-xs font-medium text-text-lo hover:text-gold-bright sm:col-span-3"
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        )}
      </form>

      <div className="mt-8">
        {!submitted && (
          <EmptyState
            title="Enter a number to begin"
            body="Try searching a full 6-digit ticket number, or just the last 3–4 digits for a partial match."
          />
        )}

        {searchError && (
          <EmptyState
            title="Search failed"
            body="We couldn’t reach the results service. Please try again."
          />
        )}

        {submitted && searching && !searchError && (
          <EmptyState title="Searching…" body="Looking across every stored draw for your number." />
        )}

        {submitted && !searching && !searchError && results.length === 0 && (
          <EmptyState
            title={`No matches for "${submitted}"`}
            body="Double check the digits, or widen your search by clearing filters or switching to partial mode."
          />
        )}

        {submitted && !searching && !searchError && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-text-lo">
              <span className="font-semibold text-text-hi">{results.length}</span> match{results.length !== 1 ? 'es' : ''} found for{' '}
              <span className="font-mono-num text-gold-bright">{submitted}</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((r, i) => (
                <TicketStub
                  key={`${r.resultId}-${r.tier}-${i}`}
                  id={r.resultId}
                  categoryId={r.categoryId}
                  categoryName={r.categoryName}
                  drawCode={r.drawCode}
                  date={r.date}
                  number={r.number}
                  tier={r.tier}
                  amount={r.amount}
                  highlightQuery={submitted}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-text-lo">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-ink-line bg-ink-soft px-3 py-2 text-sm text-text-hi focus:border-gold/50 focus:outline-none"
      >
        {children}
      </select>
    </label>
  )
}
