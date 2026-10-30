import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;
let pool;

export const getPool = () => {
  if (!config.databaseUrl) {
    const error = new Error('Database is not configured');
    error.statusCode = 503;
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }
  if (!pool) {
    pool = new Pool({ connectionString: config.databaseUrl });
    pool.on('error', (error) => console.error('[DATABASE] Unexpected idle client error:', error.message));
  }
  return pool;
};

export const query = (text, params) => getPool().query(text, params);

export const checkDatabaseHealth = async () => {
  try {
    await query('SELECT 1');
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

export const closePool = async () => {
  if (pool) await pool.end();
  pool = undefined;
};
