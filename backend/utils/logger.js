const DEBUG_ENABLED = process.env.LOG_LEVEL === 'debug' || process.env.DEBUG === 'true';

const logger = {
  info: (...args) => console.log('[info]', ...args),
  warn: (...args) => console.warn('[warn]', ...args),
  error: (...args) => console.error('[error]', ...args),
  debug: (...args) => {
    if (DEBUG_ENABLED) console.log('[debug]', ...args);
  },
};

module.exports = logger;
