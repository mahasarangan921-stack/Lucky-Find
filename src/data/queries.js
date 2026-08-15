import { RESULTS } from './generateResults'

// --- Number Finder -----------------------------------------------------

/**
 * Search across all stored results for a ticket number.
 * mode: 'exact' | 'partial'  — exact matches the full digit string,
 * partial matches numbers whose digits *contain* the query (e.g. last 3-4 digits).
 */
export function searchNumbers({ query, mode = 'partial', categoryId = 'all', year = 'all', prizeTier = 'all', results = RESULTS }) {
  const q = (query || '').trim()
  if (!q) return []

  const matches = []
  for (const result of results) {
    if (categoryId !== 'all' && result.categoryId !== categoryId) continue
    if (year !== 'all' && String(result.year) !== String(year)) continue

    for (const prize of result.prizes) {
      if (prizeTier !== 'all' && prize.tier !== prizeTier) continue
      for (const num of prize.numbers) {
        const isMatch = mode === 'exact' ? num.digits === q : num.digits.includes(q)
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

export function getAvailableYears(results = RESULTS, startYear = 2016) {
  // Include the full contiguous range (2016 → current year) so users can
  // filter by any year, even before data was recorded.
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= startYear; y--) years.push(y)
  return years
}

export function getAllPrizeTiers(results = RESULTS) {
  const tiers = new Set()
  results.forEach((r) => r.prizes.forEach((p) => tiers.add(p.tier)))
  return [...tiers]
}

// --- Result lookup -------------------------------------------------------

export function getResultById(id, results = RESULTS) {
  return results.find((r) => r.id === id)
}

export function getResultsByCategory(categoryId, results = RESULTS) {
  return results.filter((r) => r.categoryId === categoryId).sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getLatestResults(limit = 6, results = RESULTS) {
  return [...results].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit)
}

// --- Historical explorer --------------------------------------------------

export function getHistoryTree(results = RESULTS) {
  const tree = {}
  results.forEach((r) => {
    tree[r.year] ??= {}
    tree[r.year][r.categoryId] ??= { categoryName: r.categoryName, draws: [] }
    tree[r.year][r.categoryId].draws.push(r)
  })
  Object.values(tree).forEach((cats) => {
    Object.values(cats).forEach((c) => c.draws.sort((a, b) => new Date(b.date) - new Date(a.date)))
  })
  return tree
}

// --- Statistics ------------------------------------------------------------

export function getNumberFrequency(query, results = RESULTS) {
  const q = (query || '').trim()
  if (!q) return null
  const appearances = searchNumbers({ query: q, mode: 'partial', results })
  const byCategory = {}
  let highestPrize = null
  appearances.forEach((a) => {
    byCategory[a.categoryName] = (byCategory[a.categoryName] || 0) + 1
    if (!highestPrize || tierRank(a.tier) < tierRank(highestPrize)) highestPrize = a.tier
  })
  const mostFrequentCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  return {
    query: q,
    totalAppearances: appearances.length,
    highestPrize,
    mostFrequentCategory,
    appearances,
  }
}

function tierRank(tier) {
  const order = ['1st Prize', '2nd Prize', '3rd Prize', '4th Prize', '5th Prize', '6th Prize', '7th Prize', '8th Prize', '9th Prize', 'Consolation Prize']
  const i = order.indexOf(tier)
  return i === -1 ? 999 : i
}

export function getOverviewStats(results = RESULTS) {
  const totalDraws = results.length
  const totalNumbers = results.reduce((sum, r) => sum + r.prizes.reduce((s, p) => s + p.numbers.length, 0), 0)
  const categoriesCovered = new Set(results.map((r) => r.categoryId)).size
  const years = getAvailableYears(results)
  return { totalDraws, totalNumbers, categoriesCovered, years }
}

export function getResultsByMonth(results = RESULTS) {
  const map = {}
  results.forEach((r) => {
    const key = r.date.slice(0, 7)
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

export function getDrawCountByCategory(results = RESULTS) {
  const map = {}
  results.forEach((r) => {
    map[r.categoryName] = (map[r.categoryName] || 0) + 1
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

export function getPrizeDistribution(results = RESULTS) {
  const map = {}
  results.forEach((r) => r.prizes.forEach((p) => {
    map[p.tier] = (map[p.tier] || 0) + p.numbers.length
  }))
  return Object.entries(map)
}
