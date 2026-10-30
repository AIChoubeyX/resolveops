import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export const Navbar = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Workspace member';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Compute breadcrumb title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/tickets/')) return 'Ticket Detail';
    if (path === '/tickets') return 'Ticket Inbox';
    if (path === '/knowledge') return 'Knowledge Base';
    if (path === '/settings') return 'Settings & Preferences';
    return 'ResolveOps';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page context / breadcrumb */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">AI-assisted support & incident response</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Phase 2</span>
        </div>

        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          {user?.photoURL ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-slate-100" /> : <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-slate-100">{initials}</div>}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-none">{displayName}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <button type="button" onClick={logout} className="text-xs text-slate-500 hover:text-rose-600" title="Sign out">Logout</button>
        </div>
      </div>
    </header>
  );
};
