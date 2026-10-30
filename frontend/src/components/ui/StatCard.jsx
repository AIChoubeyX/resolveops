import React from 'react';

/**
 * Metric Summary Card with clean typography and explicit demo tagging.
 */
export const StatCard = ({ title, value, changeText, changeType = 'neutral', icon: Icon }) => {
  const changeColors = {
    positive: 'text-emerald-700 bg-emerald-50',
    negative: 'text-rose-700 bg-rose-50',
    neutral: 'text-slate-600 bg-slate-100',
    warning: 'text-amber-700 bg-amber-50',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
          Demo Data
        </span>
      </div>

      {changeText && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`px-1.5 py-0.5 rounded font-medium ${changeColors[changeType] || changeColors.neutral}`}>
            {changeText}
          </span>
          <span className="text-slate-400">vs yesterday</span>
        </div>
      )}
    </div>
  );
};
