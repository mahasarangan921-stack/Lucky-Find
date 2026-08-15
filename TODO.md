# Kerala Lottery MERN Refactor — TODO

## Frontend (priority given user feedback)
- [x] 1. Fix `src/pages/NumberFinder.jsx` input field to be a properly controlled component (value + onChange).
- [x] 2. Add `searchLotteryResults(query, filters)` to `src/data/lotteryApi.js`.
- [x] 3. Route NumberFinder search through the backend API and display fetched data.

## Backend Scraper
- [x] 4. Make `parseResultHtml` less strict (don't drop results when prize sections are missing).
- [x] 5. Add detailed logging for Axios requests, HTML parsing, extracted links, parsed results, and API responses.

## MongoDB / Data Layer
- [x] 6. Rewrite `syncService.syncResults` for reliable upsert with externalId.
- [x] 7. Update `lotteryController` to read from MongoDB by default; scraper only runs when DB empty or on refresh.
- [x] 8. Implement `refreshResults`: scrape → upsert to MongoDB → refresh cache → return updated data.
- [x] 9. Add fallback to latest stored MongoDB data when the official website is unavailable (loadResultsFromDb falls back to scraper cache; refresh falls back to stored DB data).

## Config / Server
- [x] 10. Clean up `config/db.js` (remove deprecated mongoose options, clearer logs).
- [x] 11. Update `server.js` (CORS config, JSON error handler, request/response logging).
- [x] 12. Add `.env.example` documenting all environment variables.

## Verification
- [x] 13. Run scraper test, lint, start backend, test API routes, run frontend.
