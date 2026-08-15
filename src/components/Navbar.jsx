import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Ticket, Menu, X, Search } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Dashboard' },
  
  { to: '/history', label: 'History' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/statistics', label: 'Statistics' },
  { to: '/announcements', label: 'Announcements' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line/60 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-bright transition-transform group-hover:rotate-6">
            <Ticket size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-text-hi">
            Lucky Find
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className="group relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-gold-bright' : 'text-text-lo transition-colors group-hover:text-text-hi'}>
                    {l.label}
                  </span>
                  {/* animated underline: sits under the label, grows in on hover, stays full when active */}
                  <span
                    className={`absolute inset-x-3.5 -bottom-0.5 h-[1.5px] origin-left scale-x-0 bg-gold-bright transition-transform duration-300 ease-out ${
                      isActive ? 'scale-x-100' : 'group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/finder"
            className="hidden items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-sm font-semibold text-gold-bright transition-all hover:bg-gold/20 hover:-translate-y-0.5 sm:flex"
          >
            <Search size={14} /> Find my number
          </NavLink>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-ink-line text-text-lo lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink-line/60 bg-ink px-5 py-3 lg:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-gold/15 text-gold-bright' : 'text-text-lo'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}