'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame, LayoutDashboard, ArrowRightLeft, PlusCircle,
  Code2, ShieldCheck, Database, CheckCircle2, ChevronRight, X, BookOpen,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserAvatar } from '@/components/UserAvatar';
import { ApiDocsModal } from '@/components/layout/ApiDocsModal';
import { formatCurrency } from '@/lib/utils';
import type { Account } from '@/types';

interface SidebarProps {
  onOpenCreate?: () => void;
  onOpenTransfer?: () => void;
  quickAccounts?: Account[];
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  onOpenCreate,
  onOpenTransfer,
  quickAccounts = [],
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const [showApiDocs, setShowApiDocs] = useState(false);

  const isDashboard = pathname === '/';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* ── Brand Header ── */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/25 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-zinc-900 dark:text-white font-bold text-base leading-none tracking-tight">
              Ledgerly
            </h1>
            <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-0.5 font-medium">
              Enterprise Ledger
            </p>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Status Pill ── */}
      <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-900/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Supabase • Mainnet
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            v1.0.0
          </span>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isDashboard
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 font-semibold border border-red-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Accounts Directory</span>
            </Link>

            <Link
              href="/docs"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/docs'
                  ? 'bg-red-600/10 text-red-600 dark:text-red-400 font-semibold border border-red-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-red-500" />
              <span>Documentation</span>
            </Link>

            {onOpenTransfer && (
              <button
                type="button"
                onClick={() => {
                  onOpenTransfer();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className="w-4 h-4 text-red-500" />
                  <span>Transfer Funds</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {onOpenCreate && (
              <button
                type="button"
                onClick={() => {
                  onOpenCreate();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-4 h-4 text-emerald-500" />
                  <span>New Account</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowApiDocs(true);
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span>API Reference</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </nav>
        </div>

        {/* ── Quick Accounts Switcher ── */}
        {quickAccounts.length > 0 && (
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Top Accounts
              </p>
              <span className="text-[10px] text-zinc-400 font-mono">
                {quickAccounts.length}
              </span>
            </div>
            <div className="space-y-1">
              {quickAccounts.slice(0, 5).map(acc => {
                const isActive = pathname === `/accounts/${acc.id}`;
                return (
                  <Link
                    key={acc.id}
                    href={`/accounts/${acc.id}`}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-red-600/10 text-red-600 dark:text-red-400 font-semibold border border-red-500/20'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/80'
                    }`}
                  >
                    <UserAvatar name={acc.name} id={acc.id} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{acc.name}</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                        {formatCurrency(Number(acc.balance))}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Architecture & Security ── */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Ledger Guarantees
          </p>
          <div className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Atomic RPC (ACID)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span>Idempotency Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>Row-Level Lock Guard</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Operator / Settings ── */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white text-xs font-bold">
            OP
          </div>
          <div className="min-w-0">
            <p className="text-zinc-900 dark:text-white text-xs font-semibold truncate">
              Ledger Operator
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">
              Full Access
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <ApiDocsModal open={showApiDocs} onClose={() => setShowApiDocs(false)} />
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
