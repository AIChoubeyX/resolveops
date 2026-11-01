import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  addTicketEntry,
  getOrganizationMembers,
  getTicket,
  getTicketActivity,
  getTicketComments,
  updateTicket,
} from '../services/api.js';
import { formatDate, getPriorityBadgeStyle, getStatusBadgeStyle } from '../utils/formatters.js';

const transitions = {
  open: ['in_progress'],
  in_progress: ['pending', 'resolved'],
  pending: ['in_progress'],
  resolved: ['in_progress', 'closed'],
  closed: [],
};

export const TicketDetailPage = () => {
  const { ticketId } = useParams();
  const { user, organizations } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [entry, setEntry] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const membership = useMemo(
    () => organizations.find((item) => String(item.id) === String(ticket?.organization_id)),
    [organizations, ticket],
  );
  const canWriteInternal = ['admin', 'agent'].includes(membership?.role);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const current = await getTicket(ticketId, user);
      setTicket(current);
      setResolutionNotes(current.resolution_notes || '');
      const [ticketComments, ticketActivity, organizationMembers] = await Promise.all([
        getTicketComments(ticketId, user),
        getTicketActivity(ticketId, user),
        getOrganizationMembers(current.organization_id, user),
      ]);
      setComments(ticketComments);
      setActivity(ticketActivity);
      setMembers(organizationMembers);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ticketId, user]);

  const save = async (changes) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateTicket(ticketId, changes, user);
      setMessage('Ticket updated.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const submitEntry = async (event) => {
    event.preventDefault();
    if (!entry.trim()) return;
    setSaving(true);
    setError('');
    try {
      await addTicketEntry(ticketId, entry, visibility, user);
      setEntry('');
      setMessage(visibility === 'internal' ? 'Internal note added.' : 'Public reply added.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-sm text-slate-500">Loading ticket...</div>;
  if (error && !ticket) return <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{error}</div>;
  if (!ticket) return <div className="p-10 text-center">Ticket not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/tickets" className="text-sm text-brand-600 hover:underline">&larr; Back to Ticket Inbox</Link>
      {message && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-5">
          <div className="min-w-0">
            <div className="flex gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeStyle(ticket.status)}`}>{ticket.status}</span>
              <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityBadgeStyle(ticket.priority)}`}>{ticket.priority}</span>
            </div>
            <p className="text-xs text-slate-500">Ticket #{ticket.id} · Workspace: {ticket.organization?.name || ticket.organization_id}</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{ticket.title}</h2>
            <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">{ticket.description || 'No description provided.'}</p>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
              <div><dt className="font-semibold text-slate-700">Reporter</dt><dd>{ticket.reporter?.name || ticket.reporter?.email || 'Unknown'}</dd></div>
              <div><dt className="font-semibold text-slate-700">Assignee</dt><dd>{ticket.assignee?.name || ticket.assignee?.email || 'Unassigned'}</dd></div>
              <div><dt className="font-semibold text-slate-700">Created</dt><dd>{formatDate(ticket.created_at)}</dd></div>
              <div><dt className="font-semibold text-slate-700">Last updated</dt><dd>{formatDate(ticket.updated_at)}</dd></div>
            </dl>
            {ticket.resolved_at && <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800"><strong>Resolution notes</strong><p className="mt-1 whitespace-pre-wrap">{ticket.resolution_notes || 'Resolved without additional notes.'}</p><p className="mt-1 text-xs">{formatDate(ticket.resolved_at)}</p></div>}
          </div>
          <div className="flex flex-col gap-2 min-w-48">
            <label className="text-xs font-semibold text-slate-600">Status
              <select disabled={saving} value={ticket.status} onChange={(event) => save({ status: event.target.value, ...(event.target.value === 'resolved' ? { resolutionNotes } : {}) })} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
                <option value={ticket.status}>{ticket.status}</option>
                {transitions[ticket.status].map((next) => <option key={next} value={next}>{next}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Priority
              <select disabled={saving} value={ticket.priority} onChange={(event) => save({ priority: event.target.value })} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
                {['low', 'medium', 'high', 'critical'].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Assignee
              <select disabled={saving} value={ticket.assignee_id || ''} onChange={(event) => save({ assigneeId: event.target.value || null })} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Unassigned</option>
                {members.filter((member) => ['admin', 'agent'].includes(member.role)).map((member) => <option key={member.id} value={member.id}>{member.display_name || member.email}</option>)}
              </select>
            </label>
            {ticket.status === 'in_progress' && <label className="text-xs font-semibold text-slate-600">Resolution notes
              <textarea disabled={saving} value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} placeholder="Summarize the fix before resolving" rows="4" className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" />
            </label>}
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Conversation">
          <div className="space-y-3">
            {comments.length === 0 && <p className="text-sm text-slate-500">No conversation entries yet.</p>}
            {comments.map((item) => <div key={item.id} className={`border-b pb-3 ${item.visibility === 'internal' ? 'bg-amber-50 rounded p-2' : ''}`}><p className="text-xs font-semibold text-slate-600">{item.visibility === 'internal' ? 'Internal note' : 'Public reply'}</p><p className="text-sm text-slate-800 whitespace-pre-wrap">{item.body}</p><p className="text-xs text-slate-500 mt-1">{item.author?.name || item.author?.email} · {formatDate(item.created_at)}</p></div>)}
          </div>
          <form onSubmit={submitEntry} className="mt-4 space-y-2">
            {canWriteInternal && <select value={visibility} onChange={(event) => setVisibility(event.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="public">Public reply</option><option value="internal">Internal note</option></select>}
            <textarea value={entry} onChange={(event) => setEntry(event.target.value)} placeholder={visibility === 'internal' ? 'Add an internal note...' : 'Reply to the ticket...'} rows="3" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <Button type="submit" disabled={saving || !entry.trim()}>{saving ? 'Saving...' : visibility === 'internal' ? 'Add internal note' : 'Send reply'}</Button>
          </form>
        </Card>
        <Card title="Activity history">
          <div className="space-y-3">{activity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}{activity.map((item) => <div key={item.id} className="text-sm border-b pb-2"><p className="font-medium">{item.event_type.replaceAll('_', ' ')}</p><p className="text-xs text-slate-500">{item.actor?.name || item.actor?.email} · {formatDate(item.created_at)}</p></div>)}</div>
        </Card>
      </div>
    </div>
  );
};
