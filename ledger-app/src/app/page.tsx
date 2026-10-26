'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, ArrowRightLeft, TrendingUp, TrendingDown,
  Wallet, Users, RefreshCw, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateAccountModal } from '@/components/accounts/CreateAccountModal';
import { TransferModal } from '@/components/transactions/TransferModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Account, PaginationMeta } from '@/types';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [accounts, setAccounts]         = useState<Account[]>([]);
  const [allAccounts, setAllAccounts]   = useState<Account[]>([]);
  const [pagination, setPagination]     = useState<PaginationMeta | null>(null);
  const [loading, setLoading]           = useState(true);
  const [currentPage, setCurrentPage]   = useState(1);
  const [showCreate, setShowCreate]     = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const fetchGlobalStats = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts?limit=100');
      const json = await res.json();
      if (res.ok && json.data) {
        setAllAccounts(json.data);
      }
    } catch {
      // non-critical
    }
  }, []);

  const fetchAccounts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/accounts?page=${page}&limit=9`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to load accounts');
      setAccounts(json.data);
      setPagination(json.pagination);
      setCurrentPage(json.pagination.page);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchGlobalStats();
  }, [fetchAccounts, fetchGlobalStats]);

  const refreshAll = (page = currentPage) => {
    fetchAccounts(page);
    fetchGlobalStats();
  };

  const statsPool = allAccounts.length > 0 ? allAccounts : accounts;
  const totalBalance = statsPool.reduce((s, a) => s + Number(a.balance), 0);
  const positiveAccounts = statsPool.filter(a => Number(a.balance) > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-900/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none tracking-tight">LedgerFlow</h1>
              <p className="text-slate-500 text-xs mt-0.5">Transaction Ledger API</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setShowTransfer(true)}
              className="border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white hidden sm:flex"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />Transfer
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" />New Account
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-4 h-4" />}       label="Total Accounts"  value={loading ? null : String(pagination?.total_records ?? accounts.length)} color="indigo" />
          <StatCard icon={<Wallet className="w-4 h-4" />}      label="Total Balance"   value={loading ? null : formatCurrency(totalBalance)}                          color="emerald" />
          <StatCard icon={<TrendingUp className="w-4 h-4" />}  label="Avg Balance"     value={loading ? null : accounts.length ? formatCurrency(totalBalance / accounts.length) : '₹0.00'} color="violet" />
          <StatCard icon={<TrendingDown className="w-4 h-4" />} label="Funded Accounts" value={loading ? null : String(positiveAccounts)} color="amber" />
        </div>

        {/* ── Accounts Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold text-xl">Accounts</h2>
              {pagination && (
                <p className="text-slate-500 text-sm mt-0.5">{pagination.total_records} account{pagination.total_records !== 1 ? 's' : ''} total</p>
              )}
            </div>
            <Button
              variant="ghost" size="sm"
              onClick={() => refreshAll(currentPage)}
              disabled={loading}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl bg-slate-800/60" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreate(true)} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
              </div>
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button
                    variant="outline" size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => fetchAccounts(currentPage - 1)}
                    className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Previous
                  </Button>
                  <span className="text-slate-400 text-sm tabular-nums">
                    Page {currentPage} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    disabled={currentPage >= pagination.total_pages}
                    onClick={() => fetchAccounts(currentPage + 1)}
                    className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <CreateAccountModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => refreshAll(1)} />
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} accounts={statsPool} onTransferred={() => refreshAll(currentPage)} />
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: {
  label: string; value: string | null; icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'violet' | 'amber';
}) {
  const palette = {
    indigo:  'text-indigo-400  bg-indigo-500/10  border-indigo-500/25',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    violet:  'text-violet-400  bg-violet-500/10  border-violet-500/25',
    amber:   'text-amber-400   bg-amber-500/10   border-amber-500/25',
  };
  return (
    <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm font-medium">{label}</span>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${palette[color]}`}>
            {icon}
          </div>
        </div>
        {value === null
          ? <Skeleton className="h-7 w-28 bg-slate-700" />
          : <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
        }
      </CardContent>
    </Card>
  );
}

// ─── AccountCard ─────────────────────────────────────────────────────────────

function AccountCard({ account }: { account: Account }) {
  const balance = Number(account.balance);
  const initials = account.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="bg-slate-900/60 border-slate-800/60 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer group backdrop-blur-sm h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/25 flex items-center justify-center text-indigo-300 font-bold text-sm">
              {initials}
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-xs">
              Active
            </Badge>
          </div>
          <CardTitle className="text-white text-lg group-hover:text-indigo-300 transition-colors mt-3 leading-tight">
            {account.name}
          </CardTitle>
          <CardDescription className="text-slate-600 text-xs font-mono">
            {account.id.split('-')[0].toUpperCase()}···
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="pt-3 border-t border-slate-800/60 flex items-end justify-between">
            <div>
              <p className="text-slate-500 text-xs mb-1">Balance</p>
              <p className={`text-xl font-bold tabular-nums ${balance > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <p className="text-slate-600 text-xs">{formatDate(account.created_at)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
        <Wallet className="w-9 h-9 text-indigo-400" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">No accounts yet</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
        Create your first account to start tracking transactions and managing balances.
      </p>
      <Button onClick={onCreateClick} className="bg-indigo-600 hover:bg-indigo-500 text-white">
        <Plus className="w-4 h-4 mr-2" />Create First Account
      </Button>
    </div>
  );
}
