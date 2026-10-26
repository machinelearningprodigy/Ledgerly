'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Plus, ArrowRightLeft, TrendingUp, TrendingDown,
  Hash, Wallet, Copy, CheckCheck, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { TransferModal } from '@/components/transactions/TransferModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Account, Transaction, PaginationMeta } from '@/types';
import { toast } from 'sonner';

type FilterType = 'all' | 'credit' | 'debit';

export default function AccountDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const accountId = params.id as string;

  const [account, setAccount]       = useState<Account | null>(null);
  const [transactions, setTxns]     = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filter, setFilter]         = useState<FilterType>('all');
  const [acctLoading, setAcctLoad]  = useState(true);
  const [txnLoading, setTxnLoad]    = useState(true);
  const [currentPage, setPage]      = useState(1);
  const [showAdd, setShowAdd]       = useState(false);
  const [showTransfer, setShowXfer] = useState(false);
  const [copied, setCopied]         = useState(false);

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

  useEffect(() => { fetchAccount(); }, [fetchAccount]);
  useEffect(() => { fetchTransactions(1, filter); setPage(1); }, [filter, fetchTransactions]);

  const handlePageChange = (p: number) => { setPage(p); fetchTransactions(p, filter); };

  const copyId = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refresh = () => { fetchAccount(); fetchTransactions(currentPage, filter); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-900/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />Dashboard
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refresh} className="text-slate-500 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setShowXfer(true)}
              className="border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white hidden sm:flex"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />Transfer
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />Add Transaction
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Account Card ── */}
        {acctLoading ? (
          <Skeleton className="h-40 rounded-2xl bg-slate-800/60" />
        ) : account ? (
          <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm overflow-hidden">
            {/* Accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-2xl flex-shrink-0">
                  {account.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-white text-2xl font-bold truncate">{account.name}</h1>
                  <button
                    onClick={copyId}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-mono mt-1 transition-colors group"
                  >
                    <Hash className="w-3 h-3" />
                    <span className="truncate max-w-[280px]">{account.id}</span>
                    {copied
                      ? <CheckCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      : <Copy className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    }
                  </button>
                  <p className="text-slate-600 text-xs mt-1">Created {formatDate(account.created_at)}</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="text-slate-500 text-xs mb-1">Current Balance</p>
                  <p className={`text-3xl font-bold tabular-nums ${Number(account.balance) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
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
            { icon: <Hash className="w-4 h-4 text-slate-400" />,        bg: 'bg-slate-700',            label: 'Total',    value: pagination ? String(pagination.total_records) : '—' },
            { icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, bg: 'bg-emerald-500/10 border border-emerald-500/20', label: 'Credits',  value: formatCurrency(transactions.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)) },
            { icon: <TrendingDown className="w-4 h-4 text-red-400" />,   bg: 'bg-red-500/10 border border-red-500/20',         label: 'Debits',   value: formatCurrency(transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0)) },
          ].map(({ icon, bg, label, value }) => (
            <Card key={label} className="bg-slate-900/60 border-slate-800/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-xs">{label}</p>
                  <p className="text-white font-bold text-sm truncate">{txnLoading ? '…' : value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Transaction History ── */}
        <Card className="bg-slate-900/60 border-slate-800/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-white text-lg">Transaction History</CardTitle>
              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg">
                {(['all', 'credit', 'debit'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      filter === f
                        ? f === 'credit' ? 'bg-emerald-600 text-white'
                        : f === 'debit'  ? 'bg-red-600 text-white'
                        : 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {txnLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-slate-800/60" />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16">
                <Wallet className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No {filter !== 'all' ? filter : ''} transactions found</p>
                <Button size="sm" onClick={() => setShowAdd(true)} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white">
                  <Plus className="w-4 h-4 mr-1.5" />Add Transaction
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  {transactions.map((txn, i) => (
                    <div key={txn.id}>
                      <TxnRow txn={txn} />
                      {i < transactions.length - 1 && <Separator className="bg-slate-800/40 my-0.5" />}
                    </div>
                  ))}
                </div>

                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-800/60">
                    <p className="text-slate-500 text-xs tabular-nums">
                      {pagination.total_records} transactions · Page {pagination.page} of {pagination.total_pages}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}
                        className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={currentPage >= pagination.total_pages} onClick={() => handlePageChange(currentPage + 1)}
                        className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
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

      {account && (
        <>
          <AddTransactionModal open={showAdd} onClose={() => setShowAdd(false)} accountId={accountId} onAdded={refresh} />
          <TransferModal open={showTransfer} onClose={() => setShowXfer(false)} accounts={[account]} defaultFromId={accountId} onTransferred={refresh} />
        </>
      )}
    </div>
  );
}

function TxnRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.type === 'credit';
  return (
    <div className="flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-slate-800/30 transition-colors group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isCredit ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
      }`}>
        {isCredit
          ? <TrendingUp className="w-4 h-4 text-emerald-400" />
          : <TrendingDown className="w-4 h-4 text-red-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{txn.description}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <code className="text-slate-500 text-xs truncate max-w-[180px]">{txn.reference_id}</code>
          <span className="text-slate-700 text-xs">·</span>
          <span className="text-slate-600 text-xs">{formatDate(txn.created_at)}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm tabular-nums ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCredit ? '+' : '−'}{formatCurrency(Number(txn.amount))}
        </p>
        <Badge
          variant="outline"
          className={`text-[10px] mt-1 px-1.5 py-0 ${
            isCredit ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'
          }`}
        >
          {txn.type}
        </Badge>
      </div>
    </div>
  );
}
