'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  accountId: string;
  onAdded: () => void;
}

interface FormState {
  type:         'credit' | 'debit';
  amount:       string;
  description:  string;
  reference_id: string;
}

const INITIAL_FORM: FormState = {
  type:         'credit',
  amount:       '',
  description:  '',
  reference_id: '',
};

export function AddTransactionModal({ open, onClose, accountId, onAdded }: Props) {
  const [form, setForm]       = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormState, string>>>({});

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Amount must be greater than 0';
    if (!form.description.trim())
      e.description = 'Description is required';
    if (!form.reference_id.trim())
      e.reference_id = 'Reference ID is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res  = await fetch(`/api/accounts/${accountId}/transactions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type:         form.type,
          amount:       parseFloat(Number(form.amount).toFixed(2)),
          description:  form.description.trim(),
          reference_id: form.reference_id.trim(),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Transaction failed');
      }

      if (json.duplicate) {
        toast.warning('Duplicate transaction', {
          description: 'A transaction with this reference_id already exists.',
        });
        handleClose();
        return;
      }

      toast.success(
        form.type === 'credit' ? '✅ Credit recorded' : '✅ Debit recorded',
        { description: `₹${form.amount} — ${form.description}` }
      );
      onAdded();
      handleClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Add Transaction</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Record a credit or debit on this account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['credit', 'debit'] as const).map(t => (
              <button
                key={t} type="button"
                onClick={() => set('type', t)}
                className={`flex items-center justify-center gap-2.5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.type === t
                    ? t === 'credit'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-emerald-500/10 shadow-lg'
                      : 'bg-red-500/15 border-red-500 text-red-300 shadow-red-500/10 shadow-lg'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {t === 'credit'
                  ? <TrendingUp className="w-4 h-4" />
                  : <TrendingDown className="w-4 h-4" />
                }
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <Input
                type="number" step="0.01" min="0.01" placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 pl-7"
                disabled={loading}
              />
            </div>
            {errors.amount && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.amount}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Description</Label>
            <Input
              placeholder="e.g. Salary deposit"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
              disabled={loading}
            />
            {errors.description && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
          </div>

          {/* Reference ID */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">
              Reference ID
              <span className="text-slate-600 font-normal ml-2 text-xs">(idempotency key)</span>
            </Label>
            <Input
              placeholder="e.g. TXN-2024-001"
              value={form.reference_id}
              onChange={e => set('reference_id', e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 font-mono text-sm"
              disabled={loading}
            />
            {errors.reference_id && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.reference_id}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button" variant="outline" onClick={handleClose} disabled={loading}
              className="flex-1 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit" disabled={loading}
              className={`flex-1 text-white font-semibold ${
                form.type === 'credit'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : `Submit ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
