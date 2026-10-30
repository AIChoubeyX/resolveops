import { config } from '../config/index.js';
import { checkDatabaseHealth } from '../config/database.js';

/**
 * Health service handles inspection of backend operational state.
 * Encapsulates service-level metrics and uptime calculations.
 */
export const getHealthData = async () => {
  const database = await checkDatabaseHealth();
  return {
    status: database.connected ? 'ok' : 'degraded',
    service: config.serviceName,
    environment: config.nodeEnv,
    api: { connected: true },
    database: { connected: database.connected },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
};
