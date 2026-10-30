import { getPool } from '../config/database.js';
import { getDatabaseUser } from './auth.service.js';

const rolePermissions = {
  admin: new Set(['read', 'create', 'comment', 'update', 'assign', 'resolve']),
  agent: new Set(['read', 'create', 'comment', 'update', 'assign', 'resolve']),
  reporter: new Set(['read', 'create', 'comment']),
  member: new Set(['read', 'create', 'comment']),
  viewer: new Set(['read']),
};

const httpError = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const requireDatabaseUser = async (firebaseUid) => {
  const user = await getDatabaseUser(firebaseUid);
  if (!user) throw httpError(404, 'USER_PROFILE_NOT_FOUND', 'User profile has not been synchronized.');
  return user;
};

export const requireOrganizationMembership = async (userId, organizationId, permission = 'read') => {
  const result = await getPool().query(
    `SELECT o.id, o.name, om.role
     FROM organization_members om
     JOIN organizations o ON o.id = om.organization_id
     WHERE om.user_id = $1 AND om.organization_id = $2`,
    [userId, organizationId]
  );
  const membership = result.rows[0];
  if (!membership) throw httpError(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found or inaccessible.');
  if (!rolePermissions[membership.role]?.has(permission)) {
    throw httpError(403, 'FORBIDDEN', 'Your organization role does not permit this operation.');
  }
  return membership;
};

export const requireTicketAccess = async (userId, ticketId, permission = 'read') => {
  const result = await getPool().query(
    `SELECT t.organization_id, om.role
     FROM tickets t
     JOIN organization_members om
       ON om.organization_id = t.organization_id AND om.user_id = $1
     WHERE t.id = $2`,
    [userId, ticketId]
  );
  const access = result.rows[0];
  if (!access) throw httpError(404, 'TICKET_NOT_FOUND', 'Ticket not found or inaccessible.');
  if (!rolePermissions[access.role]?.has(permission)) {
    throw httpError(403, 'FORBIDDEN', 'Your organization role does not permit this operation.');
  }
  return access;
};

export const isValidId = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;
export const hasPermission = (role, permission) => rolePermissions[role]?.has(permission) === true;
