'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, ArrowRightLeft, TrendingUp, TrendingDown,
  Hash, Wallet, Copy, CheckCheck, RefreshCw, Menu, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { TransferModal } from '@/components/transactions/TransferModal';
import { CreateAccountModal } from '@/components/accounts/CreateAccountModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserAvatar } from '@/components/UserAvatar';
import { Sidebar } from '@/components/layout/Sidebar';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Account, Transaction, PaginationMeta } from '@/types';
import { toast } from 'sonner';

type FilterType = 'all' | 'credit' | 'debit';

export default function AccountDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const accountId = params.id as string;

  const [account, setAccount]       = useState<Account | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [transactions, setTxns]     = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filter, setFilter]         = useState<FilterType>('all');
  const [acctLoading, setAcctLoad]  = useState(true);
  const [txnLoading, setTxnLoad]    = useState(true);
  const [currentPage, setPage]      = useState(1);
  const [showAdd, setShowAdd]       = useState(false);
  const [showTransfer, setShowXfer] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied]         = useState(false);

  const fetchGlobalAccounts = useCallback(async () => {
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

  const fetchAccount = useCallback(async () => {
    setAcctLoad(true);
    try {
      const res  = await fetch(`/api/accounts/${accountId}`);
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 404) { router.push('/'); return; }
        throw new Error(json.error?.message);
      }
      setAccount(json.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load account');
    } finally {
      setAcctLoad(false);
    }
  }, [accountId, router]);

  const fetchTransactions = useCallback(async (page = 1, type: FilterType = 'all') => {
    setTxnLoad(true);
    try {
      const sp = new URLSearchParams({ page: String(page), limit: '10' });
      if (type !== 'all') sp.set('type', type);
      const res  = await fetch(`/api/accounts/${accountId}/transactions?${sp}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message);
      setTxns(json.data);
      setPagination(json.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setTxnLoad(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchAccount();
    fetchGlobalAccounts();
  }, [fetchAccount, fetchGlobalAccounts]);

  useEffect(() => {
    fetchTransactions(1, filter);
    setPage(1);
  }, [filter, fetchTransactions]);

  const handlePageChange = (p: number) => { setPage(p); fetchTransactions(p, filter); };

  const copyId = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refresh = () => {
    fetchAccount();
    fetchTransactions(currentPage, filter);
    fetchGlobalAccounts();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* ── Complete Sidebar ── */}
      <Sidebar
        onOpenCreate={() => setShowCreate(true)}
        onOpenTransfer={() => setShowXfer(true)}
        quickAccounts={allAccounts.length > 0 ? allAccounts : (account ? [account] : [])}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* ── Main View (Offset for desktop sidebar) ── */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* ── Header ── */}
        <header className="sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />Dashboard
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <ThemeToggle className="lg:hidden" />
              <Link href="/docs" className="hidden sm:inline-flex">
                <Button
                  variant="outline" size="sm"
                  className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:border-red-300 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 shadow-sm"
                >
                  <BookOpen className="w-4 h-4 mr-1.5 text-red-500" />Docs
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={refresh} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setShowXfer(true)}
                className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:border-red-300 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 hidden sm:flex"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2 text-red-500" />Transfer
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAdd(true)}
                className="bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 mr-1.5" />Add Transaction
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 w-full">

          {/* ── Account Hero Card ── */}
          {acctLoading ? (
            <Skeleton className="h-44 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
          ) : account ? (
            <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none backdrop-blur-sm overflow-hidden">
              {/* Top Crimson Accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-800" />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <UserAvatar name={account.name} id={account.id} size="xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-zinc-900 dark:text-white text-2xl font-bold truncate">{account.name}</h1>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs">
                        Active Account
                      </Badge>
                    </div>
                    <button
                      onClick={copyId}
                      className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-mono mt-1.5 transition-colors group"
                    >
                      <Hash className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[280px]">{account.id}</span>
                      {copied
                        ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        : <Copy className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      }
                    </button>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Created {formatDate(account.created_at)}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-900">
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-1 font-medium">Current Balance</p>
                    <p className={`text-3xl font-extrabold tabular-nums ${Number(account.balance) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      {formatCurrency(Number(account.balance))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* ── Mini Stats ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Hash className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />,        bg: 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700', label: 'Total Records', value: pagination ? String(pagination.total_records) : '—' },
              { icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-500/10 border border-emerald-500/25', label: 'Credits (Page)',  value: formatCurrency(transactions.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)) },
              { icon: <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />,   bg: 'bg-red-500/10 border border-red-500/25',         label: 'Debits (Page)',   value: formatCurrency(transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0)) },
            ].map(({ icon, bg, label, value }) => (
              <Card key={label} className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
                  <div className="min-w-0">
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs">{label}</p>
                    <p className="text-zinc-900 dark:text-white font-bold text-sm truncate">{txnLoading ? '…' : value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Transaction History ── */}
          <Card className="bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-none">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-zinc-900 dark:text-white text-lg font-bold">Transaction History</CardTitle>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">Paginated & audit-logged records</p>
                </div>
                {/* Filter Pills */}
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {(['all', 'credit', 'debit'] as FilterType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f
                          ? f === 'credit'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : f === 'debit'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-red-600 text-white shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {txnLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-900" />)}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <Wallet className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No {filter !== 'all' ? filter : ''} transactions found</p>
                  <Button size="sm" onClick={() => setShowAdd(true)} className="mt-4 bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25">
                    <Plus className="w-4 h-4 mr-1.5" />Add Transaction
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    {transactions.map((txn, i) => (
                      <div key={txn.id}>
                        <TxnRow txn={txn} />
                        {i < transactions.length - 1 && <Separator className="bg-zinc-100 dark:bg-zinc-900 my-0.5" />}
                      </div>
                    ))}
                  </div>

                  {pagination && pagination.total_pages > 1 && (
                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-900">
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs tabular-nums">
                        {pagination.total_records} transactions · Page {pagination.page} of {pagination.total_pages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}
                          className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled={currentPage >= pagination.total_pages} onClick={() => handlePageChange(currentPage + 1)}
                          className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <CreateAccountModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={refresh} />
      {account && (
        <>
          <AddTransactionModal open={showAdd} onClose={() => setShowAdd(false)} accountId={accountId} onAdded={refresh} />
          <TransferModal open={showTransfer} onClose={() => setShowXfer(false)} accounts={allAccounts.length > 0 ? allAccounts : [account]} defaultFromId={accountId} onTransferred={refresh} />
        </>
      )}
    </div>
  );
}

function TxnRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.type === 'credit';
  return (
    <div className="flex items-center gap-4 py-3.5 px-3 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60 transition-colors group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isCredit ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
      }`}>
        {isCredit
          ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-900 dark:text-white text-sm font-semibold truncate">{txn.description}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <code className="text-zinc-400 dark:text-zinc-500 text-xs truncate max-w-[200px] font-mono">{txn.reference_id}</code>
          <span className="text-zinc-300 dark:text-zinc-700 text-xs">·</span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xs">{formatDate(txn.created_at)}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm tabular-nums ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {isCredit ? '+' : '−'}{formatCurrency(Number(txn.amount))}
        </p>
        <Badge
          variant="outline"
          className={`text-[10px] mt-1 px-1.5 py-0 uppercase font-bold tracking-wider ${
            isCredit
              ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
              : 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5'
          }`}
        >
          {txn.type}
        </Badge>
      </div>
    </div>
  );
}
