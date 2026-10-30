/**
 * API client service for communicating with the ResolveOps backend.
 * Uses native fetch with safe fallbacks and explicit error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (path, options = {}, user = null) => {
  const token = user ? await user.getIdToken() : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Request failed with HTTP ${response.status}`);
  return data.data ?? data;
};

export const syncCurrentUser = (user) => request('/auth/sync', { method: 'POST' }, user);
export const getCurrentUser = (user) => request('/auth/me', {}, user);
export const getOrganizations = (user) => request('/organizations', {}, user);
export const getOrganizationMembers = (organizationId, user) => request(`/organizations/${organizationId}/members`, {}, user);
export const getTickets = (organizationId, user, filters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request(`/organizations/${organizationId}/tickets${params.toString() ? `?${params}` : ''}`, {}, user);
};
export const createTicket = (organizationId, input, user) => request(`/organizations/${organizationId}/tickets`, {
  method: 'POST', body: JSON.stringify(input),
}, user);
export const getTicket = (ticketId, user) => request(`/tickets/${ticketId}`, {}, user);
export const updateTicket = (ticketId, changes, user) => request(`/tickets/${ticketId}`, {
  method: 'PATCH', body: JSON.stringify(changes),
}, user);
export const getTicketComments = (ticketId, user) => request(`/tickets/${ticketId}/comments`, {}, user);
export const addTicketComment = (ticketId, body, user) => request(`/tickets/${ticketId}/comments`, {
  method: 'POST', body: JSON.stringify({ body }),
}, user);
export const getTicketActivity = (ticketId, user) => request(`/tickets/${ticketId}/activity`, {}, user);
export const getOrganizationMetrics = (organizationId, user) => request(`/organizations/${organizationId}/metrics`, {}, user);

export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      connected: true,
      data,
      error: null,
    };
  } catch (err) {
    return {
      connected: false,
      data: null,
      error: err.message || 'Could not connect to backend API',
    };
  }
};
