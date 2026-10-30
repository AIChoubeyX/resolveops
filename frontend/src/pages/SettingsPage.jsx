import React, { useState } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { DemoNotice } from '../components/ui/DemoNotice.jsx';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General & Organization' },
    { id: 'team', name: 'Team Members' },
    { id: 'ai', name: 'AI Models & RAG' },
    { id: 'webhooks', name: 'Integrations & Webhooks' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage system preferences, team access, and AI automation rules.
        </p>
      </div>

      <DemoNotice message="Settings configurations are simulated placeholders. Database persistence and tenant configuration will be implemented in Phase 4." />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === 'general' && (
        <Card title="Workspace Profile" subtitle="General metadata and time zone configuration">
          <div className="space-y-4 max-w-xl text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                disabled
                defaultValue="Acme Cloud Engineering"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Incident SLA (Hours)</label>
              <input
                type="number"
                disabled
                defaultValue={4}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" disabled>
                Save Changes (Phase 4)
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'team' && (
        <Card title="Team Members" subtitle="Engineers and support agents with portal access">
          <div className="space-y-3">
            {[
              { name: 'Ashutosh S.', email: 'ashutosh@example.com', role: 'Support Lead (Admin)' },
              { name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'Staff SRE' },
              { name: 'Alex Rivera', email: 'alex.rivera@example.com', role: 'Backend Engineer' },
              { name: 'Marcus Reed', email: 'marcus.reed@example.com', role: 'Infrastructure' },
            ].map((member) => (
              <div key={member.email} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'ai' && (
        <Card title="AI Intelligence Tuning" subtitle="Configure automated classification and draft generation parameters">
          <div className="space-y-4 max-w-xl text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classification Model</label>
              <select disabled className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed">
                <option>Fast Classifier (Gemini 1.5 Flash)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Confidence Threshold for Auto-Tagging</label>
              <input
                type="text"
                disabled
                defaultValue="85%"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400">
              AI Worker pipelines will be connected to the background queue in Phase 3.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'webhooks' && (
        <Card title="Incoming & Outgoing Integrations" subtitle="Connect external alerting systems">
          <div className="space-y-3">
            {[
              { name: 'Slack Incident Alerts', desc: 'Post critical incident updates to #incident-room' },
              { name: 'GitHub Issues Sync', desc: 'Link escalated support tickets to engineering repositories' },
              { name: 'PagerDuty On-Call', desc: 'Trigger on-call escalation schedules on severity P1' },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-white">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{integration.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{integration.desc}</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-xs">
                  Connect (Phase 4)
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
