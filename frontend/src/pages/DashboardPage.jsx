import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getOrganizationMetrics } from '../services/api.js';
import { formatDate, getPriorityBadgeStyle, getStatusBadgeStyle } from '../utils/formatters.js';

export const DashboardPage = () => {
  const { user, organizations, activeOrganizationId, setActiveOrganizationId } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!activeOrganizationId) return;
    getOrganizationMetrics(activeOrganizationId, user).then(setMetrics).catch((requestError) => setError(requestError.message));
  }, [activeOrganizationId, user]);
  const select = <select value={activeOrganizationId} onChange={(event) => setActiveOrganizationId(event.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg">{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select>;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h2 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Dashboard</h2><p className="text-sm text-slate-500 mt-1">Live ticket metrics for the selected organization.</p></div>{select}</div>
      {error && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
      {!metrics ? <div className="p-10 text-center text-sm text-slate-500">Loading organization metrics...</div> : <><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"><StatCard title="Open Tickets" value={metrics.open_tickets} changeText="Current workspace" changeType="warning" /><StatCard title="In Progress" value={metrics.in_progress} changeText="Being worked" changeType="warning" /><StatCard title="Unassigned" value={metrics.unassigned_tickets} changeText="Needs an owner" changeType="negative" /><StatCard title="Critical Open" value={metrics.critical_open_tickets} changeText="Needs attention" changeType="negative" /><StatCard title="Resolved Today" value={metrics.resolved_today} changeText="Current workspace" changeType="positive" /></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><Card title="Recent Tickets" action={<Link to="/tickets" className="text-xs text-brand-600">Inbox &rarr;</Link>} className="lg:col-span-2"><div className="space-y-3">{metrics.recentTickets.length === 0 && <p className="text-sm text-slate-500">No tickets yet.</p>}{metrics.recentTickets.map((ticket) => <div key={ticket.id} className="flex items-center justify-between gap-3 border-b pb-3"><div className="min-w-0"><Link to={`/tickets/${ticket.id}`} className="font-semibold text-sm hover:text-brand-600">{ticket.title}</Link><p className="text-xs text-slate-500">{formatDate(ticket.created_at)}</p></div><div className="flex gap-2"><span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeStyle(ticket.status)}`}>{ticket.status}</span><span className={`px-2 py-1 rounded-full text-xs border ${getPriorityBadgeStyle(ticket.priority)}`}>{ticket.priority}</span></div></div>)}</div></Card><Card title="Recent Activity" subtitle="Recorded ticket events"><div className="space-y-3">{metrics.recentActivity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}{metrics.recentActivity.map((item) => <div key={item.id} className="text-xs border-b pb-2"><p className="font-medium text-slate-800">{item.event_type.replaceAll('_', ' ')}</p><p className="text-slate-500">{item.actor?.name || item.actor?.email} · {formatDate(item.created_at)}</p></div>)}</div></Card></div></>}
    </div>
  );
};
