const LotteryResult = require('../models/LotteryResult');
const logger = require('../utils/logger');

/**
 * Normalize a scraper result into the DB document shape.
 */
function toDocument(result) {
  const externalId = result.externalId || result.id || result.sourceUrl;
  return {
    externalId,
    drawDate: new Date(result.drawDate || result.date),
    categoryId: result.categoryId,
    categoryName: result.categoryName,
    series: result.series,
    drawCode: result.drawCode,
    year: result.year,
    monthLabel: result.monthLabel,
    type: result.type,
    prizes: result.prizes || [],
    sourceUrl: result.sourceUrl,
    sourceTitle: result.sourceTitle,
  };
}

/**
 * Upsert an array of lottery results into the DB using bulkWrite so each
 * document is either inserted or updated exactly once (no duplicates).
 *
 * Returns a summary `{ matched, modified, upserted, errors }`.
 */
async function syncResults(results = []) {
  if (!Array.isArray(results) || results.length === 0) {
    logger.info('[syncResults] nothing to sync (empty array)');
    return { matched: 0, modified: 0, upserted: 0, errors: 0 };
  }

  const operations = results.map((r) => {
    const doc = toDocument(r);
    return {
      updateOne: {
        filter: { externalId: doc.externalId },
        update: { $set: doc },
        upsert: true,
      },
    };
  });

  logger.info(`[syncResults] writing ${operations.length} upserts to MongoDB`);
  try {
    const result = await LotteryResult.bulkWrite(operations, { ordered: false });
    const summary = {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      errors: result.getWriteErrors ? result.getWriteErrors().length : 0,
    };
    logger.info(
      `[syncResults] complete -> matched=${summary.matched}, modified=${summary.modified}, ` +
      `upserted=${summary.upserted}, errors=${summary.errors}`
    );
    return summary;
  } catch (err) {
    logger.error('[syncResults] bulkWrite failed', err);
    return { matched: 0, modified: 0, upserted: 0, errors: results.length, error: err.message };
  }
}

module.exports = { syncResults };

