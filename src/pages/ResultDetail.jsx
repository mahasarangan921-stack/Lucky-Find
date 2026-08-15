import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FileText, ChevronLeft, CalendarDays, Share2 } from 'lucide-react'
import { getResultById } from '../data/queries'
import { THEME_COLORS, getCategory } from '../data/categories'
import PdfViewerModal from '../components/PdfViewerModal'
import { EmptyState, Tag } from '../components/ui'
import { useLotteryData } from '../data/LotteryDataContext'

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function ResultDetail() {
  const { id } = useParams()
  const { results } = useLotteryData()
  const result = getResultById(id, results)
  const [showPdf, setShowPdf] = useState(false)

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <EmptyState title="Result not found" body="This draw isn't in our records. It may have been removed or the link is incorrect." />
      </div>
    )
  }

  const category = getCategory(result.categoryId)
  const theme = THEME_COLORS[category?.theme || 'gold']
  const topThree = result.prizes.slice(0, 3)
  const rest = result.prizes.slice(3)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/history" className="mb-6 flex w-fit items-center gap-1 text-sm text-text-lo hover:text-gold-bright">
        <ChevronLeft size={15} /> Back to history
      </Link>

      {/* Header */}
      <div className={`rounded-2xl border ${theme.border} bg-ink-panel/70 p-6 sm:p-8`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Tag tone={category?.theme}>{result.type === 'bumper' ? 'Bumper draw' : 'Weekly draw'}</Tag>
            <h1 className="mt-3 font-display text-3xl font-bold text-text-hi sm:text-4xl">
              {result.categoryName} <span className="text-gold-bright">{result.drawCode}</span>
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-text-lo">
              <CalendarDays size={14} /> Draw date: {formatDate(result.date)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPdf(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright"
            >
              <FileText size={15} /> View PDF
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-xl border border-ink-line text-text-lo hover:text-text-hi">
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 prizes — hero tickets */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {topThree.map((p) => (
          <div key={p.tier} className="perforation-h rounded-2xl border border-ink-line bg-ink-panel/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-lo">{p.tier}</p>
            <p className="mt-1 text-lg font-bold text-emerald-bright">{p.amount}</p>
            <div className="mt-3 space-y-1.5">
              {p.numbers.map((n, i) => (
                <p key={i} className="font-mono-num text-xl font-bold text-gold-bright">{n.full}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Remaining tiers */}
      <div className="mt-10 space-y-6">
        <h2 className="font-display text-xl font-semibold text-text-hi">Full winning number list</h2>
        {rest.map((p) => (
          <div key={p.tier} className="rounded-2xl border border-ink-line bg-ink-panel/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-text-hi">{p.tier}</p>
              <p className="text-sm font-semibold text-emerald-bright">{p.amount}{p.numbers[0]?.series === null ? ' each' : ''}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.numbers.map((n, i) => (
                <span key={i} className="rounded-lg border border-ink-line bg-ink-soft px-3 py-1.5 font-mono-num text-sm text-text-hi">
                  {n.full}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-text-lo">
        This listing is compiled from stored data and is provided for convenience. Always verify
        against the official published result before claiming any prize.
      </p>

      {showPdf && <PdfViewerModal result={result} onClose={() => setShowPdf(false)} />}
    </div>
  )
}
