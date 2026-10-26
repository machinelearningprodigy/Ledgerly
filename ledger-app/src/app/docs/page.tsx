'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Database, ShieldCheck,
  Code2, Copy, Check, Play, RefreshCw,
  ExternalLink, Layers, Terminal, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sidebar } from '@/components/layout/Sidebar';
import { toast } from 'sonner';

type ActiveSection = 'overview' | 'concurrency' | 'schema' | 'api' | 'errors' | 'sandbox';

interface EndpointDoc {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  queryParams?: { name: string; type: string; required: boolean; desc: string; default?: string }[];
  pathParams?: { name: string; type: string; desc: string }[];
  requestBody?: string;
  successStatus: number;
  successResponse: string;
  errorStatuses: { status: number; code: string; desc: string }[];
  curlExample: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'create-account',
    method: 'POST',
    path: '/api/accounts',
    title: 'Create Account',
    description: 'Initializes a new ledger account. Balance is strictly set to ₹0.00 by the system upon creation.',
    requestBody: JSON.stringify({ name: 'Alice Johnson' }, null, 2),
    successStatus: 201,
    successResponse: JSON.stringify({
      data: {
        id: "8f7e21a0-3b4c-4e8a-9f12-0987654321ab",
        name: "Alice Johnson",
        balance: 0.00,
        created_at: "2026-10-26T15:00:00.000Z"
      }
    }, null, 2),
    errorStatuses: [
      { status: 400, code: 'VALIDATION_ERROR', desc: 'Missing or empty name field' },
    ],
    curlExample: `curl -X POST https://ledgerly-flow.vercel.app/api/accounts \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice Johnson"}'`,
  },
  {
    id: 'list-accounts',
    method: 'GET',
    path: '/api/accounts',
    title: 'List Accounts (Paginated)',
    description: 'Retrieves a paginated list of all enrolled accounts sorted latest first (created_at DESC).',
    queryParams: [
      { name: 'page', type: 'integer', required: false, desc: 'Current page number', default: '1' },
      { name: 'limit', type: 'integer', required: false, desc: 'Records per page (1 to 100)', default: '10' },
    ],
    successStatus: 200,
    successResponse: JSON.stringify({
      data: [
        {
          id: "bbba5705-f16f-4b0c-92ad-3cba12cb09ba",
          name: "Rohan Gupta",
          balance: 7351.00,
          created_at: "2026-10-26T14:38:50.000Z"
        }
      ],
      pagination: {
        page: 1,
        current_page: 1,
        limit: 10,
        page_size: 10,
        total_records: 18,
        total_pages: 2
      }
    }, null, 2),
    errorStatuses: [
      { status: 400, code: 'VALIDATION_ERROR', desc: 'Invalid page or limit parameter' }
    ],
    curlExample: `curl "https://ledgerly-flow.vercel.app/api/accounts?page=1&limit=10"`,
  },
  {
    id: 'get-account',
    method: 'GET',
    path: '/api/accounts/:id',
    title: 'Get Account Details',
    description: 'Fetches the real-time balance and profile of a specific account by its UUID.',
    pathParams: [
      { name: 'id', type: 'uuid', desc: 'Unique account identifier' }
    ],
    successStatus: 200,
    successResponse: JSON.stringify({
      data: {
        id: "bbba5705-f16f-4b0c-92ad-3cba12cb09ba",
        name: "Rohan Gupta",
        balance: 7351.00,
        created_at: "2026-10-26T14:38:50.000Z"
      }
    }, null, 2),
    errorStatuses: [
      { status: 404, code: 'ACCOUNT_NOT_FOUND', desc: 'Account with given UUID does not exist' }
    ],
    curlExample: `curl "https://ledgerly-flow.vercel.app/api/accounts/bbba5705-f16f-4b0c-92ad-3cba12cb09ba"`,
  },
  {
    id: 'create-transaction',
    method: 'POST',
    path: '/api/accounts/:id/transactions',
    title: 'Create Transaction (Credit / Debit)',
    description: 'Executes an atomic credit or debit against the account. Backed by PostgreSQL row-level locks and unique idempotency keys.',
    pathParams: [
      { name: 'id', type: 'uuid', desc: 'Account UUID' }
    ],
    requestBody: JSON.stringify({
      type: "credit",
      amount: 1500.00,
      description: "Consulting Retainer Advance",
      reference_id: "REF-2026-001"
    }, null, 2),
    successStatus: 201,
    successResponse: JSON.stringify({
      data: {
        id: "4fa87112-98ba-4673-b68a-230948acba10",
        account_id: "bbba5705-f16f-4b0c-92ad-3cba12cb09ba",
        type: "credit",
        amount: 1500.00,
        description: "Consulting Retainer Advance",
        reference_id: "REF-2026-001",
        created_at: "2026-10-26T15:10:00.000Z",
        new_balance: 8851.00
      }
    }, null, 2),
    errorStatuses: [
      { status: 200, code: 'DUPLICATE_TRANSACTION', desc: 'Duplicate reference_id replay (idempotent, no side effects)' },
      { status: 422, code: 'INSUFFICIENT_BALANCE', desc: 'Debit requested exceeds current available balance' },
      { status: 404, code: 'ACCOUNT_NOT_FOUND', desc: 'Target account not found' },
      { status: 400, code: 'VALIDATION_ERROR', desc: 'Invalid amount or payload' }
    ],
    curlExample: `curl -X POST "https://ledgerly-flow.vercel.app/api/accounts/bbba5705-f16f-4b0c-92ad-3cba12cb09ba/transactions" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"credit","amount":1500,"description":"Consulting","reference_id":"REF-001"}'`,
  },
  {
    id: 'list-transactions',
    method: 'GET',
    path: '/api/accounts/:id/transactions',
    title: 'List Account Transactions',
    description: 'Retrieves an immutable audit log of transactions for the account, filterable by type and paginated.',
    pathParams: [
      { name: 'id', type: 'uuid', desc: 'Account UUID' }
    ],
    queryParams: [
      { name: 'type', type: 'string', required: false, desc: 'Filter by "credit" or "debit"' },
      { name: 'page', type: 'integer', required: false, desc: 'Page index (starts at 1)', default: '1' },
      { name: 'limit', type: 'integer', required: false, desc: 'Limit per page', default: '10' }
    ],
    successStatus: 200,
    successResponse: JSON.stringify({
      data: [
        {
          id: "4fa87112-98ba-4673-b68a-230948acba10",
          account_id: "bbba5705-f16f-4b0c-92ad-3cba12cb09ba",
          type: "credit",
          amount: 1500.00,
          description: "Consulting Retainer Advance",
          reference_id: "REF-2026-001",
          created_at: "2026-10-26T15:10:00.000Z"
        }
      ],
      pagination: {
        page: 1,
        current_page: 1,
        limit: 10,
        page_size: 10,
        total_records: 14,
        total_pages: 2
      }
    }, null, 2),
    errorStatuses: [
      { status: 404, code: 'ACCOUNT_NOT_FOUND', desc: 'Account not found' }
    ],
    curlExample: `curl "https://ledgerly-flow.vercel.app/api/accounts/bbba5705-f16f-4b0c-92ad-3cba12cb09ba/transactions?page=1&limit=10&type=credit"`,
  },
  {
    id: 'transfer-funds',
    method: 'POST',
    path: '/api/transfers',
    title: 'Atomic Fund Transfer',
    description: 'Atomically transfers funds from one account to another using deterministic UUID row-locking to prevent deadlocks and race conditions.',
    requestBody: JSON.stringify({
      from_account_id: "bbba5705-f16f-4b0c-92ad-3cba12cb09ba",
      to_account_id: "6b6af853-525c-41f5-b118-b566be52a1b1",
      amount: 500.00,
      description: "Co-working desk share",
      reference_id: "XFER-2026-001"
    }, null, 2),
    successStatus: 201,
    successResponse: JSON.stringify({
      data: {
        reference_id: "XFER-2026-001",
        from_account_id: "bbba5705-f16f-4b0c-92ad-3cba12cb09ba",
        to_account_id: "6b6af853-525c-41f5-b118-b566be52a1b1",
        amount: 500.00,
        description: "Co-working desk share",
        from_new_balance: 6851.00,
        to_new_balance: 9750.00
      }
    }, null, 2),
    errorStatuses: [
      { status: 422, code: 'INSUFFICIENT_BALANCE', desc: 'Source account balance is less than transfer amount' },
      { status: 400, code: 'INVALID_TRANSFER', desc: 'Cannot transfer funds to the same account' },
      { status: 200, code: 'DUPLICATE_TRANSACTION', desc: 'Transfer reference_id previously executed (replay)' }
    ],
    curlExample: `curl -X POST "https://ledgerly-flow.vercel.app/api/transfers" \\
  -H "Content-Type: application/json" \\
  -d '{"from_account_id":"uuid-a","to_account_id":"uuid-b","amount":500,"description":"Split","reference_id":"XFER-001"}'`,
  }
];

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<ActiveSection>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/api/accounts?page=1&limit=5');
  const [sandboxMethod, setSandboxMethod] = useState<'GET' | 'POST'>('GET');
  const [sandboxBody, setSandboxBody] = useState('{\n  "name": "Live Test Account"\n}');
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxStatus, setSandboxStatus] = useState<number | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const executeSandbox = async () => {
    setSandboxLoading(true);
    setSandboxResponse(null);
    setSandboxStatus(null);
    try {
      const options: RequestInit = {
        method: sandboxMethod,
        headers: { 'Content-Type': 'application/json' },
      };
      if (sandboxMethod === 'POST' && sandboxBody.trim()) {
        options.body = sandboxBody;
      }
      const start = performance.now();
      const res = await fetch(sandboxEndpoint, options);
      const json = await res.json();
      const duration = Math.round(performance.now() - start);

      setSandboxStatus(res.status);
      setSandboxResponse(JSON.stringify(json, null, 2) + `\n\n// Time taken: ${duration}ms`);
    } catch (err: unknown) {
      setSandboxResponse(JSON.stringify({ error: err instanceof Error ? err.message : 'Execution failed' }, null, 2));
      setSandboxStatus(500);
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* ── Complete Persistent Sidebar ── */}
      <Sidebar />

      {/* ── Main Docs Content Area (Offset for sidebar) ── */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* ── Header ── */}
        <header className="sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h1 className="text-zinc-900 dark:text-white font-bold text-sm">System Documentation</h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Badge variant="outline" className="border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10 text-xs font-mono">
                API v1.0.0
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Tab Bar Navigation ── */}
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/50 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
            {[
              { id: 'overview', label: 'Architecture & Overview', icon: <Layers className="w-4 h-4" /> },
              { id: 'concurrency', label: 'Concurrency & ACID Locks', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'schema', label: 'Database Schema & RPC', icon: <Database className="w-4 h-4" /> },
              { id: 'api', label: 'REST API Reference', icon: <Code2 className="w-4 h-4" /> },
              { id: 'errors', label: 'Error Matrix', icon: <AlertCircle className="w-4 h-4" /> },
              { id: 'sandbox', label: 'Live API Console', icon: <Terminal className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveSection)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Document Body ── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10 flex-1 w-full">

          {/* ══════════════════════════════════════════════════════════════
              SECTION 1: OVERVIEW & ARCHITECTURE
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="space-y-3">
                <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">
                  Financial Core Engine
                </Badge>
                <h2 className="text-zinc-900 dark:text-white text-3xl font-extrabold tracking-tight">
                  High-Assurance Transaction Ledger Architecture
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed max-w-3xl">
                  Ledgerly is a double-entry financial transaction ledger designed for zero floating-point drift,
                  immutable transaction journaling, race condition immunity, and mathematical deadlock prevention.
                </p>
              </div>

              {/* Core Tenets Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                  <CardHeader className="pb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base text-zinc-900 dark:text-white">Atomic Isolation</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Account updates and transaction log insertions occur inside isolated PostgreSQL transaction blocks. Balance cannot change without an accompanying ledger entry.
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                  <CardHeader className="pb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                      <Database className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base text-zinc-900 dark:text-white">Fixed-Point Precision</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Uses <code className="text-red-500 font-mono">NUMERIC(15, 2)</code> throughout both tables and stored procedures. Zero IEEE-754 floating-point rounding errors.
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                  <CardHeader className="pb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500 mb-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base text-zinc-900 dark:text-white">Strict Idempotency</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Unique composite constraint on <code className="text-red-500 font-mono">(account_id, reference_id)</code> ensures repeated network retries return identical cached payloads with zero side effects.
                  </CardContent>
                </Card>
              </div>

              {/* End to End Pipeline diagram */}
              <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-lg text-zinc-900 dark:text-white">End-to-End Request Pipeline</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">How every HTTP write request flows through stateless compute into the stateful database core.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { step: '1. Ingestion', desc: 'Next.js 14 Route Handler parses JSON payload; Zod validates positive numeric amount, UUID format, and non-empty reference_id.' },
                      { step: '2. RPC Dispatch', desc: 'API issues stored procedure call: process_transaction or transfer_funds using Supabase Service Client.' },
                      { step: '3. DB Locks & Checks', desc: 'PostgreSQL acquires row-level lock (FOR UPDATE), checks idempotency duplicate, and verifies balance >= debit amount.' },
                      { step: '4. Atomic Commit', desc: 'Updates balance, writes immutable transaction row, commits transaction, and returns formatted JSON response.' },
                    ].map(s => (
                      <div key={s.step} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50">
                        <p className="text-red-600 dark:text-red-400 font-bold text-xs">{s.step}</p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION 2: CONCURRENCY & ACID LOCKS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'concurrency' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">
                  Concurrency Control
                </Badge>
                <h2 className="text-zinc-900 dark:text-white text-2xl font-bold">
                  Race Condition & Deadlock Elimination
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-3xl leading-relaxed">
                  Ledger systems handling high volumes face two catastrophic failure modes: race conditions leading to overdrafts, and circular locks leading to deadlocks.
                </p>
              </div>

              {/* Mechanism 1: SELECT FOR UPDATE */}
              <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-white">1. Row-Level Locking (SELECT ... FOR UPDATE)</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Why application-level balance checks fail under concurrent load.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <p>
                    If two simultaneous withdrawal requests of ₹1,000 hit an account with ₹1,000 balance, an application-level check (<code className="text-red-500">if (balance &gt;= 1000)</code>) will evaluate to true for both requests, resulting in an overdraft of -₹1,000.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
                    SELECT balance INTO v_current_balance FROM accounts WHERE id = p_account_id FOR UPDATE;
                  </div>
                  <p>
                    <code className="text-red-500 font-bold">FOR UPDATE</code> serializes write access at the PostgreSQL storage engine. Request B pauses until Request A completes its commit, preventing simultaneous double-spends.
                  </p>
                </CardContent>
              </Card>

              {/* Mechanism 2: Deadlock Avoidance */}
              <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-white">2. Deadlock Avoidance Algorithm</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Deterministic lock acquisition order via lexicographical UUID comparison.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  <p>
                    If Client 1 transfers A &rarr; B while Client 2 transfers B &rarr; A, locking source first causes Client 1 to lock A (waiting on B) while Client 2 locks B (waiting on A). PostgreSQL detects a cycle and aborts with a 40P01 deadlock error.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <p className="text-zinc-400 dark:text-zinc-500">-- Deterministic lock ordering:</p>
                    <p>v_first_lock_id  := LEAST(p_from_account_id, p_to_account_id);</p>
                    <p>v_second_lock_id := GREATEST(p_from_account_id, p_to_account_id);</p>
                    <p>PERFORM 1 FROM accounts WHERE id = v_first_lock_id FOR UPDATE;</p>
                    <p>PERFORM 1 FROM accounts WHERE id = v_second_lock_id FOR UPDATE;</p>
                  </div>
                  <p>
                    Because both transactions lock the smaller UUID first, cyclic dependencies are mathematically impossible.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION 3: DATABASE SCHEMA & RPC
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'schema' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">
                  Data Dictionary
                </Badge>
                <h2 className="text-zinc-900 dark:text-white text-2xl font-bold">
                  PostgreSQL Table Schemas & Stored Procedures
                </h2>
              </div>

              {/* accounts Table */}
              <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-mono text-zinc-900 dark:text-white">TABLE: accounts</CardTitle>
                    <Badge variant="outline" className="text-xs">Primary Entity</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                          <th className="py-2 pr-4">Column</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Constraints</th>
                          <th className="py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">id</td>
                          <td className="py-2.5 pr-4">UUID</td>
                          <td className="py-2.5 pr-4">PRIMARY KEY, DEFAULT gen_random_uuid()</td>
                          <td className="py-2.5 font-sans">Unique account identifier</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">name</td>
                          <td className="py-2.5 pr-4">TEXT</td>
                          <td className="py-2.5 pr-4">NOT NULL, CHECK (length &gt; 0)</td>
                          <td className="py-2.5 font-sans">Account holder name</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">balance</td>
                          <td className="py-2.5 pr-4">NUMERIC(15,2)</td>
                          <td className="py-2.5 pr-4">NOT NULL, DEFAULT 0, CHECK (balance &gt;= 0)</td>
                          <td className="py-2.5 font-sans">Current balance, strictly non-negative</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">created_at</td>
                          <td className="py-2.5 pr-4">TIMESTAMPTZ</td>
                          <td className="py-2.5 pr-4">NOT NULL, DEFAULT now()</td>
                          <td className="py-2.5 font-sans">Timestamp of enrollment</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* transactions Table */}
              <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-mono text-zinc-900 dark:text-white">TABLE: transactions</CardTitle>
                    <Badge variant="outline" className="text-xs">Immutable Journal</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                          <th className="py-2 pr-4">Column</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Constraints</th>
                          <th className="py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-zinc-700 dark:text-zinc-300">
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">id</td>
                          <td className="py-2.5 pr-4">UUID</td>
                          <td className="py-2.5 pr-4">PRIMARY KEY, DEFAULT gen_random_uuid()</td>
                          <td className="py-2.5 font-sans">Unique transaction ID</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">account_id</td>
                          <td className="py-2.5 pr-4">UUID</td>
                          <td className="py-2.5 pr-4">NOT NULL, REFERENCES accounts(id)</td>
                          <td className="py-2.5 font-sans">Target account foreign key</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">type</td>
                          <td className="py-2.5 pr-4">TEXT</td>
                          <td className="py-2.5 pr-4">NOT NULL, CHECK (type IN ('credit','debit'))</td>
                          <td className="py-2.5 font-sans">Transaction direction</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">amount</td>
                          <td className="py-2.5 pr-4">NUMERIC(15,2)</td>
                          <td className="py-2.5 pr-4">NOT NULL, CHECK (amount &gt; 0)</td>
                          <td className="py-2.5 font-sans">Always positive; direction defined by type</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">description</td>
                          <td className="py-2.5 pr-4">TEXT</td>
                          <td className="py-2.5 pr-4">NOT NULL</td>
                          <td className="py-2.5 font-sans">Human-readable description</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 font-bold">reference_id</td>
                          <td className="py-2.5 pr-4">TEXT</td>
                          <td className="py-2.5 pr-4">NOT NULL, UNIQUE(account_id, reference_id)</td>
                          <td className="py-2.5 font-sans">Idempotency key per account</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION 4: REST API REFERENCE
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'api' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">
                  Endpoints Specification
                </Badge>
                <h2 className="text-zinc-900 dark:text-white text-2xl font-bold">
                  RESTful API Specifications
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  All requests accept and return JSON. Paginated endpoints support <code className="text-red-500 font-mono">page</code> and <code className="text-red-500 font-mono">limit</code> query parameters.
                </p>
              </div>

              <div className="space-y-6">
                {ENDPOINTS.map(ep => (
                  <Card key={ep.id} id={ep.id} className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 scroll-mt-24">
                    <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-900">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <Badge className={ep.method === 'POST' ? 'bg-red-600 text-white font-mono' : 'bg-zinc-800 text-zinc-100 font-mono'}>
                            {ep.method}
                          </Badge>
                          <code className="text-zinc-900 dark:text-white font-mono text-sm font-bold">{ep.path}</code>
                        </div>
                        <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold">{ep.title}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-2 leading-relaxed">{ep.description}</p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {/* Query / Path Parameters */}
                      {ep.queryParams && (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Query Parameters</p>
                          <div className="space-y-1 text-xs">
                            {ep.queryParams.map(q => (
                              <div key={q.name} className="flex items-center gap-2 font-mono text-zinc-600 dark:text-zinc-400">
                                <span className="text-red-600 dark:text-red-400 font-bold">{q.name}</span>
                                <span className="text-zinc-400 text-[10px]">({q.type})</span>
                                <span className="text-zinc-500 font-sans">{q.desc}</span>
                                {q.default && <span className="text-zinc-400 text-[10px]">Default: {q.default}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {ep.requestBody && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Request Body (JSON)</p>
                            <button
                              onClick={() => copyText(ep.requestBody!, `${ep.id}-req`)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                            >
                              {copiedKey === `${ep.id}-req` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              Copy JSON
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                            {ep.requestBody}
                          </pre>
                        </div>
                      )}

                      {/* Success Response */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Response</p>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
                              HTTP {ep.successStatus}
                            </Badge>
                          </div>
                          <button
                            onClick={() => copyText(ep.successResponse, `${ep.id}-res`)}
                            className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                          >
                            {copiedKey === `${ep.id}-res` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            Copy Response
                          </button>
                        </div>
                        <pre className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                          {ep.successResponse}
                        </pre>
                      </div>

                      {/* cURL Example */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">cURL Command</p>
                          <button
                            onClick={() => copyText(ep.curlExample, `${ep.id}-curl`)}
                            className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                          >
                            {copiedKey === `${ep.id}-curl` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            Copy cURL
                          </button>
                        </div>
                        <pre className="p-3 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 overflow-x-auto">
                          {ep.curlExample}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION 5: ERROR CODES MATRIX
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'errors' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">
                  Error Standards
                </Badge>
                <h2 className="text-zinc-900 dark:text-white text-2xl font-bold">
                  Predictable Error Contracts
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  All error payloads return a standard JSON structure with programmatic error codes and descriptive messages.
                </p>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800">
{`{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Account balance (70.00) is less than debit amount (150.00)",
    "details": {}
  }
}`}
              </pre>

              <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                <CardContent className="p-0">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono">
                        <th className="p-4">Error Code</th>
                        <th className="p-4">HTTP Status</th>
                        <th className="p-4">Trigger Scenario</th>
                        <th className="p-4">Remedy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-mono text-zinc-700 dark:text-zinc-300">
                      <tr>
                        <td className="p-4 text-red-600 dark:text-red-400 font-bold">VALIDATION_ERROR</td>
                        <td className="p-4">400 Bad Request</td>
                        <td className="p-4 font-sans">Malformed JSON, negative amounts, invalid UUID syntax</td>
                        <td className="p-4 font-sans">Check request body conforms to schema</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-red-600 dark:text-red-400 font-bold">ACCOUNT_NOT_FOUND</td>
                        <td className="p-4">404 Not Found</td>
                        <td className="p-4 font-sans">Account UUID does not exist in accounts table</td>
                        <td className="p-4 font-sans">Verify account ID exists via GET /api/accounts</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-red-600 dark:text-red-400 font-bold">INSUFFICIENT_BALANCE</td>
                        <td className="p-4">422 Unprocessable</td>
                        <td className="p-4 font-sans">Debit or transfer requested exceeds available balance</td>
                        <td className="p-4 font-sans">Credit account with funds first before debiting</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-red-600 dark:text-red-400 font-bold">DUPLICATE_TRANSACTION</td>
                        <td className="p-4">200 OK</td>
                        <td className="p-4 font-sans">Idempotency replay: reference_id previously processed</td>
                        <td className="p-4 font-sans">Safe retry; no duplicate deduction occurred</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-red-600 dark:text-red-400 font-bold">INVALID_TRANSFER</td>
                        <td className="p-4">400 Bad Request</td>
                        <td className="p-4 font-sans">from_account_id equals to_account_id</td>
                        <td className="p-4 font-sans">Select two distinct accounts</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6: LIVE API CONSOLE (SANDBOX)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">
                  Interactive Console
                </Badge>
                <h2 className="text-zinc-900 dark:text-white text-2xl font-bold">
                  Live API Test Runner
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Execute live requests directly against the live backend server and inspect responses in real-time.
                </p>
              </div>

              {/* Endpoint Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-zinc-400 font-medium">Quick Presets:</span>
                {[
                  { label: 'List Accounts', method: 'GET', url: '/api/accounts?page=1&limit=5', body: '' },
                  { label: 'Create Account', method: 'POST', url: '/api/accounts', body: '{\n  "name": "Console User"\n}' },
                  { label: 'List Transfers Sample', method: 'GET', url: '/api/accounts?page=1&limit=2', body: '' },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setSandboxMethod(p.method as 'GET' | 'POST');
                      setSandboxEndpoint(p.url);
                      setSandboxBody(p.body);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:border-red-500 hover:text-red-600 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Request Builder */}
              <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-white">Request Builder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={sandboxMethod}
                      onChange={e => setSandboxMethod(e.target.value as 'GET' | 'POST')}
                      className="h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>

                    <input
                      type="text"
                      value={sandboxEndpoint}
                      onChange={e => setSandboxEndpoint(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-900 dark:text-white focus-visible:ring-red-600"
                      placeholder="/api/accounts"
                    />

                    <Button
                      onClick={executeSandbox}
                      disabled={sandboxLoading}
                      className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/25 h-10"
                    >
                      {sandboxLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                      Send Request
                    </Button>
                  </div>

                  {sandboxMethod === 'POST' && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Request Body (JSON)</p>
                      <textarea
                        rows={4}
                        value={sandboxBody}
                        onChange={e => setSandboxBody(e.target.value)}
                        className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono text-zinc-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Sandbox Response Output */}
                  {sandboxStatus !== null && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Response</p>
                          <Badge
                            className={`text-xs font-mono ${
                              sandboxStatus >= 200 && sandboxStatus < 300
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            HTTP {sandboxStatus}
                          </Badge>
                        </div>
                        {sandboxResponse && (
                          <button
                            onClick={() => copyText(sandboxResponse, 'sandbox-res')}
                            className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                          >
                            {copiedKey === 'sandbox-res' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </button>
                        )}
                      </div>
                      <pre className="p-4 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-200 border border-zinc-800 max-h-80 overflow-y-auto">
                        {sandboxResponse}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
