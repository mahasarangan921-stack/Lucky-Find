import { CATEGORIES } from './categories'
import { mulberry32, hashString } from './rng'

const WEEKDAY_INDEX = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
}

const SERIES_LETTERS = ['A', 'B', 'D', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V']

const TODAY = new Date('2026-07-25T00:00:00')

function fmtDate(d) {
  return d.toISOString().slice(0, 10)
}

function monthName(d) {
  return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

// Evenly-spaced dates in a year (or partial year), snapped to the nearest target weekday.
function datesInRange(year, weekday, count, rangeEndOverride) {
  const start = new Date(Date.UTC(year, 0, 1))
  const end = rangeEndOverride || new Date(Date.UTC(year, 11, 31))
  const spanDays = Math.round((end - start) / 86400000)
  const dates = []
  for (let i = 0; i < count; i++) {
    const offset = Math.round(((i + 0.5) / count) * spanDays)
    const d = new Date(start.getTime() + offset * 86400000)
    if (weekday != null) {
      const target = WEEKDAY_INDEX[weekday]
      const diff = (target - d.getUTCDay() + 7) % 7
      d.setUTCDate(d.getUTCDate() + diff)
    }
    dates.push(d)
  }
  return dates
}

function randNumber(rng, digits) {
  let n = ''
  for (let i = 0; i < digits; i++) n += Math.floor(rng() * 10)
  return n
}

function weeklyPrizeSpec() {
  return [
    { tier: '1st Prize', amount: '₹80,00,000', count: 1, digits: 6, hasSeries: true },
    { tier: '2nd Prize', amount: '₹5,00,000', count: 1, digits: 6, hasSeries: true },
    { tier: '3rd Prize', amount: '₹1,00,000', count: 1, digits: 6, hasSeries: true },
    { tier: '4th Prize', amount: '₹5,000', count: 9, digits: 4, hasSeries: false },
    { tier: '5th Prize', amount: '₹2,000', count: 9, digits: 4, hasSeries: false },
    { tier: '6th Prize', amount: '₹1,000', count: 9, digits: 4, hasSeries: false },
    { tier: '7th Prize', amount: '₹500', count: 9, digits: 4, hasSeries: false },
    { tier: '8th Prize', amount: '₹100', count: 10, digits: 4, hasSeries: false },
    { tier: 'Consolation Prize', amount: '₹8,000', count: 8, digits: 6, hasSeries: true },
  ]
}

function bumperPrizeSpec() {
  return [
    { tier: '1st Prize', amount: '₹1,20,00,000', count: 1, digits: 6, hasSeries: true },
    { tier: '2nd Prize', amount: '₹30,00,000', count: 1, digits: 6, hasSeries: true },
    { tier: '3rd Prize', amount: '₹10,00,000', count: 2, digits: 6, hasSeries: true },
    { tier: '4th Prize', amount: '₹5,00,000', count: 3, digits: 6, hasSeries: true },
    { tier: '5th Prize', amount: '₹1,00,000', count: 5, digits: 6, hasSeries: true },
    { tier: '6th Prize', amount: '₹5,000', count: 12, digits: 4, hasSeries: false },
    { tier: '7th Prize', amount: '₹2,000', count: 12, digits: 4, hasSeries: false },
    { tier: '8th Prize', amount: '₹1,000', count: 12, digits: 4, hasSeries: false },
    { tier: '9th Prize', amount: '₹500', count: 15, digits: 4, hasSeries: false },
    { tier: 'Consolation Prize', amount: '₹12,000', count: 10, digits: 6, hasSeries: true },
  ]
}

function buildPrizes(rng, spec) {
  return spec.map((tierSpec) => {
    const numbers = []
    for (let i = 0; i < tierSpec.count; i++) {
      const digits = randNumber(rng, tierSpec.digits)
      const series = tierSpec.hasSeries
        ? SERIES_LETTERS[Math.floor(rng() * SERIES_LETTERS.length)]
        : null
      numbers.push({ series, digits, full: series ? `${series} ${digits}` : digits })
    }
    return { tier: tierSpec.tier, amount: tierSpec.amount, numbers }
  })
}

// Draws per (category, year) — kept modest so the dataset stays fast & legible.
const WEEKLY_COUNTS = { 2024: 4, 2025: 6, 2026: 4 }
const BUMPER_YEARS = [2024, 2025] // 2026 bumper hasn't drawn yet — see upcomingDraws

function generateAll() {
  const results = []
  let seq = 1

  CATEGORIES.forEach((cat) => {
    if (cat.type === 'weekly') {
      Object.entries(WEEKLY_COUNTS).forEach(([yearStr, count]) => {
        const year = Number(yearStr)
        const rangeEnd = year === 2026 ? TODAY : undefined
        if (year === 2026 && TODAY.getUTCMonth() < 1) return
        const dates = datesInRange(year, cat.day, count, rangeEnd)
        dates.forEach((d) => {
          if (d > TODAY) return
          const seed = hashString(`${cat.id}-${fmtDate(d)}`)
          const rng = mulberry32(seed)
          const drawNumber = 100 + Math.floor(rng() * 800)
          results.push({
            id: `${cat.series}-${seq++}`,
            categoryId: cat.id,
            categoryName: cat.name,
            series: cat.series,
            drawCode: `${cat.series} ${drawNumber}`,
            date: fmtDate(d),
            year,
            monthLabel: monthName(d),
            type: 'weekly',
            prizes: buildPrizes(rng, weeklyPrizeSpec()),
          })
        })
      })
    } else {
      BUMPER_YEARS.forEach((year) => {
        const seed = hashString(`${cat.id}-${year}`)
        const rng = mulberry32(seed)
        const month = 2 + Math.floor(rng() * 9)
        const day = 1 + Math.floor(rng() * 27)
        const d = new Date(Date.UTC(year, month, day))
        if (d > TODAY) return
        const drawNumber = 100 + Math.floor(rng() * 400)
        results.push({
          id: `${cat.series}-${seq++}`,
          categoryId: cat.id,
          categoryName: cat.name,
          series: cat.series,
          drawCode: `${cat.series} ${drawNumber}`,
          date: fmtDate(d),
          year,
          monthLabel: monthName(d),
          type: 'bumper',
          prizes: buildPrizes(rng, bumperPrizeSpec()),
        })
      })
    }
  })

  // --- Hand-planted results so the search demo tells a consistent story ---
  const planted = [
    {
      id: 'PB-plant-1', categoryId: 'pooja-bumper', categoryName: 'Pooja Bumper', series: 'PB',
      drawCode: 'PB 91', date: '2025-11-16', year: 2025, monthLabel: 'November 2025', type: 'bumper',
      prizes: [
        { tier: '1st Prize', amount: '₹1,20,00,000', numbers: [{ series: 'PB', digits: '854123', full: 'PB 854123' }] },
        { tier: '2nd Prize', amount: '₹30,00,000', numbers: [{ series: 'PB', digits: '203981', full: 'PB 203981' }] },
        { tier: '3rd Prize', amount: '₹10,00,000', numbers: [
          { series: 'PB', digits: '100123', full: 'PB 100123' },
          { series: 'PA', digits: '551209', full: 'PA 551209' },
        ] },
        { tier: '4th Prize', amount: '₹5,000', numbers: [{ series: null, digits: '0123', full: '0123' }, { series: null, digits: '4587', full: '4587' }] },
      ],
    },
    {
      id: 'MB-plant-1', categoryId: 'monsoon-bumper', categoryName: 'Monsoon Bumper', series: 'MB',
      drawCode: 'MB 78', date: '2024-08-14', year: 2024, monthLabel: 'August 2024', type: 'bumper',
      prizes: [
        { tier: '1st Prize', amount: '₹1,20,00,000', numbers: [{ series: 'MB', digits: '772460', full: 'MB 772460' }] },
        { tier: '2nd Prize', amount: '₹30,00,000', numbers: [{ series: 'MB', digits: '400123', full: 'MB 400123' }] },
        { tier: '3rd Prize', amount: '₹10,00,000', numbers: [{ series: 'MC', digits: '619044', full: 'MC 619044' }] },
        { tier: '5th Prize', amount: '₹1,00,000', numbers: [{ series: 'MD', digits: '123789', full: 'MD 123789' }] },
      ],
    },
    {
      id: 'KN-plant-1', categoryId: 'karunya', categoryName: 'Karunya', series: 'KN',
      drawCode: 'KN 512', date: '2026-06-18', year: 2026, monthLabel: 'June 2026', type: 'weekly',
      prizes: [
        { tier: '1st Prize', amount: '₹80,00,000', numbers: [{ series: 'KN', digits: '345123', full: 'KN 345123' }] },
        { tier: '4th Prize', amount: '₹5,000', numbers: [{ series: null, digits: '0123', full: '0123' }, { series: null, digits: '9981', full: '9981' }] },
      ],
    },
  ]

  return [...results, ...planted].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const RESULTS = generateAll()
export const TODAY_ISO = fmtDate(TODAY)
