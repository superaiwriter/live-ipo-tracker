import React from 'react';
import { Database, Info } from 'lucide-react';

interface DataCoverageNoticeProps {
  className?: string;
}

export const DataCoverageNotice: React.FC<DataCoverageNoticeProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-4 text-xs text-blue-900 dark:text-blue-200 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
          <Database className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight">Active Market Data Coverage</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-200/60 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300">
              <Info className="w-3 h-3" /> Source Notice
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
            Connected data sources are currently limited to:
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold"> Finnhub</strong> (United States exchanges: NASDAQ, NYSE) and
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold"> supabase-india</strong> (1 record returned: Jio Platforms Limited, source manual-secondary).
            Wider Indian market coverage (SEBI automated feed / NSE & BSE live pipeline) and full global coverage across international markets are <strong className="text-amber-700 dark:text-amber-400 font-semibold">not available yet</strong>.
            Every record explicitly displays its origin provider in the table and details view.
          </p>
        </div>
      </div>
    </div>
  );
};
