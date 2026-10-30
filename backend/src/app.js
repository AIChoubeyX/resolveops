import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configure CORS using environment configuration
app.use(
  cors({
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  })
);

// Standard body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    service: config.serviceName,
    status: 'online',
    version: '0.1.0',
    documentation: '/docs',
    endpoints: {
      health: '/api/health',
    },
  });
});

// API Routes
app.use('/api', apiRoutes);

// Catch-all 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
