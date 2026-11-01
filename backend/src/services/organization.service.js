import crypto from 'node:crypto';
import { getPool } from '../config/database.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const getOrganization = async (organizationId) => {
  const result = await getPool().query(
    `SELECT id, name, created_at, updated_at FROM organizations WHERE id = $1`,
    [organizationId]
  );
  return result.rows[0] || null;
};

export const renameOrganization = async (organizationId, name) => {
  const result = await getPool().query(
    `UPDATE organizations SET name = $1, updated_at = NOW()
     WHERE id = $2 RETURNING id, name, created_at, updated_at`,
    [name.trim(), organizationId]
  );
  return result.rows[0] || null;
};

export const listMembers = async (organizationId) => {
  const result = await getPool().query(
    `SELECT u.id, u.display_name, u.email, u.avatar_url, om.role, om.created_at
     FROM organization_members om
     JOIN users u ON u.id = om.user_id
     WHERE om.organization_id = $1
     ORDER BY om.created_at ASC`,
    [organizationId]
  );
  return result.rows;
};

export const changeMemberRole = async (organizationId, userId, role) => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    if (role !== 'admin') {
      const current = await client.query(
        `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2 FOR UPDATE`,
        [organizationId, userId]
      );
      if (current.rows[0]?.role === 'admin') {
        const admins = await client.query(
          `SELECT COUNT(*)::int AS count FROM organization_members
           WHERE organization_id = $1 AND role = 'admin'`,
          [organizationId]
        );
        if (admins.rows[0].count <= 1) {
          const error = new Error('The workspace must retain at least one admin.');
          error.statusCode = 400;
          error.code = 'LAST_ADMIN';
          throw error;
        }
      }
    }
    const result = await client.query(
      `UPDATE organization_members SET role = $1
       WHERE organization_id = $2 AND user_id = $3
       RETURNING organization_id, user_id, role, created_at`,
      [role, organizationId, userId]
    );
    if (!result.rows[0]) {
      const error = new Error('Workspace member not found.');
      error.statusCode = 404;
      error.code = 'MEMBER_NOT_FOUND';
      throw error;
    }
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const removeMember = async (organizationId, userId) => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const member = await client.query(
      `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2 FOR UPDATE`,
      [organizationId, userId]
    );
    if (!member.rows[0]) {
      const error = new Error('Workspace member not found.');
      error.statusCode = 404;
      error.code = 'MEMBER_NOT_FOUND';
      throw error;
    }
    if (member.rows[0].role === 'admin') {
      const admins = await client.query(
        `SELECT COUNT(*)::int AS count FROM organization_members
         WHERE organization_id = $1 AND role = 'admin'`,
        [organizationId]
      );
      if (admins.rows[0].count <= 1) {
        const error = new Error('The last workspace admin cannot be removed.');
        error.statusCode = 400;
        error.code = 'LAST_ADMIN';
        throw error;
      }
    }
    await client.query(
      `DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const createInvitation = async (organizationId, invitedBy, email) => {
  const token = crypto.randomBytes(32).toString('hex');
  const result = await getPool().query(
    `INSERT INTO organization_invitations
       (organization_id, invited_email, token_hash, expires_at, invited_by)
     VALUES ($1, lower($2), $3, NOW() + INTERVAL '7 days', $4)
     RETURNING id, organization_id, invited_email, status, expires_at, created_at`,
    [organizationId, email, hashToken(token), invitedBy]
  );
  return { ...result.rows[0], token };
};

export const acceptInvitation = async (token, userId, email) => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT * FROM organization_invitations
       WHERE token_hash = $1 FOR UPDATE`,
      [hashToken(token)]
    );
    const invitation = result.rows[0];
    if (!invitation) {
      const error = new Error('Invitation link is invalid.');
      error.statusCode = 404;
      error.code = 'INVITATION_NOT_FOUND';
      throw error;
    }
    if (invitation.status !== 'pending') {
      const error = new Error(
        invitation.status === 'accepted'
          ? 'This invitation has already been accepted.'
          : 'This invitation has expired.'
      );
      error.statusCode = 400;
      error.code = invitation.status === 'accepted'
        ? 'INVITATION_ALREADY_USED'
        : 'INVITATION_EXPIRED';
      throw error;
    }
    if (new Date(invitation.expires_at) <= new Date()) {
        await client.query(
          `UPDATE organization_invitations SET status = 'expired' WHERE id = $1`,
          [invitation.id]
        );
      const error = new Error('This invitation has expired.');
      error.statusCode = 400;
      error.code = 'INVITATION_EXPIRED';
      throw error;
    }
    if (invitation.invited_email !== email.trim().toLowerCase()) {
      const error = new Error('This invitation was issued to a different email address.');
      error.statusCode = 403;
      error.code = 'INVITATION_EMAIL_MISMATCH';
      throw error;
    }
    await client.query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, 'reporter')
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [invitation.organization_id, userId]
    );
    await client.query(
      `UPDATE organization_invitations
       SET status = 'accepted', accepted_by = $1, accepted_at = NOW()
       WHERE id = $2`,
      [userId, invitation.id]
    );
    await client.query('COMMIT');
    return getOrganization(invitation.organization_id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
