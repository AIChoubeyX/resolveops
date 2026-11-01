import { getDatabaseUser, getUserProfile } from '../services/auth.service.js';
import {
  isValidId,
  requireDatabaseUser,
  requireOrganizationMembership,
} from '../services/authorization.service.js';
import {
  acceptInvitation,
  changeMemberRole,
  createInvitation,
  getOrganization,
  listMembers,
  removeMember,
  renameOrganization,
} from '../services/organization.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const roles = new Set(['admin', 'agent', 'reporter']);

const invalid = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = 'INVALID_INPUT';
  return error;
};

const parseId = (value, label) => {
  if (!isValidId(value)) throw invalid(`${label} must be a positive integer.`);
  return value;
};

const currentUser = (req) => requireDatabaseUser(req.user.firebaseUid);

export const getOrganizationSettings = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await currentUser(req);
    await requireOrganizationMembership(user.id, organizationId);
    return sendSuccess(res, await getOrganization(organizationId));
  } catch (error) { return next(error); }
};

export const updateOrganizationSettings = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await currentUser(req);
    await requireOrganizationMembership(user.id, organizationId, 'manage_settings');
    const name = req.body?.name;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
      throw invalid('Workspace name must be between 1 and 120 characters.');
    }
    return sendSuccess(res, await renameOrganization(organizationId, name));
  } catch (error) { return next(error); }
};

export const getMembers = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await currentUser(req);
    await requireOrganizationMembership(user.id, organizationId);
    return sendSuccess(res, await listMembers(organizationId));
  } catch (error) { return next(error); }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const memberId = parseId(req.params.userId, 'userId');
    const user = await currentUser(req);
    await requireOrganizationMembership(user.id, organizationId, 'manage_members');
    if (!roles.has(req.body?.role)) throw invalid('Role must be admin, agent, or reporter.');
    return sendSuccess(res, await changeMemberRole(organizationId, memberId, req.body.role));
  } catch (error) { return next(error); }
};

export const deleteMember = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const memberId = parseId(req.params.userId, 'userId');
    const user = await currentUser(req);
    await requireOrganizationMembership(user.id, organizationId, 'manage_members');
    await removeMember(organizationId, memberId);
    return sendSuccess(res, { removed: true });
  } catch (error) { return next(error); }
};

export const postInvitation = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await currentUser(req);
    await requireOrganizationMembership(user.id, organizationId, 'manage_members');
    const email = req.body?.email;
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw invalid('A valid teammate email is required.');
    }
    const invite = await createInvitation(organizationId, user.id, email);
    return sendSuccess(res, {
      ...invite,
      invitationUrl: `/invite/${invite.token}`,
      delivery: 'development_link',
    }, 201);
  } catch (error) { return next(error); }
};

export const acceptOrganizationInvitation = async (req, res, next) => {
  try {
    const user = await currentUser(req);
    const identity = await getDatabaseUser(req.user.firebaseUid);
    const organization = await acceptInvitation(req.params.token, user.id, identity.email || '');
    const profile = await getUserProfile(req.user.firebaseUid);
    return sendSuccess(res, { organization, profile });
  } catch (error) { return next(error); }
};
