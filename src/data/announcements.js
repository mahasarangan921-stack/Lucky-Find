export const ANNOUNCEMENTS = [
  {
    id: 'a1',
    date: '2026-07-24',
    tag: 'Bumper',
    title: 'Onam Bumper 2026 announced',
    body: 'The next bumper draw has been scheduled for September, with ticket sales opening in early August. Full prize structure will be published once sales begin.',
  },
  {
    id: 'a2',
    date: '2026-07-22',
    tag: 'Update',
    title: 'Result publication time moved to 3:00 PM',
    body: 'Starting this week, weekly draw results will be published at 3:00 PM instead of 4:00 PM to give buyers more time to verify winnings the same day.',
  },
  {
    id: 'a3',
    date: '2026-07-18',
    tag: 'Notice',
    title: 'Claim window reminder for Vishu Bumper',
    body: 'Prize claims for the Vishu Bumper 2026 draw close 30 days from the result date. Winners are encouraged to submit original tickets early.',
  },
  {
    id: 'a4',
    date: '2026-07-10',
    tag: 'Bumper',
    title: 'Monsoon Bumper ticket sales open',
    body: 'Tickets for this year\u2019s Monsoon Bumper are now on sale through authorised agents and the official outlets across the state.',
  },
  {
    id: 'a5',
    date: '2026-06-30',
    tag: 'Update',
    title: 'New search index live: partial number matching',
    body: 'You can now search by the last 3\u20134 digits of your ticket across every stored draw, instead of typing the full number.',
  },
  {
    id: 'a6',
    date: '2026-06-12',
    tag: 'Notice',
    title: 'Scheduled maintenance completed',
    body: 'Historical result data for 2024\u20132025 has been re-verified against original publications. No number changes were required.',
  },
]

// Upcoming draws relative to "today" (25 July 2026 in this mock dataset).
export const UPCOMING_DRAWS = [
  { id: 'u1', categoryId: 'karunya-plus', categoryName: 'Karunya Plus', series: 'KN+', date: '2026-07-25', time: '3:00 PM' },
  { id: 'u2', categoryId: 'nirmal', categoryName: 'Nirmal', series: 'NR', date: '2026-07-27', time: '3:00 PM' },
  { id: 'u3', categoryId: 'akshaya', categoryName: 'Akshaya', series: 'AK', date: '2026-07-28', time: '3:00 PM' },
  { id: 'u4', categoryId: 'sthree-sakthi', categoryName: 'Sthree Sakthi', series: 'SS', date: '2026-07-29', time: '3:00 PM' },
  { id: 'u5', categoryId: 'win-win', categoryName: 'Win-Win', series: 'W', date: '2026-08-03', time: '3:00 PM' },
  { id: 'u6', categoryId: 'pournami', categoryName: 'Pournami', series: 'RN', date: '2026-08-02', time: '3:00 PM' },
  { id: 'u7', categoryId: 'karunya', categoryName: 'Karunya', series: 'KN', date: '2026-07-30', time: '3:00 PM' },
  { id: 'u8', categoryId: 'onam-bumper', categoryName: 'Onam Bumper', series: 'OB', date: '2026-09-10', time: '3:00 PM' },
]

export const LAST_SYNCED = { date: '2026-07-25', time: '10:30 AM', status: 'ok' }
