import React from 'react';

export const AuthLayout = ({ children }) => (
  <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-8">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-white">
          <span className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold">R</span>
          <span className="text-2xl font-bold tracking-tight">ResolveOps</span>
        </div>
        <p className="text-sm text-slate-400 mt-3">AI-assisted support and incident response</p>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">{children}</div>
    </div>
  </main>
);
