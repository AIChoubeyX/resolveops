/**
 * 404 Not Found Middleware
 * Intercepts requests that do not match any defined routes and returns a standard JSON error response.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
