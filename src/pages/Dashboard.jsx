import { useRef, useState } from 'react'
import { useScrollReveal } from '../lib/useScrollReveal'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ArrowRight, Trophy, Megaphone, CalendarClock, LayoutGrid, TrendingUp } from 'lucide-react'
import { CATEGORIES, THEME_COLORS } from '../data/categories'
import { getLatestResults, getOverviewStats } from '../data/queries'
import { ANNOUNCEMENTS } from '../data/announcements'
import { UPCOMING_DRAWS } from '../data/announcements'
import TicketStub from '../components/TicketStub'
import { SectionHeading, StatCard, Tag } from '../components/ui'
import { useLotteryData } from '../data/LotteryDataContext'
import luckyFindHero from '../assets/hero/lucky-find-hero.png'
function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { results } = useLotteryData()
  const latest = results?.length
  ? getLatestResults(6, results)
  : []
  const stats = getOverviewStats(results)

  // scroll-reveal: watches every .reveal element inside mainRef and
  // fades it up once it enters the viewport
  const mainRef = useRef(null)
  useScrollReveal(mainRef)

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/finder?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={mainRef}>
      {/* Hero: the page's single job — find your number */}
      {/* Cinematic Hero */}
<section className="relative min-h-[720px] overflow-hidden border-b border-ink-line/60 bg-[#071812]">

  {/* ─────────────────────────────────────────
      BACKGROUND IMAGE
      ───────────────────────────────────────── */}
  


  {/* ─────────────────────────────────────────
      BACKGROUND TEXTURE
      ───────────────────────────────────────── */}
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.06]"
    style={{
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")
      `,
    }}
  />


  {/* ─────────────────────────────────────────
      DECORATIVE GOLD LINE
      ───────────────────────────────────────── */}
  <div className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-[18%] bg-gold/30 lg:block" />


  {/* ─────────────────────────────────────────
      MAIN HERO CONTENT
      ───────────────────────────────────────── */}
  <div className="relative z-20 mx-auto flex min-h-[720px] max-w-[1440px] items-center px-8 pb-28 pt-20 sm:px-10 lg:px-16 xl:px-20">
   <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">

      {/* LEFT — COPY */}
      <div className="relative z-30 max-w-[650px]">

        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-gold" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-bright">
            Kerala Lottery · The Archive
          </p>
        </div>


        {/* Main heading */}
        <h1 className="max-w-[620px] font-display text-[3.8rem] font-medium leading-[0.88] tracking-[-0.045em] text-[#F5EFE3] sm:text-[5rem] lg:text-[5.9rem]">
          Find your
          <br />

          <span className="italic text-[#D7C7A2]">
            number.
          </span>

          <br />

          Know your
          <br />

          <span className="italic text-[#F5EFE3]">
            result.
          </span>
        </h1>


        {/* Description */}
        <p className="mt-7 max-w-lg text-sm leading-7 text-[#C0CDC6] sm:text-base">
          Search Kerala lottery results across years, categories and
          prize tiers — all from one carefully indexed archive.
        </p>


        {/* SEARCH */}
        {/* PREMIUM SEARCH */}
<form
  onSubmit={handleSearch}
  className="mt-8 w-full max-w-[570px]"
>
  <div className="group rounded-[20px] border border-white/[0.12] bg-[#0b2118]/80 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-500 hover:border-gold/30 focus-within:border-gold/45">

    <div className="flex min-h-[68px] items-center gap-2">

      {/* Input */}
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4">

        <Search
          size={18}
          strokeWidth={1.5}
          className="shrink-0 text-gold-bright/80"
        />

        <div className="min-w-0 flex-1">

          <p className="mb-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Search the archive
          </p>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your ticket number"
            inputMode="numeric"
            autoComplete="off"
            className="w-full bg-transparent font-mono-num text-[15px] tracking-wide text-[#F5EFE3] outline-none placeholder:font-body placeholder:text-[13px] placeholder:tracking-normal placeholder:text-white/25"
          />

        </div>
      </div>

      {/* Button */}
      <button
        type="submit"
        className="flex h-[54px] shrink-0 items-center gap-3 rounded-[14px] bg-[#D5A92C] px-6 text-[13px] font-semibold text-[#071812] transition-all duration-300 hover:bg-[#E5B83D] hover:shadow-[0_8px_30px_rgba(213,169,44,0.18)] active:scale-[0.98]"
      >
        <span>Check number</span>

        <ArrowRight
          size={15}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </button>

    </div>
  </div>

  {/* Small supporting text */}
  <div className="mt-3 flex items-center gap-3 px-1">
    <span className="text-[8px] uppercase tracking-[0.16em] text-white/25">
      Search by number
    </span>

    <span className="h-[2px] w-[2px] rounded-full bg-white/20" />

    <span className="text-[8px] uppercase tracking-[0.16em] text-white/25">
      Historical results
    </span>
  </div>
</form>
      </div>


      {/* ─────────────────────────────────────
          RIGHT — ART DIRECTION
          ───────────────────────────────────── */}
      {/* RIGHT — EDITORIAL LOTTERY ART */}
<div className="relative hidden h-[600px] lg:block">

  {/* subtle glow behind the object */}
  <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.045] blur-[100px]" />

  {/* Main editorial object */}
  <img
  src={luckyFindHero}
    alt=""
    className="
      absolute
      left-1/2
      top-1/2
      z-20
      w-[min(580px,90%)]
      -translate-x-1/2
      -translate-y-1/2
      object-contain
      drop-shadow-[0_40px_70px_rgba(0,0,0,0.55)]
      transition-transform
      duration-700
      ease-out
      hover:scale-[1.025]
      hover:-rotate-1
    "
  />

  {/* archival number */}
  <div className="
    pointer-events-none
    absolute
    -bottom-2
    right-0
    z-0
    select-none
    font-mono-num
    text-[11rem]
    font-bold
    leading-none
    tracking-[-0.12em]
    text-white/[0.035]
  ">
    936
  </div>

  {/* tiny editorial caption */}
  <div className="absolute bottom-[13%] left-[12%] z-30">
    <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
      Lucky Find · 2026
    </p>

    <div className="mt-2 h-px w-16 bg-gold/40" />
  </div>

</div>

    </div>
  </div>


  {/* ─────────────────────────────────────────
      BOTTOM ARCHIVE STRIP
      ───────────────────────────────────────── */}
  <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/[0.08] bg-[#071812]/60 backdrop-blur-md">

    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">

      <div className="flex items-center gap-4">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />

        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
          Kerala Lottery Archive
        </p>
      </div>

      <p className="hidden text-[9px] uppercase tracking-[0.2em] text-white/30 sm:block">
        Results · History · Numbers
      </p>
                  </div>
                   </div>

</section>

      <div className="mx-auto max-w-7xl px-5 py-16 space-y-20">
        {/* Results overview */}
        <section>
          <SectionHeading eyebrow="At a glance" title="Results overview" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Draws on record', value: stats.totalDraws, icon: LayoutGrid },
              { label: 'Winning numbers indexed', value: stats.totalNumbers.toLocaleString('en-IN'), icon: Trophy },
              { label: 'Categories tracked', value: stats.categoriesCovered, icon: TrendingUp },
              { label: 'Years covered', value: `${stats.years.at(-1)}–${stats.years[0]}`, icon: CalendarClock },
            ].map((s, i) => (
              <div
                key={s.label}
                className="reveal transition-transform duration-300 hover:-translate-y-1"
                style={{ '--delay': i }}
              >
                <StatCard label={s.label} value={s.value} icon={s.icon} />
              </div>
            ))}
          </div>
        </section>

        {/* Latest results */}
        <section>
          <SectionHeading
            eyebrow="Just published"
            title="Latest lottery results"
            action={<Link to="/history" className="flex items-center gap-1 text-sm font-medium text-gold-bright hover:underline">View all history <ArrowRight size={14} /></Link>}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {latest.map((r, i) => {
              const top = r.prizes[0]
              return (
               <div
  key={r.id}
  className="transition-transform duration-300 hover:-translate-y-1"
>
                  <TicketStub
                 
                    id={r.id}
                    categoryId={r.categoryId}
                    categoryName={r.categoryName}
                    drawCode={r.drawCode}
                    date={r.date}
                    number={top.numbers[0].full}
                    tier={top.tier}
                    amount={top.amount}
                  />
                </div>
              )
            })}
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Upcoming draws */}
          <section className="lg:col-span-1">
            <SectionHeading eyebrow="Don't miss it" title="Upcoming draws" />
            <div className="space-y-2.5">
              {UPCOMING_DRAWS.slice(0, 5).map((d, i) => (
                <div
                  key={d.id}
                  className="reveal flex items-center justify-between rounded-xl border border-ink-line bg-ink-panel/50 px-4 py-3 transition-colors hover:border-gold/30"
                  style={{ '--delay': i }}
                >
                  <div>
                    <p className="text-sm font-semibold text-text-hi">{d.categoryName}</p>
                    <p className="text-xs text-text-lo">{d.time}</p>
                  </div>
                  <div className="rounded-lg bg-ink-soft px-2.5 py-1.5 text-center">
                    <p className="font-display text-sm font-bold leading-none text-gold-bright">{formatDate(d.date)}</p>
                  </div>
                </div>
              ))}
              <Link to="/calendar" className="flex items-center justify-center gap-1 pt-1 text-sm font-medium text-gold-bright hover:underline">
                Full calendar <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {/* Announcements */}
          <section className="lg:col-span-2">
            <SectionHeading
              eyebrow="Stay informed"
              title="Latest announcements"
              action={<Link to="/announcements" className="flex items-center gap-1 text-sm font-medium text-gold-bright hover:underline">All updates <ArrowRight size={14} /></Link>}
            />
            <div className="space-y-2.5">
              {ANNOUNCEMENTS.slice(0, 3).map((a, i) => (
                <div
                  key={a.id}
                  className="reveal flex gap-3 rounded-xl border border-ink-line bg-ink-panel/50 px-4 py-3.5 transition-colors hover:border-gold/30"
                  style={{ '--delay': i }}
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/10 text-gold-bright">
                    <Megaphone size={14} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag tone={a.tag === 'Bumper' ? 'maroon' : a.tag === 'Update' ? 'emerald' : 'gold'}>{a.tag}</Tag>
                      <span className="text-xs text-text-lo">{formatDate(a.date)}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-text-hi">{a.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Popular categories */}
        <section>
          <SectionHeading eyebrow="Browse" title="Popular lottery categories" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => {
              const theme = THEME_COLORS[c.theme]
              return (
                <Link
                  key={c.id}
                  to={`/finder?category=${c.id}`}
                  style={{ '--delay': i }}
                  className={`reveal group rounded-2xl border ${theme.border} bg-ink-panel/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-ink-panel hover:shadow-xl hover:shadow-black/30`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.text}`}>{c.type}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-text-hi">{c.name}</p>
                  <p className="mt-1 text-xs text-text-lo">{c.tagline}</p>
                  {c.day && <p className="mt-2 text-xs text-text-lo/70">Draws every {c.day}</p>}
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}