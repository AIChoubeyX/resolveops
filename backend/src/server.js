import app from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` ResolveOps API Server running on port ${PORT}`);
  console.log(` Environment : ${config.nodeEnv}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` CORS Origin : ${config.corsOrigin}`);
  console.log(`===============================================`);
});

// Handle graceful shutdown signals
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down ResolveOps API gracefully...`);
  server.close(() => {
    console.log('HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
