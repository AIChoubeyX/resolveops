import { getPool } from '../config/database.js';

const ticketSelect = `
  SELECT t.id, t.organization_id, t.reporter_id, t.assignee_id, t.title, t.description,
         t.status, t.priority, t.created_at, t.updated_at, t.resolved_at, t.resolution_notes,
         json_build_object('id', organization.id, 'name', organization.name) AS organization,
         json_build_object('id', reporter.id, 'name', reporter.display_name, 'email', reporter.email) AS reporter,
         CASE WHEN assignee.id IS NULL THEN NULL
              ELSE json_build_object('id', assignee.id, 'name', assignee.display_name, 'email', assignee.email)
         END AS assignee
  FROM tickets t
  JOIN users reporter ON reporter.id = t.reporter_id
  LEFT JOIN users assignee ON assignee.id = t.assignee_id
  LEFT JOIN organizations organization ON organization.id = t.organization_id`;

const addActivity = async (client, ticketId, actorId, eventType, metadata = {}) => {
  await client.query(
    `INSERT INTO ticket_activity (ticket_id, actor_id, event_type, metadata)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [ticketId, actorId, eventType, JSON.stringify(metadata)]
  );
};

export const listOrganizations = async (userId) => {
  const result = await getPool().query(
    `SELECT o.id, o.name, om.role
     FROM organization_members om JOIN organizations o ON o.id = om.organization_id
     WHERE om.user_id = $1 ORDER BY o.created_at ASC`,
    [userId]
  );
  return result.rows;
};

export const listTickets = async (organizationId, filters = {}) => {
  const values = [organizationId];
  const conditions = ['t.organization_id = $1'];
  if (filters.status) { values.push(filters.status); conditions.push(`t.status = $${values.length}`); }
  if (filters.priority) { values.push(filters.priority); conditions.push(`t.priority = $${values.length}`); }
  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(t.title ILIKE $${values.length} OR t.description ILIKE $${values.length})`);
  }
  const result = await getPool().query(
    `${ticketSelect} WHERE ${conditions.join(' AND ')} ORDER BY t.created_at DESC`,
    values
  );
  return result.rows;
};

export const getTicket = async (ticketId) => {
  const result = await getPool().query(`${ticketSelect} WHERE t.id = $1`, [ticketId]);
  return result.rows[0] || null;
};

export const createTicket = async (organizationId, reporterId, input) => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO tickets (organization_id, reporter_id, title, description, status, priority)
       VALUES ($1, $2, $3, $4, 'open', $5)
       RETURNING id`,
      [organizationId, reporterId, input.title.trim(), input.description?.trim() || '', input.priority || 'medium']
    );
    const ticketId = result.rows[0].id;
    await addActivity(client, ticketId, reporterId, 'created', { title: input.title.trim() });
    await client.query('COMMIT');
    return getTicket(ticketId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

export const updateTicket = async (ticketId, actorId, changes) => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const currentResult = await client.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [ticketId]);
    const current = currentResult.rows[0];
    if (!current) return null;
    const nextStatus = changes.status ?? current.status;
    const nextPriority = changes.priority ?? current.priority;
    const nextAssignee = changes.assigneeId === undefined ? current.assignee_id : changes.assigneeId;
    const resolvedAt = nextStatus === 'resolved' && current.status !== 'resolved'
      ? new Date().toISOString()
      : nextStatus !== 'resolved' ? null : current.resolved_at;
    const resolutionNotes = nextStatus !== 'resolved'
      ? null
      : changes.resolutionNotes === undefined
        ? current.resolution_notes
        : changes.resolutionNotes?.trim() || null;
    const result = await client.query(
      `UPDATE tickets
       SET status = $1, priority = $2, assignee_id = $3, resolved_at = $4,
           resolution_notes = $5, updated_at = NOW()
       WHERE id = $6 RETURNING id`,
      [nextStatus, nextPriority, nextAssignee, resolvedAt, resolutionNotes, ticketId]
    );
    if (changes.assigneeId !== undefined && changes.assigneeId !== current.assignee_id) {
      await addActivity(client, ticketId, actorId, 'assignment_changed', { assigneeId: changes.assigneeId });
    }
    if (changes.status && changes.status !== current.status) {
      await addActivity(client, ticketId, actorId, changes.status === 'resolved' ? 'resolved' : 'status_changed', { from: current.status, to: changes.status });
    }
    if (changes.resolutionNotes !== undefined && resolutionNotes !== current.resolution_notes) {
      await addActivity(client, ticketId, actorId, 'resolution_notes_changed', { hasNotes: Boolean(resolutionNotes) });
    }
    if (changes.priority && changes.priority !== current.priority) {
      await addActivity(client, ticketId, actorId, 'priority_changed', { from: current.priority, to: changes.priority });
    }
    await client.query('COMMIT');
    return result.rows[0] ? getTicket(ticketId) : null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

export const listOrganizationMembers = async (organizationId) => {
  const result = await getPool().query(
    `SELECT u.id, u.display_name, u.email, om.role
     FROM organization_members om JOIN users u ON u.id = om.user_id
     WHERE om.organization_id = $1 ORDER BY u.display_name NULLS LAST, u.email`,
    [organizationId]
  );
  return result.rows;
};

export const listComments = async (ticketId) => {
  const result = await getPool().query(
    `SELECT c.id, c.ticket_id, c.body, c.created_at,
            json_build_object('id', u.id, 'name', u.display_name, 'email', u.email) AS author
     FROM ticket_comments c JOIN users u ON u.id = c.author_id
     WHERE c.ticket_id = $1 ORDER BY c.created_at ASC`,
    [ticketId]
  );
  return result.rows;
};

export const addComment = async (ticketId, authorId, body) => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const comment = await client.query(
      `INSERT INTO ticket_comments (ticket_id, author_id, body) VALUES ($1, $2, $3)
       RETURNING id, ticket_id, body, created_at`,
      [ticketId, authorId, body.trim()]
    );
    await addActivity(client, ticketId, authorId, 'commented', { commentId: comment.rows[0].id });
    await client.query('COMMIT');
    return { ...comment.rows[0], author: { id: authorId } };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

export const listActivity = async (ticketId) => {
  const result = await getPool().query(
    `SELECT a.id, a.ticket_id, a.event_type, a.metadata, a.created_at,
            json_build_object('id', u.id, 'name', u.display_name, 'email', u.email) AS actor
     FROM ticket_activity a JOIN users u ON u.id = a.actor_id
     WHERE a.ticket_id = $1 ORDER BY a.created_at ASC`,
    [ticketId]
  );
  return result.rows;
};

export const getMetrics = async (organizationId) => {
  const result = await getPool().query(
    `SELECT
       COUNT(*) FILTER (WHERE status <> 'resolved')::int AS open_tickets,
       COUNT(*) FILTER (WHERE status <> 'resolved' AND priority = 'critical')::int AS critical_open_tickets,
       COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at >= CURRENT_DATE)::int AS resolved_today,
       COUNT(*) FILTER (WHERE status = 'open')::int AS open,
       COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
       COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
     FROM tickets WHERE organization_id = $1`,
    [organizationId]
  );
  const recentTickets = await listTickets(organizationId);
  const activity = await getPool().query(
    `SELECT a.id, a.ticket_id, a.event_type, a.metadata, a.created_at,
            json_build_object('id', u.id, 'name', u.display_name, 'email', u.email) AS actor
     FROM ticket_activity a JOIN tickets t ON t.id = a.ticket_id
     JOIN users u ON u.id = a.actor_id
     WHERE t.organization_id = $1 ORDER BY a.created_at DESC LIMIT 10`,
    [organizationId]
  );
  return { ...result.rows[0], recentTickets: recentTickets.slice(0, 5), recentActivity: activity.rows };
};
