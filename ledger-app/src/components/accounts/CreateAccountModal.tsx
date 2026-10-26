'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateAccountModal({ open, onClose, onCreated }: Props) {
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/accounts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error?.message || 'Failed to create account');

      toast.success(`Account "${json.data.name}" created!`, {
        description: 'Balance starts at ₹0.00',
      });
      onCreated();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-md shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/30 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-zinc-900 dark:text-white text-lg font-bold">Create New Account</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                Balance is initialised at ₹0.00 automatically.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="acct-name" className="text-zinc-700 dark:text-zinc-300 text-sm">Account Holder Name</Label>
            <Input
              id="acct-name"
              placeholder="e.g. Alice Johnson"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-red-600 focus-visible:border-red-600"
              autoFocus
              disabled={loading}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button" variant="outline" onClick={handleClose} disabled={loading}
              className="flex-1 border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit" disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
