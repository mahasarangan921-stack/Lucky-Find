# Lottery Result Finder

React/Vite frontend with an Express scraper API. The backend reads result links from `keralalotteries.net`, fetches each result page, parses the draw metadata and winning numbers, and serves normalized JSON to the frontend.

## Run locally

Install both dependency sets once:

```bash
npm install
npm --prefix backend install
```

Start the backend in one terminal:

```bash
npm run backend:dev
```

Start the frontend in another:

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:5001`. MongoDB is optional for the live read path; if it is unavailable, the API uses its cached source results and the bundled HTML snapshots.

## Useful endpoints

- `GET /api/health`
- `GET /api/lottery`
- `GET /api/lottery?q=1234&mode=partial`
- `POST /api/lottery/refresh`
- `GET /api/lottery/status`

Set `LOTTERY_SOURCE_URL`, `RESULT_PAGE_LIMIT`, `RESULT_CACHE_TTL_MS`, or `SOURCE_TIMEOUT_MS` in the backend environment when needed.
