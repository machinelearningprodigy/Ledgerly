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
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">Create New Account</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                Balance is initialised at ₹0.00 automatically.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="acct-name" className="text-slate-300 text-sm">Account Holder Name</Label>
            <Input
              id="acct-name"
              placeholder="e.g. Alice Johnson"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
              autoFocus
              disabled={loading}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button" variant="outline" onClick={handleClose} disabled={loading}
              className="flex-1 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit" disabled={loading || !name.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
