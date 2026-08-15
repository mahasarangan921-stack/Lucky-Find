import { useState, useMemo } from 'react'
import { Megaphone } from 'lucide-react'
import { ANNOUNCEMENTS } from '../data/announcements'
import { SectionHeading, Tag, EmptyState } from '../components/ui'

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const FILTERS = ['All', 'Bumper', 'Update', 'Notice']

export default function Announcements() {
  const [filter, setFilter] = useState('All')

  const items = useMemo(
    () => (filter === 'All' ? ANNOUNCEMENTS : ANNOUNCEMENTS.filter((a) => a.tag === filter)),
    [filter]
  )

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionHeading eyebrow="Stay in the loop" title="Announcements & Updates" />

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-gold/15 text-gold-bright' : 'bg-ink-panel/60 text-text-lo hover:text-text-hi'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState title="No announcements here" body="Check back soon, or browse another category." />
      ) : (
        <div className="relative space-y-6 border-l border-ink-line pl-6">
          {items.map((a) => (
            <div key={a.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 grid h-6 w-6 place-items-center rounded-full border border-gold/40 bg-ink text-gold-bright">
                <Megaphone size={12} />
              </span>
              <div className="rounded-2xl border border-ink-line bg-ink-panel/50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone={a.tag === 'Bumper' ? 'maroon' : a.tag === 'Update' ? 'emerald' : 'gold'}>{a.tag}</Tag>
                  <span className="text-xs text-text-lo">{formatDate(a.date)}</span>
                </div>
                <p className="mt-2 font-display text-lg font-semibold text-text-hi">{a.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-lo">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
