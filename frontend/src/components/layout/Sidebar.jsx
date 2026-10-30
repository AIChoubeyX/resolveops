import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApiHealth } from '../../hooks/useApiHealth.js';

// SVG Icons to avoid third-party dependencies
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  Tickets: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Knowledge: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logo: () => (
    <svg className="w-6 h-6 text-brand-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
};

export const Sidebar = ({ onCloseMobile }) => {
  const { connected, loading, refresh, data: healthData } = useApiHealth();

  const navItems = [
    { name: 'Dashboard', to: '/', icon: Icons.Dashboard },
    { name: 'Ticket Inbox', to: '/tickets', icon: Icons.Tickets },
    { name: 'Knowledge Base', to: '/knowledge', icon: Icons.Knowledge },
    { name: 'Settings', to: '/settings', icon: Icons.Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 justify-between">
        <div className="flex items-center gap-2.5">
          <Icons.Logo />
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">ResolveOps</span>
            <span className="ml-1.5 text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
              v0.1
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Backend API Status & Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Express API</span>
          <button
            onClick={refresh}
            title="Click to re-check API health"
            className="flex items-center gap-1.5 hover:underline focus:outline-none"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                loading ? 'bg-amber-400 animate-pulse' : connected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className={connected ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
              {loading ? 'Checking...' : connected ? 'Connected' : 'Offline'}
            </span>
          </button>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-slate-500 font-medium">PostgreSQL</span>
          <span className={`font-medium ${loading ? 'text-amber-600' : healthData?.database?.connected ? 'text-emerald-700' : 'text-rose-600'}`}>
            {loading ? 'Checking...' : healthData?.database?.connected ? 'Connected' : 'Unavailable'}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Target: <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[10px]">localhost:5000</code>
        </p>
      </div>
    </aside>
  );
};
