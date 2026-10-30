/**
 * Standard API response utility helpers.
 * Ensures consistent response envelopes across all endpoints.
 */

export const sendSuccess = (res, data, statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
};

export const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
