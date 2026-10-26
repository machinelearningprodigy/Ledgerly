'use client';

import { ShieldAlert, Lock } from 'lucide-react';

export function AssessmentBanner() {
  return (
    <div className="w-full bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/30 dark:border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="flex-shrink-0 mt-0.5 sm:mt-0 p-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <p className="leading-snug">
            <span className="font-bold uppercase tracking-wider text-[11px] mr-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Assessment Notice
            </span>
            This application is built as part of a <strong>technical assessment</strong>, and mock user ledgers are publicly displayed to evaluate end-to-end multi-account features, atomic transfers, and pagination. In production enterprise software, rigorous multi-tenant data isolation, zero-trust authentication, and strict privacy controls must be maintained. <strong>I take full engineering ownership and responsibility for the architecture, security safeguards, and implementation demonstrated here.</strong>
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap pl-4 flex-shrink-0">
          <Lock className="w-3 h-3 text-amber-500" />
          <span>Full Architecture Ownership</span>
        </div>
      </div>
    </div>
  );
}
