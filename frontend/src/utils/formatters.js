/**
 * Text and badge formatting utilities.
 */

export const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'in progress':
    case 'in_progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'closed':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getPriorityBadgeStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};
