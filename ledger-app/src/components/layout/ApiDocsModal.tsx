'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Code2, ArrowRight } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/accounts',
    desc: 'List accounts with pagination metadata (page, limit, total_records, total_pages).',
    query: '?page=1&limit=10',
    response: '200 OK — { data: [...], pagination: { ... } }',
  },
  {
    method: 'POST',
    path: '/api/accounts',
    desc: 'Create a new ledger account initialized with ₹0.00 balance.',
    body: '{ "name": "Alice Johnson" }',
    response: '201 Created — { data: { id, name, balance: 0, ... } }',
  },
  {
    method: 'GET',
    path: '/api/accounts/:id',
    desc: 'Fetch account profile and real-time ledger balance.',
    response: '200 OK / 404 Not Found',
  },
  {
    method: 'POST',
    path: '/api/accounts/:id/transactions',
    desc: 'Post an atomic credit or debit with database-level idempotency.',
    body: '{\n  "type": "credit|debit",\n  "amount": 100.00,\n  "description": "Salary",\n  "reference_id": "REF-001"\n}',
    response: '201 Created / 200 OK (duplicate replay) / 422 Unprocessable',
  },
  {
    method: 'GET',
    path: '/api/accounts/:id/transactions',
    desc: 'Retrieve paginated transaction history, sortable by created_at DESC with type filtering.',
    query: '?type=credit|debit&page=1&limit=10',
    response: '200 OK — { data: [...], pagination: { ... } }',
  },
  {
    method: 'POST',
    path: '/api/transfers',
    desc: 'Atomic double-entry fund transfer between accounts with deadlock avoidance.',
    body: '{\n  "from_account_id": "uuid",\n  "to_account_id": "uuid",\n  "amount": 50.00,\n  "description": "Split",\n  "reference_id": "XFER-001"\n}',
    response: '201 Created / 422 Insufficient Balance / 200 Replay',
  },
];

export function ApiDocsModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/30 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-zinc-900 dark:text-white text-lg font-bold">API Reference</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                Production REST API endpoints conforming strictly to the PRD specification.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {ENDPOINTS.map(ep => (
            <div
              key={ep.method + ep.path}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 space-y-2"
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge
                  className={`text-[11px] font-bold px-2 py-0.5 ${
                    ep.method === 'POST'
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-200 dark:bg-zinc-700'
                  }`}
                >
                  {ep.method}
                </Badge>
                <code className="text-zinc-900 dark:text-white text-xs font-mono font-bold">
                  {ep.path}
                </code>
                {ep.query && (
                  <span className="text-zinc-400 dark:text-zinc-500 text-xs font-mono">
                    {ep.query}
                  </span>
                )}
              </div>

              <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed">
                {ep.desc}
              </p>

              {ep.body && (
                <pre className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono text-[11px] overflow-x-auto">
                  {ep.body}
                </pre>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <ArrowRight className="w-3 h-3 text-red-500" />
                <span>{ep.response}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
