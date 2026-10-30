import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const parsedPort = parseInt(process.env.PORT, 10);
const port = !isNaN(parsedPort) && parsedPort > 0 ? parsedPort : 5000;

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  serviceName: 'resolveops-api',
  databaseUrl: process.env.DATABASE_URL || '',
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
};

// Validate critical configuration values
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn('[CONFIG WARNING] CORS_ORIGIN is not explicitly set in production mode.');
}
