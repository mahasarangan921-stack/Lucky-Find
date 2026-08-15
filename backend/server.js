const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const lotteryRoutes = require('./routes/lotteryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// CORS — allow the Vite dev server origin plus any configured origins.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. curl, server-to-server).
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV === 'production' && allowedOrigins[0] !== '*') {
      return callback(new Error('Not allowed by CORS'));
    }
    return callback(null, true);
  },
}));

app.use(express.json());

// Request/response logging.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Connect to DB (non-blocking; the API falls back to scraper cache if unavailable).
connectDB();

// Mount API routes
app.use('/api/lottery', lotteryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/announcements', announcementRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'lottery-api', database: connectDB.isConnected() });
});

// JSON 404 for unknown API routes.
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Central error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  const status = err.status || (err.name === 'CorsError' ? 403 : 500);
  res.status(status).json({ message: err.message || 'Internal server error' });
});

// Port
const PORT = Number(process.env.PORT || 5001);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
