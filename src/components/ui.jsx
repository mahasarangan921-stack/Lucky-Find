import { Ticket } from 'lucide-react'

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gold-bright/80">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-semibold text-text-hi sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, body }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-line bg-ink-panel/40 px-6 py-14 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full border border-ink-line text-text-lo">
        <Ticket size={18} />
      </span>
      <p className="font-display text-lg font-semibold text-text-hi">{title}</p>
      {body && <p className="max-w-sm text-sm text-text-lo">{body}</p>}
    </div>
  )
}

export function Tag({ children, tone = 'gold' }) {
  const tones = {
    gold: 'bg-gold/15 text-gold-bright',
    emerald: 'bg-emerald/15 text-emerald-bright',
    maroon: 'bg-maroon/15 text-maroon-bright',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-line bg-ink-panel/60 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-gold/25 hover:bg-ink-panel/80 hover:shadow-[0_12px_40px_rgba(212,167,44,0.07)]">
      
      {/* subtle ambient glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gold/5 blur-2xl transition-opacity duration-500 group-hover:bg-gold/10" />

      <div className="relative flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-lo">
          {label}
        </p>

        {Icon && (
          <div className="grid h-8 w-8 place-items-center rounded-full border border-gold/10 bg-gold/[0.04] transition-colors duration-500 group-hover:border-gold/20 group-hover:bg-gold/[0.08]">
            <Icon size={15} className="text-gold-bright/70" />
          </div>
        )}
      </div>

      <p className="relative mt-4 font-display text-3xl font-semibold tracking-tight text-text-hi">
        {value}
      </p>

      {sub && (
        <p className="relative mt-1 text-xs text-text-lo">
          {sub}
        </p>
      )}

      {/* tiny editorial accent */}
      <div className="mt-4 h-px w-8 bg-gold/25 transition-all duration-500 group-hover:w-12 group-hover:bg-gold/50" />
    </div>
  )
}
