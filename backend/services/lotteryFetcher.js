const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const logger = require('../utils/logger');

const SOURCE_URL =
  process.env.LOTTERY_SOURCE_URL ||
  'https://www.lotto.in/kerala-state-lotteries/results';
const RESULT_PAGE_LIMIT = Number(process.env.RESULT_PAGE_LIMIT || 1000);
const CACHE_TTL_MS = Number(process.env.RESULT_CACHE_TTL_MS || 15 * 60 * 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.SOURCE_TIMEOUT_MS || 15000);

const CATEGORY_DEFINITIONS = [
  { id: 'samrudhi', name: 'Samrudhi', series: 'SM', type: 'weekly', aliases: ['samrudhi'] },
{ id: 'bhagyathara', name: 'Bhagyathara', series: 'BT', type: 'weekly', aliases: ['bhagyathara', 'bhagyamithra'] },
{ id: 'sthree-sakthi', name: 'Sthree Sakthi', series: 'SS', type: 'weekly', aliases: ['sthree sakthi'] },
{ id: 'dhanalekshmi', name: 'Dhanalekshmi', series: 'DL', type: 'weekly', aliases: ['dhanalekshmi'] },
{ id: 'karunya-plus', name: 'Karunya Plus', series: 'KN', type: 'weekly', aliases: ['karunya plus'] },
{ id: 'suvarna-keralam', name: 'Suvarna Keralam', series: 'SK', type: 'weekly', aliases: ['suvarna keralam'] },
{ id: 'karunya', name: 'Karunya', series: 'KR', type: 'weekly', aliases: ['karunya'] },
  // NOTE: the site itself uses "Xmas New Year Bumper" in its URLs/titles, not
  // "Christmas" — that mismatch was silently sending every Xmas draw into the
  // body-text fallback below, which is why they were getting mislabeled.
  { id: 'christmas-bumper', name: 'Christmas Bumper', series: 'BR', type: 'bumper', aliases: ['xmas new year bumper', 'xmas bumper', 'christmas bumper', 'christmas new year bumper'] },
  { id: 'summer-bumper', name: 'Summer Bumper', series: 'BR', type: 'bumper', aliases: ['summer bumper'] },
  { id: 'vishu-bumper', name: 'Vishu Bumper', series: 'BR', type: 'bumper', aliases: ['vishu bumper'] },
  { id: 'monsoon-bumper', name: 'Monsoon Bumper', series: 'BR', type: 'bumper', aliases: ['monsoon bumper'] },
  { id: 'thiruvonam-bumper', name: 'Thiruvonam Bumper', series: 'BR', type: 'bumper', aliases: ['thiruvonam bumper', 'onam bumper'] },
  { id: 'pooja-bumper', name: 'Pooja Bumper', series: 'BR', type: 'bumper', aliases: ['pooja bumper'] },
];

// Longest-alias-first list, built directly from CATEGORY_DEFINITIONS so there
// is a single source of truth (previously findCategory() had its own
// hardcoded, out-of-sync copy of these strings, which is how "xmas" got missed).
const CATEGORY_ALIASES = CATEGORY_DEFINITIONS
  .flatMap((category) => category.aliases.map((alias) => [alias.toLowerCase(), category.id]))
  .sort((a, b) => b[0].length - a[0].length);

// All known draw-series codes, used later to recover a draw's series/number
// from older archive pages whose footer wording doesn't match the current
// "LOTTERY NO.X-YY DRAW held on..." phrasing.
const SERIES_NUMBER_PATTERN =
  /\b([A-Z]{1,3})[\s.-]*(\d{1,4})(?:st|nd|rd|th)?\b/i;

const PRIZE_ORDER = [
  '1st Prize',
  '2nd Prize',
  '3rd Prize',
  '4th Prize',
  '5th Prize',
  '6th Prize',
  '7th Prize',
  '8th Prize',
  '9th Prize',
  'Consolation Prize',
];

const blockedSeries = new Set(['P', 'NO', 'RS', 'INR', 'PDF', 'AND', 'THE']);
let cache = { results: null, fetchedAt: 0, live: false };

function cleanText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function isResultUrl(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== new URL(SOURCE_URL).hostname) {
      return false;
    }

    return /^\/kerala-state-lotteries\/.*results\/?$/.test(parsed.pathname);
  } catch {
    return false;
  }
}

function extractResultLinks(html, baseUrl = SOURCE_URL) {
  const $ = cheerio.load(html);
  const links = [];
  const seen = new Set();

  $('a[href]').each((_, element) => {
    const href = normalizeUrl($(element).attr('href'), baseUrl);

    if (!href || seen.has(href) || !isResultUrl(href)) {
      return;
    }

    seen.add(href);
    links.push(href);
  });

  logger.info(
    `[extractResultLinks] found ${links.length} Kerala lottery result pages`
  );

  if (links.length) {
    logger.debug(
      `[extractResultLinks] links: ${links.join(', ')}`
    );
  }

  return links;
}

function parseDateValue(value) {
  const match = String(value || '').match(/(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : date;
}

function extractDrawDate(bodyText, title, sourceUrl) {
  const labelled = bodyText.match(/date\s+of\s+draw\s*:?\s*([^|]+)/i);
  return (
    parseDateValue(labelled?.[1]) ||
    parseDateValue(title) ||
    parseDateValue(bodyText) ||
    parseDateValue(sourceUrl)
  );
}

function findCategory(text) {
  const normalized = cleanText(text)
    .toLowerCase()
    .replace(/[._-]+/g, ' ');

  if (!normalized) return null;

  // CATEGORY_ALIASES is derived directly from CATEGORY_DEFINITIONS (single
  // source of truth) and sorted longest-alias-first, so e.g. "karunya plus"
  // is checked before the shorter "karunya" and can't be shadowed by it.
  for (const [alias, categoryId] of CATEGORY_ALIASES) {
    if (normalized.includes(alias)) {
      return CATEGORY_DEFINITIONS.find(
        category => category.id === categoryId
      ) || null;
    }
  }

  return null;
}

function extractDrawCode(text, category) {
  const source = cleanText(text);
  const series = CATEGORY_DEFINITIONS.map((item) => item.series).filter(Boolean);
  const pattern = new RegExp(`(?:^|[^a-z0-9])(${series.join('|')})[\\s.-]?(\\d{1,4})(?!\\d)`, 'i');
  const match = source.match(pattern);
  return match ? `${match[1].toUpperCase()} ${match[2]}` : category?.series || null;
}

function parsePrizeHeader(text) {
  const match = cleanText(text).match(/((?:1st|2nd|3rd|[4-9]th|Consolation)\s+Prize)\b\s*[:-]?\s*(?:(?:Rs\.?|₹|INR)\s*)?([\d,]+)?/i);
  if (!match) return null;
  const tier = match[1].replace(/\s+/g, ' ').replace(/consolation/i, 'Consolation').replace(/prize/i, 'Prize');
  return {
    tier,
    amount: match[2] ? `₹${match[2]}` : 'Prize amount unavailable',
    headerLength: match[0].length,
  };
}

function extractNumbers(text) {
  const source = cleanText(text)
    .replace(/(?:Rs\.?|₹|INR)\s*[\d,]+/gi, ' ')
    .replace(/agent\s+name:.*?(?=agency\s+no:|$)/gi, ' ')
    .replace(/agency\s+no\s*:\s*[a-z]{1,3}\s*\d{3,6}/gi, ' ')
    .replace(/(?:result\s*\(today\)|[a-z]{1,3}\s*\.?\s*\d{1,4}\s+result\b)[\s\S]*$/i, ' ')
    .replace(/(?:repeated\s+draw|tomorrow\s+draw|pdf\s+official|the\s+prize\s+winners|kerala\s+state\s+lotteries)[\s\S]*$/i, ' ');
  const numbers = [];
  const occupied = [];
  const seriesPattern = /([A-Z]{1,3})[\s.-]?(\d{4,6})/gi;
  let match;

  while ((match = seriesPattern.exec(source))) {
    const series = match[1].toUpperCase();
    if (blockedSeries.has(series)) continue;
    numbers.push({ series, digits: match[2], full: `${series} ${match[2]}` });
    occupied.push([match.index, seriesPattern.lastIndex]);
  }

  const plainSource = source.replace(/./g, (character, index) => (
    occupied.some(([start, end]) => index >= start && index < end) ? ' ' : character
  ));
  const plainPattern = /(?<!\d)(\d{4,6})(?!\d)/g;
  while ((match = plainPattern.exec(plainSource))) {
    numbers.push({ series: null, digits: match[1], full: match[1] });
  }

  const seen = new Set();
  return numbers.filter((number) => {
    if (seen.has(number.full)) return false;
    seen.add(number.full);
    return true;
  });
}

function parsePrizes($, body) {
  const lines = body.children().toArray().map((element) => cleanText($(element).text())).filter(Boolean);
  const text = lines.join('\n');
  const marker = /(?:1st|2nd|3rd|[4-9]th|Consolation)\s+Prize\b/gi;
  const occurrences = [];
  let match;

  while ((match = marker.exec(text))) {
    const header = parsePrizeHeader(text.slice(match.index, match.index + 160));
    if (header) occurrences.push({ ...header, start: match.index, end: marker.lastIndex });
  }

  const candidates = new Map();
  occurrences.forEach((occurrence, index) => {
    const next = occurrences[index + 1]?.start || text.length;
    const sectionText = text.slice(occurrence.end, next);
    const numbers = extractNumbers(sectionText);
    if (!numbers.length) {
      logger.debug(`[parsePrizes] no numbers found for "${occurrence.tier}" near "${sectionText.slice(0, 80)}"`);
      return;
    }
    const current = candidates.get(occurrence.tier);
    if (!current || numbers.length > current.numbers.length) {
      candidates.set(occurrence.tier, { tier: occurrence.tier, amount: occurrence.amount, numbers });
    }
  });

  const prizes = PRIZE_ORDER
    .map((tier) => candidates.get(tier))
    .filter(Boolean);

  if (occurrences.length !== prizes.length) {
    logger.debug(
      `[parsePrizes] found ${occurrences.length} prize headers but only parsed ${prizes.length} sections ` +
      `(${PRIZE_ORDER.filter((t) => !candidates.has(t)).join(', ') || 'all matched'})`
    );
  }
  return prizes;
}
function parseDrawSections($) {
  const sections = [];

  $('body')
    .find('h2, h3')
    .each((_, heading) => {
      const headingText = cleanText($(heading).text());

      if (!/Full .* Lottery Result|Previous .* Lottery Results/i.test(headingText)) {
        return;
      }

      let current = $(heading).next();

      while (current.length) {
        const text = cleanText(current.text());

        // Stop when another draw heading starts.
        if (
          current.is('h2, h3') &&
          /Previous .* Lottery Results|Full .* Lottery Result/i.test(text)
        ) {
          break;
        }

        current = current.next();
      }
    });

  /*
   * Lotto.in's HTML is easiest to parse by locating every
   * "Notes: ... LOTTERY NO.X-YYth DRAW held on..." marker.
   *
   * Each Notes marker belongs to the prize table immediately
   * above it.
   */

  const notes = [];

  $('body *').each((_, element) => {
    const text = cleanText($(element).text());

    if (
      /Notes:\s*[A-Z][A-Z\s-]*LOTTERY\s+NO\.?/i.test(text) &&
      /DRAW\s+held\s+on/i.test(text)
    ) {
      const ownText = cleanText($(element).clone().children().remove().end().text());

      if (ownText || $(element).children().length === 0) {
        notes.push({
          element,
          text,
        });
      }
    }
  });

  return notes;
}
function parseResultHtml(html, sourceUrl) {
  const $ = cheerio.load(html);

  const pageTitle = cleanText($('title').first().text());

  const category =
    findCategory(pageTitle) ||
    findCategory(sourceUrl) ||
    findCategory($('h1').first().text()) ||
    findCategory($('body').text());

  if (!category) {
    logger.warn(
      `[parseResultHtml] could not identify lottery category from ${sourceUrl}`
    );
    return [];
  }

  const results = [];

$('.expandable').each((index, element) => {
  const block = $(element);

  // -----------------------------------------
  // 1. Get draw information from this block's footer
  // -----------------------------------------
  // Current pages keep the note inside <tfoot> in one fixed sentence
  // ("LOTTERY NO.BT-65th DRAW held on:- 03/08/2026..."). Older archive
  // pages sometimes drop the <tfoot> entirely, or phrase the note
  // differently ("Draw Number BR-77" / "Draw held on 17/01/2021" as
  // separate fragments). Rather than requiring one exact combined
  // sentence, we now look for the series+number and the date
  // independently, anywhere in the block, and fall back to the whole
  // block's text if tfoot comes back empty.
  let footerText = cleanText(block.find('tfoot').first().text());
  if (!footerText) {
    // block.text() concatenates adjacent elements with NO separator
    // whenever the source HTML has no whitespace text node between them
    // (common on minified/compact archive pages) — e.g. two neighbouring
    // <td>/<p> tags can collapse into "1st PrizeBR 654321" or
    // "BR-77Draw held on...", which then fails to match the regexes
    // below because there's no boundary between the runs. Rebuild the
    // text leaf-by-leaf instead, joining with an explicit space so every
    // cell/paragraph stays separated regardless of the source formatting.
    const leafTexts = [];
    block.find('*').each((_, el) => {
      const $el = $(el);
      if ($el.children().length === 0) {
        const leafText = cleanText($el.text());
        if (leafText) leafTexts.push(leafText);
      }
    });
    footerText = leafTexts.length ? leafTexts.join(' ') : cleanText(block.text());
  }

  const seriesNumberMatch = footerText.match(SERIES_NUMBER_PATTERN);
  const date = parseDateValue(footerText);

  if (!seriesNumberMatch || !date) {
    logger.warn(
      `[parseResultHtml] could not find draw footer in block ${index}: ${footerText}`
    );
    return;
  }

  const series = seriesNumberMatch[1].toUpperCase();
  const drawNumber = seriesNumberMatch[2];
  const year = date.slice(0, 4);

  const drawCode =
    `${series} ${drawNumber}`;

  // -----------------------------------------
  // 2. Parse prize rows from THIS block only
  // -----------------------------------------
  const prizes = [];

  block.find('tr').each((_, row) => {
    const cells = $(row)
      .find('td')
      .map((_, cell) => cleanText($(cell).text()))
      .get();

    if (cells.length < 2) return;

    const tier = cells[0];

    if (!PRIZE_ORDER.includes(tier)) {
      return;
    }

    const numberText = cells[1];

    const amount =
      cells[2] || 'Prize amount unavailable';

    // Extract ticket numbers, keeping the series letters attached.
    // IMPORTANT: bumper draws (Christmas, Summer, Vishu, Monsoon,
    // Thiruvonam, Pooja) run several parallel ticket series in the same
    // prize tier — e.g. "BN 123456", "BO 123456", "BP 123456" can all be
    // listed under the same "1st Prize" row, and they are DIFFERENT
    // tickets that just happen to share the same 6 digits. A plain
    // \d{4,6} match here (the old code) threw away the series letter and
    // stored only "123456" for all of them, which made every series with
    // that digit combo look identical — so a ticket typed in from the
    // wrong series could still register as a "match". extractNumbers()
    // captures the series alongside the digits so they stay distinct.
    const numbers = extractNumbers(numberText);

    if (!numbers.length) {
      return;
    }

    prizes.push({
      tier,
      amount,
      numbers,
    });
  });

  if (!prizes.length) {
    logger.warn(
      `[parseResultHtml] ${category.name} ${drawCode} ` +
      `has no prize data`
    );
    return;
  }

  // -----------------------------------------
  // 3. Create stable result ID
  // -----------------------------------------
  const idSource =
    `${category.id}|${drawCode}|${date}`;

  const id =
    `result-${crypto
      .createHash('sha1')
      .update(idSource)
      .digest('hex')
      .slice(0, 12)}`;

  // -----------------------------------------
  // 4. Build result
  // -----------------------------------------
  const result = {
  id,
  categoryId: category.id,
  categoryName: category.name,
  series: series,
    drawCode,
    date,
    year: Number(year),

    monthLabel: new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`)),

    type: category.type,
    prizes,

    sourceUrl:
      normalizeUrl(sourceUrl, SOURCE_URL) ||
      sourceUrl,

    sourceTitle: pageTitle,
  };

  results.push(result);

  logger.info(
    `[parseResultHtml] parsed ${category.name} ${drawCode} ` +
    `dated ${date} with ${prizes.length} prize sections`
  );
});

  results.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );

  logger.info(
    `[parseResultHtml] ${category.name}: ` +
    `parsed ${results.length} historical draws from ${sourceUrl}`
  );

  return results;
}


async function fetchHtml(url) {
  logger.info(`[fetchHtml] GET ${url} (timeout ${REQUEST_TIMEOUT_MS}ms)`);
  try {
    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      responseType: 'text',
      responseEncoding: 'utf8',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      },
    });
    logger.info(
      `[fetchHtml] ${url} -> status ${response.status}, ${response.data ? response.data.length : 0} bytes`
    );
    return response.data;
  } catch (err) {
    const detail = [
      err.response?.status ? `status ${err.response.status}` : null,
      err.code || null,
      err.message,
    ].filter(Boolean).join(' | ');
    logger.warn(`[fetchHtml] request failed for ${url}: ${detail}`);
    throw err;
  }
}

async function readLocalSnapshots() {
  const files = ['page.html', 'result.html'];
  const snapshots = [];
  for (const file of files) {
    try {
      const html = await fs.readFile(path.join(__dirname, '..', file), 'utf8');
      snapshots.push({
        html,
        url: new URL(file === 'result.html' ? '2026/03/summer-bumper-kerala-lottery-result-br-108-today-28-03-2026.html' : '', SOURCE_URL).toString(),
      });
      logger.info(`[readLocalSnapshots] loaded ${file} (${html.length} bytes)`);
    } catch (err) {
      logger.warn(`[readLocalSnapshots] failed to read ${file}: ${err.message}`);
    }
  }
  return snapshots;
}

async function fetchLotteryResults({ forceRefresh = false } = {}) {
  const isFresh =
    cache.results &&
    Date.now() - cache.fetchedAt < CACHE_TTL_MS;

  if (!forceRefresh && isFresh) {
    logger.debug(
      `[fetchLotteryResults] returning fresh cache ` +
      `(${cache.results.length} results)`
    );

    return cache.results;
  }

  let homeHtml = null;
  let live = false;

  try {
    homeHtml = await fetchHtml(SOURCE_URL);
    live = true;
  } catch (err) {
    logger.warn(
      `[fetchLotteryResults] live source unavailable ` +
      `(${err.message}); falling back to local snapshots`
    );

    homeHtml = null;
  }

  const snapshots = homeHtml
    ? []
    : await readLocalSnapshots();

  /*
   * ---------------------------------------------------------
   * STEP 1: Get result links from homepage
   * ---------------------------------------------------------
   */

  const homeLinks = homeHtml
    ? extractResultLinks(homeHtml)
    : [];

  
logger.info(
  `[fetchLotteryResults] homepage result links: ${homeLinks.length}`
);

if (homeLinks.length) {
  logger.debug(
    `[fetchLotteryResults] result links: ${homeLinks.join(', ')}`
  );
}

/*
 * ---------------------------------------------------------
 * STEP 2: Use result pages discovered from homepage
 *
 * lotto.in exposes Kerala lottery category result pages like:
 *
 * /kerala-state-lotteries/bhagyathara-results
 * /kerala-state-lotteries/dhanalekshmi-results
 * /kerala-state-lotteries/karunya-results
 * /kerala-state-lotteries/summer-bumper-results
 *
 * These pages contain the actual result tables.
 * ---------------------------------------------------------
 */

const allResultLinks = [
  ...new Set(homeLinks),
].slice(0, RESULT_PAGE_LIMIT);

logger.info(
  `[fetchLotteryResults] total unique result links: ${allResultLinks.length}`
);

 
  /*
   * ---------------------------------------------------------
   * STEP 5: Add local snapshots
   * ---------------------------------------------------------
   */

  const pages = [];

  pages.push(...snapshots);

  /*
   * ---------------------------------------------------------
   * STEP 6: Fetch ALL result pages
   * ---------------------------------------------------------
   */

  const fetchedPages = await Promise.all(
    allResultLinks.map(async (url) => {
      try {
        return {
          html: await fetchHtml(url),
          url,
        };
      } catch (err) {
        logger.warn(
          `[fetchLotteryResults] failed result page ${url}: ` +
          `${err.message}`
        );

        return null;
      }
    })
  );

  const successful = fetchedPages.filter(Boolean);

  logger.info(
    `[fetchLotteryResults] fetched ` +
    `${successful.length}/${allResultLinks.length} result pages`
  );

  pages.push(...successful);

  /*
   * ---------------------------------------------------------
   * STEP 7: Parse every result
   * ---------------------------------------------------------
   */

  const results = [];
  const seen = new Set();

  let skipped = 0;

  for (const page of pages) {
  const parsedResults = parseResultHtml(
    page.html,
    page.url
  );

  if (!Array.isArray(parsedResults)) {
    skipped++;
    continue;
  }

  for (const result of parsedResults) {
    if (!result || seen.has(result.id)) {
      continue;
    }

    seen.add(result.id);
    results.push(result);
  }
}
  /*
   * ---------------------------------------------------------
   * STEP 8: Sort newest -> oldest
   * ---------------------------------------------------------
   */

  results.sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date)
  );

  logger.info(
    `[fetchLotteryResults] parsed ${results.length} ` +
    `unique results from ${pages.length} pages`
  );

  logger.info(
    `[fetchLotteryResults] skipped ${skipped} unparseable pages`
  );

  /*
   * ---------------------------------------------------------
   * STEP 9: Fallback to previous cache
   * ---------------------------------------------------------
   */

  if (!results.length && cache.results) {
    logger.warn(
      '[fetchLotteryResults] no fresh results; returning stale cache'
    );

    return cache.results;
  }

  /*
   * ---------------------------------------------------------
   * STEP 10: Update cache
   * ---------------------------------------------------------
   */

  cache = {
    results,
    fetchedAt: Date.now(),
    live,
  };

  return results;
}
function getFetcherStatus() {
  return { fetchedAt: cache.fetchedAt || null, live: cache.live, sourceUrl: SOURCE_URL };
}

module.exports = {
  CATEGORY_DEFINITIONS,
  fetchLotteryResults,
  getFetcherStatus,
  parseResultHtml,
};