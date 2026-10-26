'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`w-9 h-9 p-0 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 ${className || ''}`}
        aria-label="Toggle theme"
      >
        <span className="w-4 h-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`w-9 h-9 p-0 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900/50 shadow-sm transition-all ${className || ''}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-800 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}
