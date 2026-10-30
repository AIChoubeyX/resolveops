import { getDatabaseUser } from '../services/auth.service.js';
import { getPool } from '../config/database.js';
import {
  hasPermission,
  isValidId,
  requireDatabaseUser,
  requireOrganizationMembership,
  requireTicketAccess,
} from '../services/authorization.service.js';
import {
  addComment,
  createTicket,
  getMetrics,
  getTicket,
  listActivity,
  listComments,
  listOrganizationMembers,
  listOrganizations,
  listTickets,
  updateTicket,
} from '../services/ticket.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const statuses = new Set(['open', 'in_progress', 'resolved']);
const priorities = new Set(['low', 'medium', 'high', 'critical']);

const invalid = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = 'INVALID_INPUT';
  return error;
};

const getUser = (req) => requireDatabaseUser(req.user.firebaseUid);

const parseId = (value, label) => {
  if (!isValidId(value)) throw invalid(`${label} must be a positive integer.`);
  return value;
};

export const getOrganizations = async (req, res, next) => {
  try {
    const user = await getUser(req);
    return sendSuccess(res, await listOrganizations(user.id));
  } catch (error) { return next(error); }
};

export const getOrganizationMembers = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await getUser(req);
    await requireOrganizationMembership(user.id, organizationId);
    return sendSuccess(res, await listOrganizationMembers(organizationId));
  } catch (error) { return next(error); }
};

export const getOrganizationTickets = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await getUser(req);
    await requireOrganizationMembership(user.id, organizationId);
    const { status, priority, search } = req.query;
    if (status && !statuses.has(status)) throw invalid('Invalid status filter.');
    if (priority && !priorities.has(priority)) throw invalid('Invalid priority filter.');
    return sendSuccess(res, await listTickets(organizationId, { status, priority, search }));
  } catch (error) { return next(error); }
};

export const postOrganizationTicket = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await getUser(req);
    await requireOrganizationMembership(user.id, organizationId, 'create');
    const { title, description, priority } = req.body || {};
    if (!title?.trim() || title.trim().length > 500) throw invalid('A title between 1 and 500 characters is required.');
    if (priority && !priorities.has(priority)) throw invalid('Invalid priority.');
    const ticket = await createTicket(organizationId, user.id, { title, description, priority });
    return sendSuccess(res, ticket, 201);
  } catch (error) { return next(error); }
};

export const getOneTicket = async (req, res, next) => {
  try {
    const ticketId = parseId(req.params.ticketId, 'ticketId');
    const user = await getUser(req);
    await requireTicketAccess(user.id, ticketId);
    return sendSuccess(res, await getTicket(ticketId));
  } catch (error) { return next(error); }
};

export const patchTicket = async (req, res, next) => {
  try {
    const ticketId = parseId(req.params.ticketId, 'ticketId');
    const user = await getUser(req);
    const access = await requireTicketAccess(user.id, ticketId, 'update');
    const { status, priority, assigneeId, resolutionNotes } = req.body || {};
    if (status !== undefined && !statuses.has(status)) throw invalid('Invalid status.');
    if (priority !== undefined && !priorities.has(priority)) throw invalid('Invalid priority.');
    if (resolutionNotes !== undefined && (typeof resolutionNotes !== 'string' || resolutionNotes.length > 10000)) {
      throw invalid('Resolution notes must be 10,000 characters or fewer.');
    }
    if (resolutionNotes !== undefined && status !== 'resolved') {
      throw invalid('Resolution notes can only be changed while resolving a ticket.');
    }
    if (assigneeId !== undefined && assigneeId !== null) {
      parseId(assigneeId, 'assigneeId');
      const assignee = await getDatabaseUserByOrganization(access.organization_id, assigneeId);
      if (!assignee) throw invalid('Assignee must be a member of the ticket organization.');
    }
    if (assigneeId !== undefined && !hasPermission(access.role, 'assign')) {
      const error = new Error('Your organization role does not permit assignment changes.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }
    return sendSuccess(res, await updateTicket(ticketId, user.id, { status, priority, assigneeId, resolutionNotes }));
  } catch (error) { return next(error); }
};

const getDatabaseUserByOrganization = async (organizationId, userId) => {
  const result = await getPool().query(
    `SELECT u.id FROM users u
     JOIN organization_members om ON om.user_id = u.id
     WHERE om.organization_id = $1 AND u.id = $2`,
    [organizationId, userId]
  );
  return result.rows[0] || null;
};

export const postComment = async (req, res, next) => {
  try {
    const ticketId = parseId(req.params.ticketId, 'ticketId');
    const user = await getUser(req);
    await requireTicketAccess(user.id, ticketId, 'comment');
    const body = req.body?.body;
    if (!body?.trim() || body.trim().length > 5000) throw invalid('A comment between 1 and 5000 characters is required.');
    return sendSuccess(res, await addComment(ticketId, user.id, body), 201);
  } catch (error) { return next(error); }
};

export const getComments = async (req, res, next) => {
  try {
    const ticketId = parseId(req.params.ticketId, 'ticketId');
    const user = await getUser(req);
    await requireTicketAccess(user.id, ticketId);
    return sendSuccess(res, await listComments(ticketId));
  } catch (error) { return next(error); }
};

export const getActivity = async (req, res, next) => {
  try {
    const ticketId = parseId(req.params.ticketId, 'ticketId');
    const user = await getUser(req);
    await requireTicketAccess(user.id, ticketId);
    return sendSuccess(res, await listActivity(ticketId));
  } catch (error) { return next(error); }
};

export const getOrganizationMetrics = async (req, res, next) => {
  try {
    const organizationId = parseId(req.params.organizationId, 'organizationId');
    const user = await getUser(req);
    await requireOrganizationMembership(user.id, organizationId);
    return sendSuccess(res, await getMetrics(organizationId));
  } catch (error) { return next(error); }
};
