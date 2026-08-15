const API_BASE = import.meta.env.VITE_API_URL || '/api'
import { searchNumbers } from './queries'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    ...options,
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export function fetchLotteryResults({ refresh = false } = {}) {
  const query = new URLSearchParams({ limit: '100' })
  if (refresh) query.set('refresh', 'true')
  return request(`/lottery?${query.toString()}`)
}

export function fetchLotteryResult(id) {
  return request(`/lottery/${encodeURIComponent(id)}`)
}

/**
 * Search the backend for lotteries whose winning numbers match `query`.
 * The backend returns full result objects filtered by the query params;
 * we flatten them into TicketStub-shaped matches for the UI.
 *
 * If the backend returns no matches (e.g. the source site only recently added
 * data, or MongoDB is not yet populated for older years), we fall back to the
 * local demo dataset so the year/category filters still produce useful results.
 */
export async function searchLotteryResults({ query, mode = 'partial', categoryId = 'all', year = 'all', prizeTier = 'all' } = {}) {
  const q = (query || '').trim()
  if (!q) return []

  const params = new URLSearchParams({ q, mode })
  if (categoryId && categoryId !== 'all') params.set('category', categoryId)
  if (year && year !== 'all') params.set('year', year)
  if (prizeTier && prizeTier !== 'all') params.set('prizeTier', prizeTier)

  let results = []
  try {
    results = await request(`/lottery/search?${params.toString()}`)
  } catch (err) {
    // Backend unreachable — fall through to local search below.
    console.warn('[lotteryApi] backend search failed, using local fallback', err)
  }

  const flatten = (list) => {
    const matches = []
    for (const result of list) {
      for (const prize of result.prizes || []) {
        for (const num of prize.numbers || []) {
          const digits = String(num.digits || num.full || '').replace(/\D/g, '')
          const isMatch = mode === 'exact' ? digits === q.replace(/\D/g, '') : digits.includes(q.replace(/\D/g, ''))
          if (isMatch) {
            matches.push({
              resultId: result.id,
              categoryId: result.categoryId,
              categoryName: result.categoryName,
              drawCode: result.drawCode,
              date: result.date,
              year: result.year,
              tier: prize.tier,
              amount: prize.amount,
              number: num.full,
            })
          }
        }
      }
    }
    return matches.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  if (results.length) {
    return flatten(results)
  }

  // Backend had no matches (or was unreachable) — fall back to the local dataset
  // so filtering by any year 2016+ still yields the demo results.
  const local = searchNumbers({
    query: q,
    mode,
    categoryId,
    year,
    prizeTier,
  })
  return local
}
