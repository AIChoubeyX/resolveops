import { getPool } from '../config/database.js';

const defaultOrganizationName = (displayName, email) => {
  const name = displayName?.trim() || email?.split('@')[0] || 'My';
  return `${name}'s Workspace`;
};

export const syncUser = async (identity) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      `INSERT INTO users (firebase_uid, email, display_name, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (firebase_uid) DO UPDATE SET
         email = EXCLUDED.email,
         display_name = COALESCE(EXCLUDED.display_name, users.display_name),
         avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
         updated_at = NOW()
       RETURNING id, firebase_uid, email, display_name, avatar_url, created_at, updated_at`,
      [identity.firebaseUid, identity.email, identity.displayName, identity.avatarUrl]
    );
    const userLockResult = await client.query(
      `SELECT id, firebase_uid, email, display_name, avatar_url, created_at, updated_at
       FROM users WHERE id = $1 FOR UPDATE`,
      [userResult.rows[0].id]
    );
    const user = userLockResult.rows[0];
    const membershipResult = await client.query(
      `SELECT o.id, o.name, om.role
       FROM organization_members om
       JOIN organizations o ON o.id = om.organization_id
       WHERE om.user_id = $1
       ORDER BY o.created_at ASC`,
      [user.id]
    );

    if (membershipResult.rowCount === 0) {
      const organizationResult = await client.query(
        `INSERT INTO organizations (name) VALUES ($1)
         RETURNING id, name, created_at, updated_at`,
        [defaultOrganizationName(identity.displayName, identity.email)]
      );
      await client.query(
        `INSERT INTO organization_members (organization_id, user_id, role)
         VALUES ($1, $2, 'admin')
         ON CONFLICT (organization_id, user_id) DO NOTHING`,
        [organizationResult.rows[0].id, user.id]
      );
      membershipResult.rows.push({ ...organizationResult.rows[0], role: 'admin' });
    }
    await client.query('COMMIT');
    return { user, organizations: membershipResult.rows };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getUserProfile = async (firebaseUid) => {
  const result = await getPool().query(
    `SELECT u.id, u.firebase_uid, u.email, u.display_name, u.avatar_url,
            u.created_at, u.updated_at,
            COALESCE(json_agg(json_build_object(
              'id', o.id, 'name', o.name, 'role', om.role
            ) ORDER BY o.created_at) FILTER (WHERE o.id IS NOT NULL), '[]') AS organizations
     FROM users u
     LEFT JOIN organization_members om ON om.user_id = u.id
     LEFT JOIN organizations o ON o.id = om.organization_id
     WHERE u.firebase_uid = $1
     GROUP BY u.id`,
    [firebaseUid]
  );
  return result.rows[0] || null;
};

export const getDatabaseUser = async (firebaseUid) => {
  const result = await getPool().query(
    `SELECT id, firebase_uid, email, display_name, avatar_url
     FROM users WHERE firebase_uid = $1`,
    [firebaseUid]
  );
  return result.rows[0] || null;
};
