import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-28 text-center">
      <p className="font-display text-6xl font-bold text-gold-bright">404</p>
      <p className="mt-3 font-display text-xl font-semibold text-text-hi">This ticket doesn't exist</p>
      <p className="mt-2 text-sm text-text-lo">The page you're looking for isn't in our records.</p>
      <Link to="/" className="mt-6 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-bright">
        Back to dashboard
      </Link>
    </div>
  )
}
