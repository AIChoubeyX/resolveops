import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  getOrganizationMembers,
  getOrganizationSettings,
  inviteOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMember,
  updateOrganizationSettings,
} from '../services/api.js';

const roleOptions = ['admin', 'agent', 'reporter'];

export const SettingsPage = () => {
  const {
    user, organizations, activeOrganizationId, setActiveOrganizationId, refreshProfile,
  } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const membership = useMemo(
    () => organizations.find((item) => String(item.id) === String(activeOrganizationId)),
    [activeOrganizationId, organizations]
  );
  const isAdmin = membership?.role === 'admin';

  const load = async () => {
    if (!activeOrganizationId) return;
    setLoading(true);
    setError('');
    try {
      const [currentOrganization, currentMembers] = await Promise.all([
        getOrganizationSettings(activeOrganizationId, user),
        getOrganizationMembers(activeOrganizationId, user),
      ]);
      setOrganization(currentOrganization);
      setName(currentOrganization.name);
      setMembers(currentMembers);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeOrganizationId, user]);

  const saveName = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const updated = await updateOrganizationSettings(activeOrganizationId, { name }, user);
      setOrganization(updated);
      await refreshProfile();
      setMessage('Workspace name saved.');
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  const invite = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage(''); setInviteLink('');
    try {
      const result = await inviteOrganizationMember(activeOrganizationId, inviteEmail, user);
      setInviteEmail('');
      setInviteLink(`${window.location.origin}${result.invitationUrl}`);
      setMessage('Invitation created. Share this development link with your teammate.');
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  const changeRole = async (memberId, role) => {
    setSaving(true); setError(''); setMessage('');
    try {
      await updateOrganizationMember(activeOrganizationId, memberId, role, user);
      await load(); setMessage('Member role updated.');
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Remove this member from the workspace?')) return;
    setSaving(true); setError(''); setMessage('');
    try {
      await removeOrganizationMember(activeOrganizationId, memberId, user);
      await load(); setMessage('Member removed.');
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'general', name: 'General & Organization' },
    { id: 'team', name: 'Team Members' },
    { id: 'ai', name: 'AI Models & RAG' },
    { id: 'webhooks', name: 'Integrations & Webhooks' },
  ];

  if (loading) return <div className="p-10 text-center text-sm text-slate-500">Loading workspace settings...</div>;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Configuration</h2><p className="text-sm text-slate-500 mt-1">Manage the selected workspace and team access.</p></div>
        <select value={activeOrganizationId} onChange={(event) => setActiveOrganizationId(event.target.value)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg">{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      </div>
      {message && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
      <div className="border-b border-slate-200"><nav className="-mb-px flex space-x-6 overflow-x-auto">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{tab.name}</button>)}</nav></div>

      {activeTab === 'general' && <Card title="Workspace Profile" subtitle="Changes apply to this workspace for every member."><form onSubmit={saveName} className="space-y-4 max-w-xl"><label className="block text-xs font-semibold text-slate-700">Workspace name<input disabled={!isAdmin || saving} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" /></label>{isAdmin ? <Button type="submit" disabled={saving || !name.trim()}>{saving ? 'Saving...' : 'Save workspace'}</Button> : <p className="text-xs text-slate-500">Only workspace admins can update settings.</p>}</form></Card>}

      {activeTab === 'team' && <Card title="Team Members" subtitle="Members and roles in the selected workspace."><div className="space-y-4">{isAdmin && <form onSubmit={invite} className="flex flex-col sm:flex-row gap-2"><input type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@example.com" className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg" /><Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create invite link'}</Button></form>}{inviteLink && <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 break-all"><strong>Development invitation link:</strong> {inviteLink}</div>}<div className="space-y-2">{members.length === 0 && <p className="text-sm text-slate-500">No members found.</p>}{members.map((member) => <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-200"><div><p className="text-sm font-semibold text-slate-900">{member.display_name || 'Unnamed member'}</p><p className="text-xs text-slate-500">{member.email}</p></div><div className="flex items-center gap-2">{isAdmin ? <select disabled={saving} value={member.role} onChange={(event) => changeRole(member.id, event.target.value)} className="px-2 py-1 text-xs border rounded-lg">{roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}</select> : <span className="text-xs px-2 py-1 rounded border">{member.role}</span>}{isAdmin && <Button variant="outline" size="sm" disabled={saving || member.role === 'admin' && members.filter((item) => item.role === 'admin').length === 1} onClick={() => removeMember(member.id)}>Remove</Button>}</div></div>)}</div></div></Card>}

      {activeTab === 'ai' && <Card title="AI Models & RAG" subtitle="Current capability state"><p className="text-sm text-slate-600">AI classification, model configuration, and RAG indexing are not connected in this build. No API keys or simulated operational values are shown.</p><p className="mt-3 text-xs text-slate-500">Status: unavailable until the AI worker and Knowledge Base are implemented.</p></Card>}
      {activeTab === 'webhooks' && <Card title="Integrations & Webhooks" subtitle="Supported integrations"><p className="text-sm text-slate-600">No webhook integrations are currently configured or supported. This screen does not claim any external integration is active.</p></Card>}
    </div>
  );
};
