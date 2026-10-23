'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';

interface WatchlistButtonProps {
  ipoId: string;
  companyName?: string;
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  ipoId,
  companyName,
  className = '',
}) => {
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(ipoId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(ipoId);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title={saved ? `Remove ${companyName || 'IPO'} from watchlist` : `Add ${companyName || 'IPO'} to watchlist`}
      className={`p-1.5 rounded-lg border transition-all ${
        saved
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
          : 'bg-zinc-100 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-700/60 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
      } ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : 'fill-none'}`}
      />
    </button>
  );
};
