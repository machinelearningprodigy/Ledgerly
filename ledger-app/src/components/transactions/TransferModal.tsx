'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AccountSelect } from '@/components/accounts/AccountSelect';
import { toast } from 'sonner';
import { Loader2, ArrowRight, AlertCircle, ArrowRightLeft } from 'lucide-react';
import type { Account } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { UserAvatar } from '@/components/UserAvatar';

interface Props {
  open:           boolean;
  onClose:        () => void;
  accounts:       Account[];
  defaultFromId?: string;
  onTransferred:  () => void;
}

interface FormState {
  from_account_id: string;
  to_account_id:   string;
  amount:          string;
  description:     string;
  reference_id:    string;
}

export function TransferModal({ open, onClose, accounts, defaultFromId, onTransferred }: Props) {
  const [allAccounts, setAllAccounts] = useState<Account[]>(accounts);
  const [form, setForm] = useState<FormState>({
    from_account_id: defaultFromId ?? '',
    to_account_id:   '',
    amount:          '',
    description:     '',
    reference_id:    '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState | '_root', string>>>({});

  // Refresh full account list when modal opens so dropdowns are populated
  useEffect(() => {
    if (!open) return;
    fetch('/api/accounts?limit=100')
      .then(r => r.json())
      .then(j => { if (j.data) setAllAccounts(j.data); })
      .catch(() => {/* use prop accounts as fallback */});
  }, [open]);

  const handleClose = () => {
    setForm({ from_account_id: defaultFromId ?? '', to_account_id: '', amount: '', description: '', reference_id: '' });
    setErrors({});
    onClose();
  };

  const set = <K extends keyof FormState>(key: K, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined, _root: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.from_account_id)            e.from_account_id = 'Source account is required';
    if (!form.to_account_id)              e.to_account_id   = 'Destination account is required';
    if (form.from_account_id && form.to_account_id && form.from_account_id === form.to_account_id)
      e.to_account_id = 'Cannot transfer to the same account';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      e.amount = 'Amount must be greater than 0';
    } else {
      const src = allAccounts.find(a => a.id === form.from_account_id);
      if (src && Number(src.balance) < Number(form.amount)) {
        e.amount = `Source account has insufficient balance (Current balance: ${formatCurrency(Number(src.balance))})`;
      }
    }
    if (!form.description.trim())         e.description   = 'Description is required';
    if (!form.reference_id.trim())        e.reference_id  = 'Reference ID is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/transfers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          from_account_id: form.from_account_id,
          to_account_id:   form.to_account_id,
          amount:          parseFloat(Number(form.amount).toFixed(2)),
          description:     form.description.trim(),
          reference_id:    form.reference_id.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Transfer failed');

      if (json.duplicate) {
        toast.warning('Transfer already exists', {
          description: 'A transfer with this reference_id was already processed.',
        });
        handleClose();
        return;
      }

      const from = allAccounts.find(a => a.id === form.from_account_id);
      const to   = allAccounts.find(a => a.id === form.to_account_id);
      toast.success('Transfer successful!', {
        description: `₹${form.amount} from ${from?.name ?? '—'} → ${to?.name ?? '—'}`,
      });
      onTransferred();
      handleClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const fromAccount = allAccounts.find(a => a.id === form.from_account_id);
  const toAccount   = allAccounts.find(a => a.id === form.to_account_id);

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-md shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/30 flex items-center justify-center flex-shrink-0">
              <ArrowRightLeft className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-zinc-900 dark:text-white text-lg font-bold">Transfer Funds</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                Atomically move money between two accounts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* Preview bar with avatars */}
          {(fromAccount || toAccount) && (
            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex-1 min-w-0 flex items-center gap-2">
                {fromAccount && <UserAvatar name={fromAccount.name} id={fromAccount.id} size="sm" />}
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-wider">From</p>
                  <p className="text-zinc-900 dark:text-white text-xs font-semibold truncate">{fromAccount?.name ?? '—'}</p>
                  {fromAccount && <p className="text-emerald-600 dark:text-emerald-400 text-[11px] tabular-nums">{formatCurrency(Number(fromAccount.balance))}</p>}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-2">
                {toAccount && <UserAvatar name={toAccount.name} id={toAccount.id} size="sm" />}
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-wider">To</p>
                  <p className="text-zinc-900 dark:text-white text-xs font-semibold truncate">{toAccount?.name ?? '—'}</p>
                  {toAccount && <p className="text-emerald-600 dark:text-emerald-400 text-[11px] tabular-nums">{formatCurrency(Number(toAccount.balance))}</p>}
                </div>
              </div>
            </div>
          )}

          {/* From Account */}
          <div className="space-y-1.5">
            <Label className="text-zinc-700 dark:text-zinc-300 text-sm">From Account</Label>
            <AccountSelect
              value={form.from_account_id}
              onChange={id => set('from_account_id', id)}
              accounts={allAccounts}
              placeholder="Select source account…"
              disabled={loading}
            />
            {errors.from_account_id && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.from_account_id}</p>}
          </div>

          {/* To Account */}
          <div className="space-y-1.5">
            <Label className="text-zinc-700 dark:text-zinc-300 text-sm">To Account</Label>
            <AccountSelect
              value={form.to_account_id}
              onChange={id => set('to_account_id', id)}
              accounts={allAccounts}
              excludeId={form.from_account_id}
              placeholder="Select destination account…"
              disabled={loading}
            />
            {errors.to_account_id && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.to_account_id}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-zinc-700 dark:text-zinc-300 text-sm">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 font-medium">₹</span>
              <Input
                type="number" step="0.01" min="0.01" placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-red-600 pl-7"
                disabled={loading}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.amount}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-zinc-700 dark:text-zinc-300 text-sm">Description</Label>
            <Input
              placeholder="e.g. Rent payment"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-red-600"
              disabled={loading}
            />
            {errors.description && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
          </div>

          {/* Reference ID */}
          <div className="space-y-1.5">
            <Label className="text-zinc-700 dark:text-zinc-300 text-sm">
              Reference ID
              <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-2 text-xs">(idempotency key)</span>
            </Label>
            <Input
              placeholder="e.g. TRANSFER-001"
              value={form.reference_id}
              onChange={e => set('reference_id', e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-red-600 font-mono text-sm"
              disabled={loading}
            />
            {errors.reference_id && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.reference_id}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button" variant="outline" onClick={handleClose} disabled={loading}
              className="flex-1 border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit" disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md shadow-red-600/25 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transfer Funds'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
