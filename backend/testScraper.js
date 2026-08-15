const { fetchLotteryResults, getFetcherStatus } = require('./services/lotteryFetcher');

fetchLotteryResults({ forceRefresh: true })
  .then((results) => {
    console.log(JSON.stringify({
      count: results.length,
      results: results.map((result) => ({
        category: result.categoryName,
        drawCode: result.drawCode,
        date: result.date,
        prizes: result.prizes.length,
        sourceUrl: result.sourceUrl,
      })),
      status: getFetcherStatus(),
    }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
