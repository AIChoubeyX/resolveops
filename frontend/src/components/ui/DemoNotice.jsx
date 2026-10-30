import React from 'react';

/**
 * Notice banner explicitly informing users that displayed items are simulated demo data.
 */
export const DemoNotice = ({
  message = 'Initial Foundation Prototype: All metrics, tickets, and AI telemetry displayed are simulated demonstration data.',
}) => {
  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-amber-950 uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300">
          Demo Mode
        </span>
        <span className="text-amber-800">{message}</span>
      </div>
      <span className="hidden sm:inline-block text-[11px] text-amber-700 whitespace-nowrap">
        Phase 1 Foundation
      </span>
    </div>
  );
};
