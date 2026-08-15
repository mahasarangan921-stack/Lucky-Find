const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lottery';

console.log('[debug] MONGO_URI present:', Boolean(process.env.MONGO_URI));

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000),
    });
    logger.info('MongoDB connected', MONGO_URI);
    return true;
  } catch (err) {
    logger.warn('MongoDB unavailable; the API will fall back to the scraper cache', err.message);
    return false;
  }
}

connectDB.isConnected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
