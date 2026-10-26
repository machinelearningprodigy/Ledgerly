'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Wallet, User } from 'lucide-react';
import type { Account } from '@/types';
import { formatCurrency } from '@/lib/utils';

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
            ? 'opacity-50 cursor-not-allowed bg-slate-800/40 border-slate-700/50'
            : isOpen
            ? 'border-indigo-500 bg-slate-800 ring-2 ring-indigo-500/20'
            : 'border-slate-700 bg-slate-800/90 hover:border-slate-600 hover:bg-slate-800'
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
              {selected.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-white text-sm font-medium truncate">
              {selected.name}
            </span>
            <span className="ml-auto mr-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 tabular-nums flex-shrink-0">
              {formatCurrency(Number(selected.balance))}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <User className="w-4 h-4 text-slate-500" />
            <span>{placeholder}</span>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 w-full min-w-[280px] max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150">
          {availableAccounts.length === 0 ? (
            <div className="py-6 px-4 text-center text-slate-400 text-sm">
              <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
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
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                        : 'hover:bg-slate-800 text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-300'
                      }`}>
                        {account.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-semibold truncate leading-tight">
                          {account.name}
                        </p>
                        <p className="text-slate-500 text-[11px] font-mono truncate mt-0.5">
                          ID: {account.id.split('-')[0]}…
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md tabular-nums ${
                        balance > 0
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {formatCurrency(balance)}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
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
