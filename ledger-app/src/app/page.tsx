'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, ArrowRightLeft, TrendingUp, TrendingDown,
  Wallet, Users, RefreshCw, Flame, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateAccountModal } from '@/components/accounts/CreateAccountModal';
import { TransferModal } from '@/components/transactions/TransferModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserAvatar } from '@/components/UserAvatar';
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/25">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-zinc-900 dark:text-white font-bold text-lg leading-none tracking-tight">Ledgerly</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20">
                  BLACK-RED
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">Transaction Ledger System</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Button
              variant="outline" size="sm"
              onClick={() => setShowTransfer(true)}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:border-red-300 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 hidden sm:flex shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2 text-red-500" />Transfer
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-1.5" />New Account
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-4 h-4" />}       label="Total Accounts"  value={loading ? null : String(pagination?.total_records ?? accounts.length)} color="red" />
          <StatCard icon={<Wallet className="w-4 h-4" />}      label="Total Balance"   value={loading ? null : formatCurrency(totalBalance)}                          color="emerald" />
          <StatCard icon={<TrendingUp className="w-4 h-4" />}  label="Avg Balance"     value={loading ? null : accounts.length ? formatCurrency(totalBalance / (allAccounts.length || accounts.length)) : '₹0.00'} color="rose" />
          <StatCard icon={<TrendingDown className="w-4 h-4" />} label="Funded Accounts" value={loading ? null : String(positiveAccounts)} color="amber" />
        </div>

        {/* ── Accounts Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-zinc-900 dark:text-white font-bold text-xl tracking-tight">Accounts Directory</h2>
              {pagination && (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{pagination.total_records} account{pagination.total_records !== 1 ? 's' : ''} total</p>
              )}
            </div>
            <Button
              variant="ghost" size="sm"
              onClick={() => refreshAll(currentPage)}
              disabled={loading}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
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
                    className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Previous
                  </Button>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm tabular-nums">
                    Page {currentPage} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    disabled={currentPage >= pagination.total_pages}
                    onClick={() => fetchAccounts(currentPage + 1)}
                    className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
  color: 'red' | 'emerald' | 'rose' | 'amber';
}) {
  const palette = {
    red:     'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    rose:    'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25',
    amber:   'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  };
  return (
    <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{label}</span>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${palette[color]}`}>
            {icon}
          </div>
        </div>
        {value === null
          ? <Skeleton className="h-7 w-28 bg-zinc-200 dark:bg-zinc-800" />
          : <p className="text-zinc-900 dark:text-white text-2xl font-bold tracking-tight">{value}</p>
        }
      </CardContent>
    </Card>
  );
}

// ─── AccountCard ─────────────────────────────────────────────────────────────

function AccountCard({ account }: { account: Account }) {
  const balance = Number(account.balance);
  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 hover:border-red-500/50 dark:hover:border-red-600/50 hover:shadow-lg hover:shadow-red-500/5 dark:hover:shadow-red-950/20 transition-all duration-200 cursor-pointer group h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <UserAvatar name={account.name} id={account.id} size="lg" />
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs font-semibold">
              Active
            </Badge>
          </div>
          <CardTitle className="text-zinc-900 dark:text-white text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mt-3 leading-tight flex items-center justify-between">
            <span>{account.name}</span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
          </CardTitle>
          <CardDescription className="text-zinc-400 dark:text-zinc-500 text-xs font-mono">
            ID: {account.id.split('-')[0].toUpperCase()}···
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-end justify-between">
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-1">Balance</p>
              <p className={`text-xl font-bold tabular-nums ${balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs">{formatDate(account.created_at)}</p>
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
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <Wallet className="w-9 h-9 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-zinc-900 dark:text-white text-xl font-bold mb-2">No accounts yet</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 max-w-xs leading-relaxed">
        Create your first account to start tracking transactions and managing balances.
      </p>
      <Button onClick={onCreateClick} className="bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25">
        <Plus className="w-4 h-4 mr-2" />Create First Account
      </Button>
    </div>
  );
}
