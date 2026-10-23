import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center mb-6 text-zinc-400">
        <Search className="w-8 h-8 text-zinc-500" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
        IPO Record Not Found
      </h1>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
        The IPO or page you are looking for does not exist, may have had its ticker symbol updated,
        or has not yet been registered in our database.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          Back to Overview
        </Link>
        <Link
          href="/live-ipo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
        >
          Explore Live Bidding
        </Link>
      </div>
    </div>
  );
}
