import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      </div>
      <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
      <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="space-y-1">
          <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-sm animate-pulse">
      <div className="h-12 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800" />
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="h-5 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
