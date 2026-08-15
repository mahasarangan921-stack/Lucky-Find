// Lottery categories. `theme` maps to an accent used on ticket cards.
export const CATEGORIES = [
  { id: 'samrudhi', name: 'Samrudhi', series: 'SM', type: 'weekly', day: 'Sunday', theme: 'gold', tagline: 'The Sunday draw of prosperity' },
  { id: 'bhagyathara', name: 'Bhagyathara', series: 'BT', type: 'weekly', day: 'Monday', theme: 'emerald', tagline: 'A Monday chance at fortune' },
  { id: 'sthree-sakthi', name: 'Sthree Sakthi', series: 'SS', type: 'weekly', day: 'Tuesday', theme: 'maroon', tagline: 'The power draw' },
  { id: 'dhanalekshmi', name: 'Dhanalekshmi', series: 'DL', type: 'weekly', day: 'Wednesday', theme: 'gold', tagline: 'Wednesday wealth and luck' },
  { id: 'karunya-plus', name: 'Karunya Plus', series: 'KN', type: 'weekly', day: 'Thursday', theme: 'emerald', tagline: 'Extra chances, every week' },
  { id: 'suvarna-keralam', name: 'Suvarna Keralam', series: 'SK', type: 'weekly', day: 'Friday', theme: 'maroon', tagline: 'Friday gold in Kerala' },
  { id: 'karunya', name: 'Karunya', series: 'KR', type: 'weekly', day: 'Saturday', theme: 'gold', tagline: 'The weekly draw of mercy' },
  { id: 'pooja-bumper', name: 'Pooja Bumper', series: 'PB', type: 'bumper', day: null, theme: 'gold', tagline: 'The season\u2019s biggest bumper' },
  { id: 'christmas-bumper', name: 'Christmas Bumper', series: 'CB', type: 'bumper', day: null, theme: 'emerald', tagline: 'A festive jackpot' },
  { id: 'monsoon-bumper', name: 'Monsoon Bumper', series: 'MB', type: 'bumper', day: null, theme: 'maroon', tagline: 'Luck through the rains' },
  { id: 'vishu-bumper', name: 'Vishu Bumper', series: 'VB', type: 'bumper', day: null, theme: 'gold', tagline: 'A new-year windfall' },
  { id: 'thiruvonam-bumper', name: 'Thiruvonam Bumper', series: 'BR', type: 'bumper', day: null, theme: 'emerald', tagline: 'The Onam season jackpot' },
  { id: 'summer-bumper', name: 'Summer Bumper', series: 'SB', type: 'bumper', day: null, theme: 'maroon', tagline: 'Peak-season prize money' },
]

export const THEME_COLORS = {
  gold: { text: 'text-gold-bright', bg: 'bg-gold/15', border: 'border-gold/40', solid: 'bg-gold' },
  emerald: { text: 'text-emerald-bright', bg: 'bg-emerald/15', border: 'border-emerald/40', solid: 'bg-emerald' },
  maroon: { text: 'text-maroon-bright', bg: 'bg-maroon/15', border: 'border-maroon/40', solid: 'bg-maroon' },
}

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id)
}
