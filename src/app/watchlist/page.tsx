'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IPOWithDetails } from '@/types/ipo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { GmpDisclaimerBadge } from '@/components/ui/GmpDisclaimerBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatISTDate, formatISTDateTime } from '@/lib/dates';
import { useWatchlist } from '@/hooks/useWatchlist';
import {
  Bookmark,
  Trash2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function WatchlistPage() {
  const { watchlist: savedIds, remove: removeSingle, clear: clearAll } = useWatchlist();
  const [allIpos, setAllIpos] = useState<IPOWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all IPOs to populate details of saved items
    const fetchIpos = async () => {
      try {
        const res = await fetch('/api/ipos');
        if (res.ok) {
          const data = await res.json();
          setAllIpos(data);
        }
      } catch (err) {
        console.error('Failed to load IPOs for watchlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIpos();
  }, []);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire IPO watchlist?')) {
      clearAll();
    }
  };

  const matchedIpos = allIpos.filter((ipo) => savedIds.includes(ipo.id));

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'Watchlist', path: '/watchlist' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
            Local Device Storage
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Saved IPO Watchlist ({savedIds.length})
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Quickly monitor bidding dates, pricing, and live subscription status for your bookmarked
            issues.
          </p>
        </div>

        {savedIds.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Watchlist
          </button>
        )}
      </div>

      {/* Per-Browser Notice (Requirement 1) */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Per-Browser Storage Note:</strong> Your watchlist is saved strictly in your current
          browser&apos;s local storage (no account required). Clearing your browser data, cookies, or
          opening this page in a private incognito window will not carry over your saved items.
        </p>
      </div>

      {/* Watchlist Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading your saved issues...</div>
      ) : matchedIpos.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          description="Click the bookmark icon on any IPO card or table row to pin issues to this page for convenient tracking."
          actionText="Explore Live Bidding IPOs"
          actionHref="/live-ipo"
        />
      ) : (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-50 dark:bg-zinc-850/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Company & Segment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Price Band</th>
                  <th className="py-3 px-4">Lot Size</th>
                  <th className="py-3 px-4">Issue Size</th>
                  <th className="py-3 px-4">Bidding Window</th>
                  <th className="py-3 px-4">Latest GMP</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {matchedIpos.map((ipo) => (
                  <tr key={ipo.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <Link
                            href={`/ipo/${ipo.slug}`}
                            className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 block text-[13px]"
                          >
                            {ipo.company_name}
                          </Link>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {ipo.symbol ? `${ipo.symbol} • ` : ''}
                            {ipo.segment.toUpperCase()} ({ipo.exchange})
                          </span>
                        </div>
                        {ipo.is_demo && <DemoBadge />}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={ipo.status} />
                    </td>

                    <td className="py-3 px-4 font-mono font-medium">
                      {ipo.price_band_low && ipo.price_band_high
                        ? `₹${ipo.price_band_low} – ₹${ipo.price_band_high}`
                        : ipo.issue_price
                        ? `₹${ipo.issue_price}`
                        : 'Not available'}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {ipo.lot_size ? `${ipo.lot_size} shares` : 'Not available'}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {ipo.issue_size_cr ? `₹${ipo.issue_size_cr} Cr` : 'Not available'}
                    </td>

                    <td className="py-3 px-4">
                      <div>{ipo.open_date ? formatISTDate(ipo.open_date) : 'TBA'}</div>
                      <div className="text-[10px] text-zinc-400">
                        to {ipo.close_date ? formatISTDate(ipo.close_date) : 'TBA'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {ipo.latest_gmp ? (
                        <div>
                          <span className="font-mono font-bold text-emerald-600">
                            +₹{ipo.latest_gmp.gmp_value}
                          </span>
                          <div>
                            <GmpDisclaimerBadge short />
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400">Not available</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/ipo/${ipo.slug}`}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:text-emerald-500 transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => removeSingle(ipo.id)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:text-red-500 transition-colors"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
