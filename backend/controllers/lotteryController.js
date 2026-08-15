const LotteryResult = require('../models/LotteryResult');
const connectDB = require('../config/db');
const { fetchLotteryResults, getFetcherStatus } = require('../services/lotteryFetcher');
const { syncResults } = require('../services/syncService');
const logger = require('../utils/logger');

function normalizeQuery(value) {
  return String(value || '').trim().toLowerCase();
}

function filterResults(results, query = {}) {
  const search = normalizeQuery(query.q);
  const category = normalizeQuery(query.category || query.categoryId);
  const year = normalizeQuery(query.year);
  const prizeTier = normalizeQuery(query.prizeTier || query.tier);
  const mode = query.mode === 'exact' ? 'exact' : 'partial';

  return results.filter((result) => {
    if (category && category !== 'all' && result.categoryId !== category) return false;
    if (year && year !== 'all' && String(result.year) !== year) return false;
    if (!search && !prizeTier) return true;

    return result.prizes.some((prize) => {
      if (prizeTier && prizeTier !== 'all' && normalizeQuery(prize.tier) !== prizeTier) return false;
      if (!search) return true;
      return prize.numbers.some((number) => {
        const digits = String(number.digits || number.full || '').replace(/\D/g, '');
        return mode === 'exact' ? digits === search.replace(/\D/g, '') : digits.includes(search.replace(/\D/g, ''));
      });
    });
  });
}

/**
 * Convert a DB document into the API shape (same shape the scraper returns).
 */
function toApiResult(doc) {
  return {
    id: doc.externalId,
    categoryId: doc.categoryId,
    categoryName: doc.categoryName,
    series: doc.series,
    drawCode: doc.drawCode,
    date: doc.drawDate ? doc.drawDate.toISOString().slice(0, 10) : null,
    year: doc.year,
    monthLabel: doc.monthLabel,
    type: doc.type,
    prizes: doc.prizes || [],
    sourceUrl: doc.sourceUrl,
    sourceTitle: doc.sourceTitle,
  };
}

/**
 * Read results from MongoDB (fast path). Optionally seed from the scraper
 * when the DB is empty so the API still returns data on first boot.
 */
async function loadResultsFromDb(allowSeed = true) {
  if (!connectDB.isConnected()) {
    logger.warn('[controller] MongoDB not connected; falling back to scraper cache');
    return null;
  }

  const docs = await LotteryResult.find({}).sort({ drawDate: -1 }).lean();
  if (docs.length) {
    logger.info(`[controller] loaded ${docs.length} results from MongoDB`);
    return docs.map(toApiResult);
  }

  // DB reachable but empty -> seed from the scraper once.
  if (allowSeed) {
    const scraped = await fetchLotteryResults();
    if (scraped.length) {
      logger.info(`[controller] seeding ${scraped.length} scraped results into empty MongoDB`);
      await syncResults(scraped);
      // Re-read what we just wrote.
      const seeded = await LotteryResult.find({}).sort({ drawDate: -1 }).lean();
      return seeded.map(toApiResult);
    }
  }
  return [];
}

/**
 * Refresh: scrape latest -> upsert to MongoDB -> refresh in-memory cache -> return updated data.
 */
async function refreshAndGet() {
  const scraped = await fetchLotteryResults({ forceRefresh: true });
  let synced = { matched: 0, modified: 0, upserted: 0, errors: 0 };
  let fromDb = false;

  if (connectDB.isConnected()) {
    synced = await syncResults(scraped);
    fromDb = true;
  } else {
    logger.warn('[controller] MongoDB unavailable during refresh; returning scraper data only');
  }

  // Prefer MongoDB data when available, otherwise the scraper results.
  let results = scraped;
  if (fromDb) {
    const docs = await LotteryResult.find({}).sort({ drawDate: -1 }).lean();
    results = docs.length ? docs.map(toApiResult) : scraped;
  }

  return { results, synced, fromDb };
}

exports.getAllResults = async (req, res) => {
  try {
    let results = await loadResultsFromDb();
    if (results === null) {
      // DB down -> fall back to scraper cache.
      results = await fetchLotteryResults();
    }
    const filtered = filterResults(results, req.query);
    res.json(filtered);
  } catch (err) {
    logger.error('[getAllResults] failed', err);
    res.status(502).json({ message: 'Unable to fetch lottery results', detail: err.message });
  }
};

exports.searchResults = async (req, res) => {
  try {
    let results = await loadResultsFromDb();
    if (results === null) {
      results = await fetchLotteryResults();
    }
    res.json(filterResults(results, req.query));
  } catch (err) {
    logger.error('[searchResults] failed', err);
    res.status(502).json({ message: 'Unable to search lottery results', detail: err.message });
  }
};

exports.getResultById = async (req, res) => {
  try {
    let results = await loadResultsFromDb();
    if (results === null) {
      results = await fetchLotteryResults();
    }
    const result = results.find((item) => item.id === req.params.id || item.sourceUrl === req.params.id);
    if (!result) return res.status(404).json({ message: 'Not found' });
    res.json(result);
  } catch (err) {
    logger.error('[getResultById] failed', err);
    res.status(502).json({ message: 'Unable to fetch lottery result', detail: err.message });
  }
};

exports.refreshResults = async (req, res) => {
  try {
    const { results, synced, fromDb } = await refreshAndGet();
    logger.info(
      `[refreshResults] returned ${results.length} results (source=${fromDb ? 'MongoDB' : 'scraper'}, ` +
      `upserted=${synced.upserted}, modified=${synced.modified}, errors=${synced.errors})`
    );
    res.json({ count: results.length, results, synced, fromDb, status: getFetcherStatus() });
  } catch (err) {
    logger.error('[refreshResults] failed', err);
    res.status(502).json({ message: 'Unable to refresh lottery results', detail: err.message });
  }
};

exports.getStatus = (req, res) => {
  res.json({
    ok: true,
    database: connectDB.isConnected(),
    ...getFetcherStatus(),
  });
};

exports.createResult = async (req, res) => {
  if (!connectDB.isConnected()) return res.status(503).json({ message: 'Database is unavailable' });
  try {
    const payload = { ...req.body, externalId: req.body.externalId || req.body.id || req.body.sourceUrl };
    const created = await LotteryResult.create(payload);
    res.status(201).json(created);
  } catch (err) {
    logger.error('[createResult] failed', err);
    res.status(400).json({ message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  if (!connectDB.isConnected()) return res.status(503).json({ message: 'Database is unavailable' });
  try {
    const updated = await LotteryResult.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    logger.error('[updateResult] failed', err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteResult = async (req, res) => {
  if (!connectDB.isConnected()) return res.status(503).json({ message: 'Database is unavailable' });
  try {
    const deleted = await LotteryResult.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    logger.error('[deleteResult] failed', err);
    res.status(500).json({ message: err.message });
  }
};
