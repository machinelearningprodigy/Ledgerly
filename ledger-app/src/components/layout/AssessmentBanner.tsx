'use client';

import { ShieldCheck } from 'lucide-react';

export function AssessmentBanner() {
  const message = (
    <div className="flex items-center gap-6 px-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
          Assessment Demo
        </span>
        <span className="font-medium text-xs">
          This app is part of an assessment, so all user accounts are shown here. In a real scenario, data security is top priority.
        </span>
      </div>
      <span className="text-zinc-400 dark:text-zinc-600">•</span>
      <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>ACID Compliant Ledger</span>
      </div>
      <span className="text-zinc-400 dark:text-zinc-600">•</span>
    </div>
  );

  return (
    <div className="w-auto lg:ml-64 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 overflow-hidden py-1.5 select-none relative z-20">
      <div className="animate-marquee whitespace-nowrap">
        {message}
        {message}
        {message}
        {message}
      </div>
    </div>
  );
}
