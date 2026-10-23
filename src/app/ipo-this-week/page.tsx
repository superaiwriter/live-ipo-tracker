import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getIpoProvider } from '@/lib/providers';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { IPOCard } from '@/components/ipo/IPOCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { formatISTDate } from '@/lib/dates';
import { constructMetadata } from '@/lib/seo';
import {
  CalendarDays,
  Flame,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

import { PartialFailureBanner } from '@/components/ui/PartialFailureBanner';
import { connection } from 'next/server';

export const metadata: Metadata = constructMetadata({
  title: 'IPOs This Week in India: Action Schedule & Closings | LiveIPOTracker',
  description:
    'Weekly action checklist for Indian IPO investors. Check which IPOs are opening for bidding, closing this week, finalizing allotment status, or listing on NSE/BSE.',
  canonicalPath: '/ipo-this-week',
});

export default async function IpoThisWeekPage() {
  await connection();
  const provider = getIpoProvider();
  const allIpos = await provider.getIpos();
  const fmpStatus = provider.getFmpFetchResult();

  // Calculate current week bounds (Monday to Sunday in IST)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
  const diffToMonday = (dayOfWeek + 6) % 7; // Days since Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const isDateInThisWeek = (dateStr?: string | null) => {
    if (!dateStr) return false;
    const time = new Date(dateStr).getTime();
    return time >= monday.getTime() && time <= sunday.getTime();
  };

  const opensThisWeek = allIpos.filter((i) => isDateInThisWeek(i.open_date));
  const closesThisWeek = allIpos.filter((i) => isDateInThisWeek(i.close_date));
  const allotmentsThisWeek = allIpos.filter((i) => isDateInThisWeek(i.allotment_date));
  const listingsThisWeek = allIpos.filter((i) => isDateInThisWeek(i.listing_date));

  const weekTitle = `${formatISTDate(monday.toISOString())} – ${formatISTDate(sunday.toISOString())}`;

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'IPOs This Week', path: '/ipo-this-week' }]} />

      <PartialFailureBanner
        selectedRange={{ from: 'Previous 180 days', to: 'Next 90 days' }}
        lastSuccessfulUpdate={fmpStatus?.fetchedAt}
        windows={fmpStatus?.windows}
        isComplete={fmpStatus?.isComplete}
        errorMessage={fmpStatus?.errorMessage}
      />

      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 border border-zinc-800 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/30">
          <CalendarDays className="w-3.5 h-3.5" />
          Weekly Investor Action Matrix
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          IPOs This Week ({weekTitle})
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mt-1 leading-relaxed">
          Summary of all subscription openings, closing cut-offs, allotment declarations, and
          secondary market debuts scheduled for the current week in Indian Standard Time.
        </p>
      </div>

      {/* Grid of 4 Weekly Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Opens This Week */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-500" />
              Opening for Bidding
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {opensThisWeek.length}
            </span>
          </div>

          {opensThisWeek.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No IPOs opening this week.</p>
          ) : (
            <div className="space-y-3">
              {opensThisWeek.map((ipo) => (
                <div
                  key={ipo.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      {ipo.segment}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-600 font-semibold">
                      {formatISTDate(ipo.open_date)}
                    </span>
                  </div>
                  <Link
                    href={`/ipo/${ipo.slug}`}
                    className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 block truncate"
                  >
                    {ipo.company_name}
                  </Link>
                  <div className="text-[11px] text-zinc-500 flex justify-between">
                    <span>Lot: {ipo.lot_size ? `${ipo.lot_size} sh.` : 'TBA'}</span>
                    <span>₹{ipo.price_band_high || ipo.issue_price || 'TBA'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Closes This Week */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              Closing This Week
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {closesThisWeek.length}
            </span>
          </div>

          {closesThisWeek.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No IPOs closing this week.</p>
          ) : (
            <div className="space-y-3">
              {closesThisWeek.map((ipo) => (
                <div
                  key={ipo.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      {ipo.segment}
                    </span>
                    <span className="font-mono text-[10px] text-amber-600 font-semibold">
                      Closes {formatISTDate(ipo.close_date)} (5 PM)
                    </span>
                  </div>
                  <Link
                    href={`/ipo/${ipo.slug}`}
                    className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 block truncate"
                  >
                    {ipo.company_name}
                  </Link>
                  <div className="text-[11px] text-zinc-500 flex justify-between">
                    <span>Issue: ₹{ipo.issue_size_cr ? `${ipo.issue_size_cr} Cr` : 'TBA'}</span>
                    <span className="text-amber-600 font-semibold">Final Bidding</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Allotment Declared This Week */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Allotment Out
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {allotmentsThisWeek.length}
            </span>
          </div>

          {allotmentsThisWeek.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No allotments scheduled.</p>
          ) : (
            <div className="space-y-3">
              {allotmentsThisWeek.map((ipo) => (
                <div
                  key={ipo.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      {ipo.segment}
                    </span>
                    <span className="font-mono text-[10px] text-blue-600 font-semibold">
                      {formatISTDate(ipo.allotment_date)}
                    </span>
                  </div>
                  <Link
                    href={`/ipo/${ipo.slug}`}
                    className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 block truncate"
                  >
                    {ipo.company_name}
                  </Link>
                  <div className="text-[11px] text-zinc-500">
                    Registrar: {ipo.registrar || 'Check Link'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Listing Debuts This Week */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Listing on Exchange
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {listingsThisWeek.length}
            </span>
          </div>

          {listingsThisWeek.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">No listings this week.</p>
          ) : (
            <div className="space-y-3">
              {listingsThisWeek.map((ipo) => (
                <div
                  key={ipo.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      {ipo.exchange}
                    </span>
                    <span className="font-mono text-[10px] text-purple-600 font-semibold">
                      {formatISTDate(ipo.listing_date)}
                    </span>
                  </div>
                  <Link
                    href={`/ipo/${ipo.slug}`}
                    className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 block truncate"
                  >
                    {ipo.company_name}
                  </Link>
                  <div className="text-[11px] text-zinc-500 flex justify-between">
                    <span>Issue: ₹{ipo.issue_price || 'TBA'}</span>
                    <span className="text-purple-600 font-semibold">10:00 AM Debut</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
