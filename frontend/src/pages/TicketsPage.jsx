import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createTicket, getTickets } from '../services/api.js';
import { formatDate, getPriorityBadgeStyle, getStatusBadgeStyle } from '../utils/formatters.js';

const emptyForm = { title: '', description: '', priority: 'medium' };

export const TicketsPage = () => {
  const { user, organizations, activeOrganizationId, setActiveOrganizationId } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignment, setAssignment] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedOrganization = organizations.find((item) => String(item.id) === String(activeOrganizationId));
  const loadTickets = async () => {
    if (!activeOrganizationId) return;
    setLoading(true);
    try {
      setError('');
      setTickets(await getTickets(activeOrganizationId, user, {
        search, status, priority,
        assignedToMe: assignment === 'mine' ? 'true' : '',
        unassigned: assignment === 'unassigned' ? 'true' : '',
      }));
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadTickets(); }, [activeOrganizationId, user, search, status, priority, assignment]);

  const visibleTickets = useMemo(() => tickets, [tickets]);
  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return setError('A title is required.');
    setSubmitting(true); setError(''); setMessage('');
    try {
      await createTicket(activeOrganizationId, form, user);
      setForm(emptyForm); setShowCreate(false); setMessage('Ticket created successfully.'); await loadTickets();
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight text-slate-900">Ticket Inbox</h2><p className="text-sm text-slate-500 mt-1">Organization-scoped support and incident tickets.</p></div>
        <div className="flex gap-2">
          <select value={activeOrganizationId} onChange={(event) => setActiveOrganizationId(event.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg">
            {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
          </select>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>+ Create Ticket</Button>
        </div>
      </div>
      {message && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or description..." className="sm:col-span-6 px-3 py-2 text-sm border border-slate-300 rounded-lg" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="sm:col-span-3 px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select>
          <select value={assignment} onChange={(event) => setAssignment(event.target.value)} className="sm:col-span-3 px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">All accessible tickets</option><option value="mine">My assigned tickets</option><option value="unassigned">Unassigned tickets</option></select>
          <select value={priority} onChange={(event) => setPriority(event.target.value)} className="sm:col-span-3 px-3 py-2 text-sm border border-slate-300 rounded-lg"><option value="">All priorities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
        </div>
      </Card>
      <Card className="overflow-hidden">
        {loading ? <div className="p-10 text-center text-sm text-slate-500">Loading tickets...</div> : !selectedOrganization ? <div className="p-10 text-center text-sm text-slate-500">No organization is available.</div> : visibleTickets.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No tickets match the current filters.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50 text-xs uppercase text-slate-500"><th className="p-3">Ticket</th><th className="p-3">Status</th><th className="p-3">Priority</th><th className="p-3">Assignee</th><th className="p-3">Created</th><th className="p-3 text-right">Action</th></tr></thead><tbody className="divide-y">
            {visibleTickets.map((ticket) => <tr key={ticket.id} className="hover:bg-slate-50"><td className="p-3"><Link className="font-semibold hover:text-brand-600" to={`/tickets/${ticket.id}`}>{ticket.title}</Link><p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p></td><td className="p-3"><span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeStyle(ticket.status)}`}>{ticket.status}</span></td><td className="p-3"><span className={`px-2 py-1 rounded-full text-xs border ${getPriorityBadgeStyle(ticket.priority)}`}>{ticket.priority}</span></td><td className="p-3 text-xs">{ticket.assignee?.name || 'Unassigned'}</td><td className="p-3 text-xs text-slate-500">{formatDate(ticket.created_at)}</td><td className="p-3 text-right"><Link to={`/tickets/${ticket.id}`} className="text-xs font-semibold text-brand-600 hover:underline">View details</Link></td></tr>)}
          </tbody></table></div>
        )}
      </Card>
      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={submit} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4"><h3 className="text-lg font-bold">Create ticket</h3><input autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" className="w-full px-3 py-2 border rounded-lg" /><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows="5" className="w-full px-3 py-2 border rounded-lg" /><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create ticket'}</Button></div></form></div>}
    </div>
  );
};
