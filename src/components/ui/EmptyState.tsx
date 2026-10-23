import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showSeedHint?: boolean;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No IPO records available',
  description = 'No IPOs match your criteria at this moment. When official exchange filings or circulars are released, they will appear here.',
  showSeedHint = false,
  actionText,
  actionHref,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 my-6 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-500 shadow-sm">
        <Database className="w-7 h-7 text-zinc-400 dark:text-zinc-500" />
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {showSeedHint && (
        <div className="max-w-lg p-3.5 mb-6 text-left rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
          <p className="font-semibold mb-1">Local Development Setup Notice:</p>
          <p className="mb-2">
            Database has no IPO rows. To populate sample rows for testing (Rule 2 compliant with{' '}
            <code className="font-mono bg-amber-200/50 dark:bg-amber-900/60 px-1 py-0.5 rounded">
              is_demo = true
            </code>
            ):
          </p>
          <pre className="p-2 bg-amber-100/60 dark:bg-amber-950/60 rounded font-mono text-[11px] overflow-x-auto">
            npm run seed # or run scripts/seed-demo.sql in Supabase SQL editor
          </pre>
        </div>
      )}

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          {actionText}
        </Link>
      )}
    </div>
  );
};
