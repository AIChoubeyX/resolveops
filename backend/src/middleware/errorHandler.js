import { config } from '../config/index.js';

/**
 * Centralized Error-Handling Middleware
 * Catches all errors forwarded via next(err) or thrown in async handlers.
 * Ensures consistent JSON response structure and prevents leaking internal stack traces in production.
 */
export const errorHandler = (err, req, res, next) => {
  // Always log the error details to server console for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
      message,
      ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
