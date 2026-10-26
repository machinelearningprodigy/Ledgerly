import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm py-6 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Ledgerly</span>
          <span>•</span>
          <span>ACID Transaction Ledger</span>
        </div>

        <div className="text-center font-medium text-zinc-600 dark:text-zinc-300">
          © {new Date().getFullYear()} Rahul Mishra. All rights reserved.
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/docs"
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            System Docs
          </Link>
          <span>•</span>
          <a
            href="https://github.com/machinelearningprodigy/Ledgerly"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
