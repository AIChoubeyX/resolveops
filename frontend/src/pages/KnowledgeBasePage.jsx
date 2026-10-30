import React from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { DemoNotice } from '../components/ui/DemoNotice.jsx';

export const KnowledgeBasePage = () => {
  const categories = [
    {
      title: 'Authentication & SSO',
      articles: 12,
      description: 'SAML 2.0, OAuth2 token renewal, MFA policies, and session timeout troubleshooting.',
    },
    {
      title: 'Payment & Webhooks',
      articles: 8,
      description: 'Stripe retry lifecycles, webhook signature verification, and invoice failure remediation.',
    },
    {
      title: 'Infrastructure & SRE',
      articles: 19,
      description: 'Kubernetes ingress runbooks, Redis cluster failover, and RDS connection pool tuning.',
    },
    {
      title: 'API Platform',
      articles: 15,
      description: 'Rate limits, REST endpoint deprecation timelines, and SDK integration guides.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Knowledge Base</h2>
          <p className="text-sm text-slate-500 mt-1">
            Technical runbooks and documentation referenced by the AI retrieval engine.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          + New Article (Phase 3)
        </Button>
      </div>

      <DemoNotice message="Knowledge Base functionality is in the design phase. Phase 3 will introduce vector search (RAG) and document indexing." />

      {/* Search Input Mockup */}
      <Card className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            disabled
            placeholder="Search documentation and runbooks (semantic RAG search coming in Phase 3)..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
          />
        </div>
      </Card>

      {/* Planned Feature Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">{cat.title}</h3>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {cat.articles} articles (mock)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{cat.description}</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-brand-600 font-medium">Browse Category &rarr;</span>
              <span className="text-slate-400 text-[11px]">Vector indexed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Phase 3 Implementation Roadmap Card */}
      <Card title="Architecture Roadmap: RAG & AI Retrieval Pipeline">
        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            The ResolveOps Knowledge Base is designed to feed ground-truth operational documents directly to our AI models:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">1. Ingestion</span>
              Markdown articles and incident post-mortems chunked with overlap.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">2. Vector Indexing</span>
              Dense embeddings computed by Python AI Worker and stored in pgvector.
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">3. Context Injection</span>
              Top-k relevant chunks injected into the prompt when responding to tickets.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
