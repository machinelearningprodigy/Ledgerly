'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Wallet, User } from 'lucide-react';
import type { Account } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { UserAvatar } from '@/components/UserAvatar';

interface Props {
  value: string;
  onChange: (accountId: string) => void;
  accounts: Account[];
  placeholder?: string;
  disabled?: boolean;
  excludeId?: string;
}

export function AccountSelect({
  value,
  onChange,
  accounts,
  placeholder = 'Select an account…',
  disabled = false,
  excludeId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableAccounts = accounts.filter(a => a.id !== excludeId);
  const selected = availableAccounts.find(a => a.id === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-3 h-12 px-3.5 rounded-xl border text-left transition-all outline-none ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
            : isOpen
            ? 'border-red-600 bg-white dark:bg-zinc-900 ring-2 ring-red-600/20 shadow-sm'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <UserAvatar name={selected.name} id={selected.id} size="sm" />
            <span className="text-zinc-900 dark:text-white text-sm font-medium truncate">
              {selected.name}
            </span>
            <span className="ml-auto mr-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 tabular-nums flex-shrink-0">
              {formatCurrency(Number(selected.balance))}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 text-sm">
            <User className="w-4 h-4 text-zinc-400" />
            <span>{placeholder}</span>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-red-600' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 w-full min-w-[280px] max-h-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
          {availableAccounts.length === 0 ? (
            <div className="py-6 px-4 text-center text-zinc-500 text-sm">
              <Wallet className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
              No accounts available
            </div>
          ) : (
            <div className="space-y-1">
              {availableAccounts.map(account => {
                const isSelected = account.id === value;
                const balance = Number(account.balance);
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleSelect(account.id)}
                    className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-lg text-left transition-colors group ${
                      isSelected
                        ? 'bg-red-600/10 dark:bg-red-600/20 text-zinc-900 dark:text-white border border-red-500/30'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <UserAvatar name={account.name} id={account.id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-zinc-900 dark:text-white text-sm font-semibold truncate leading-tight">
                          {account.name}
                        </p>
                        <p className="text-zinc-400 dark:text-zinc-500 text-xs font-mono truncate">
                          {account.id.split('-')[0]}…
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md tabular-nums ${
                        balance > 0
                          ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {formatCurrency(balance)}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
