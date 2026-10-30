/**
 * Demo Dataset for ResolveOps
 * NOTE: All items below are simulated mock records for development and demonstration.
 * No production data or external storage is connected in Phase 1.
 */

export const DEMO_STATS = {
  openTickets: 14,
  urgentIncidents: 3,
  resolvedToday: 28,
  aiJobsQueued: 5,
};

export const DEMO_TICKETS = [
  {
    id: 'RES-1042',
    title: 'Payment webhook returning 504 gateway timeout under peak load',
    description: 'Stripe webhook receiver fails to respond within 5 seconds during checkout spikes, causing retries and duplicate ledger entries.',
    status: 'Open',
    priority: 'Critical',
    category: 'Billing',
    assignee: {
      name: 'Sarah Chen',
      role: 'Staff SRE',
      initials: 'SC',
    },
    createdAt: '2026-10-29T14:30:00Z',
    updatedAt: '2026-10-29T17:15:00Z',
    aiSuggestedAction: 'Inspect RDS connection pool saturation and Redis lock latency.',
    isDemo: true,
  },
  {
    id: 'RES-1041',
    title: 'OAuth2 refresh token revoked unexpectedly after mobile app update',
    description: 'iOS users on version 3.4.1 are forced to re-login every 30 minutes due to missing grant_type validation.',
    status: 'In Progress',
    priority: 'High',
    category: 'Authentication',
    assignee: {
      name: 'Alex Rivera',
      role: 'Backend Eng',
      initials: 'AR',
    },
    createdAt: '2026-10-29T12:15:00Z',
    updatedAt: '2026-10-29T15:40:00Z',
    aiSuggestedAction: 'Match auth header casing in JWT verification middleware.',
    isDemo: true,
  },
  {
    id: 'RES-1040',
    title: 'Rate limiter threshold triggering for verified Enterprise tenants',
    description: 'Enterprise API keys on tier-4 are receiving 429 Too Many Requests when syncing bulk inventory records.',
    status: 'Open',
    priority: 'High',
    category: 'API Platform',
    assignee: {
      name: 'Sarah Chen',
      role: 'Staff SRE',
      initials: 'SC',
    },
    createdAt: '2026-10-29T10:05:00Z',
    updatedAt: '2026-10-29T11:20:00Z',
    aiSuggestedAction: 'Verify tenant tier override in distributed Redis token bucket.',
    isDemo: true,
  },
  {
    id: 'RES-1039',
    title: 'Knowledge Base search latency degradation in us-west region',
    description: 'Elasticsearch query response times spiked from 45ms to 850ms after the index re-shard maintenance window.',
    status: 'In Progress',
    priority: 'Medium',
    category: 'Search / RAG',
    assignee: {
      name: 'Marcus Reed',
      role: 'Infrastructure',
      initials: 'MR',
    },
    createdAt: '2026-10-29T08:45:00Z',
    updatedAt: '2026-10-29T13:10:00Z',
    aiSuggestedAction: 'Check index replica balancing across availability zones.',
    isDemo: true,
  },
  {
    id: 'RES-1038',
    title: 'Customer export CSV containing corrupted UTF-8 special characters',
    description: 'User report downloads from the analytics dashboard display mojibake when customer names contain accented glyphs.',
    status: 'Resolved',
    priority: 'Low',
    category: 'Reporting',
    assignee: {
      name: 'Emily Watson',
      role: 'Frontend Eng',
      initials: 'EW',
    },
    createdAt: '2026-10-28T16:20:00Z',
    updatedAt: '2026-10-29T09:00:00Z',
    aiSuggestedAction: 'Add UTF-8 BOM prefix to generated binary stream.',
    isDemo: true,
  },
  {
    id: 'RES-1037',
    title: 'Automated SSL certificate renewal failed for custom domains',
    description: 'ACME challenge HTTP-01 verification timed out on cloudflare edge proxy for 4 partner endpoints.',
    status: 'Resolved',
    priority: 'Critical',
    category: 'Security',
    assignee: {
      name: 'Marcus Reed',
      role: 'Infrastructure',
      initials: 'MR',
    },
    createdAt: '2026-10-28T11:10:00Z',
    updatedAt: '2026-10-28T14:35:00Z',
    aiSuggestedAction: 'Verify CAA DNS records and Let\'s Encrypt rate limits.',
    isDemo: true,
  },
];

export const DEMO_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'ai-classification',
    message: 'AI classified #RES-1042 as Critical (Infrastructure) with 94% confidence',
    timestamp: '18 minutes ago',
    actor: 'ResolveOps AI Assistant',
  },
  {
    id: 'act-2',
    type: 'assignment',
    message: 'Sarah Chen accepted assignment for ticket #RES-1040',
    timestamp: '45 minutes ago',
    actor: 'Sarah Chen',
  },
  {
    id: 'act-3',
    type: 'ai-retrieval',
    message: 'AI indexed 3 matching knowledge articles for #RES-1041 (OAuth Token Expiry)',
    timestamp: '2 hours ago',
    actor: 'Knowledge Base Indexer',
  },
  {
    id: 'act-4',
    type: 'resolution',
    message: 'Emily Watson resolved ticket #RES-1038 (UTF-8 CSV Export)',
    timestamp: '4 hours ago',
    actor: 'Emily Watson',
  },
  {
    id: 'act-5',
    type: 'status-change',
    message: 'Marcus Reed escalated #RES-1037 from High to Critical',
    timestamp: 'Yesterday',
    actor: 'Marcus Reed',
  },
];
