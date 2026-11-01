import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool } from '../src/config/database.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationPaths = [
  path.resolve(scriptDirectory, '../migrations/001_initial_schema.sql'),
  path.resolve(scriptDirectory, '../migrations/002_ticket_activity.sql'),
  path.resolve(scriptDirectory, '../migrations/003_ticket_resolution_notes.sql'),
  path.resolve(scriptDirectory, '../migrations/004_workspace_invitations.sql'),
  path.resolve(scriptDirectory, '../migrations/005_ticket_lifecycle_collaboration.sql'),
];

const run = async () => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (const migrationPath of migrationPaths) {
      await client.query(await fs.readFile(migrationPath, 'utf8'));
    }
    await client.query('COMMIT');
    console.log('Applied database migrations successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await closePool();
  }
};

run().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
});
