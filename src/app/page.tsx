import React from 'react';
import Link from 'next/link';
import { getIpoProvider } from '@/lib/providers';
import { IPOCard } from '@/components/ipo/IPOCard';
import { IPOTable } from '@/components/ipo/IPOTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { GmpDisclaimerBadge } from '@/components/ui/GmpDisclaimerBadge';
import { PartialFailureBanner } from '@/components/ui/PartialFailureBanner';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';
import { DataCoverageNotice } from '@/components/ui/DataCoverageNotice';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import {
  Flame,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import { connection } from 'next/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const provider = getIpoProvider();
  const stats = await provider.getDashboardStats();

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
  }).format(new Date());

  const dynamicTitle = `Live IPO GMP Today (${todayStr}): ${stats.openCount} Open IPOs | LiveIPOTracker`;
  const description = `Real-time India & US IPO tracker for ${todayStr}. Track ${stats.openCount} open IPOs, unofficial GMP time series, price bands, lot sizes, and subscription figures.`;

  return constructMetadata({
    title: dynamicTitle,
    description,
    canonicalPath: '/',
  });
}

export default async function HomePage() {
  await connection();
  const provider = getIpoProvider();

  // Parallel server reads - no arbitrary limits
  const [stats, openIpos, upcomingIpos, gmpMovers, allIpos] = await Promise.all([
    provider.getDashboardStats(),
    provider.getIpos({ status: 'open' }),
    provider.getIpos({ status: 'upcoming' }),
    provider.getLatestGmpMovers(6),
    provider.getIpos(),
  ]);

  const fmpStatus = provider.getFmpFetchResult();
  const isEmptyDatabase = allIpos.length === 0;

  return (
    <div className="space-y-12">
      {/* Partial Failure Notification */}
      <PartialFailureBanner
        selectedRange={{ from: 'Previous 180 days', to: 'Next 90 days' }}
        lastSuccessfulUpdate={fmpStatus?.fetchedAt}
        windows={fmpStatus?.windows}
        isComplete={fmpStatus?.isComplete}
        errorMessage={fmpStatus?.errorMessage}
      />

      {/* Data Coverage Notice */}
      <DataCoverageNotice />

      {/* Hero Section */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white overflow-hidden border border-zinc-800 shadow-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Market Hours: 10:00 AM – 5:00 PM IST
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Live IPO & Market Intelligence
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Real-time tracking of India (Mainboard & SME) and US exchange IPOs (NASDAQ & NYSE).
            Status derived deterministically with transparent source attribution and no arbitrary limits.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/live-ipo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition-colors shadow-sm shadow-emerald-500/20"
            >
              <Flame className="w-4 h-4 fill-zinc-950" />
              View Live Bidding ({stats.openCount})
            </Link>
            <Link
              href="/upcoming-ipo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Upcoming Pipeline ({stats.upcomingCount})
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open IPOs */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Live & Bidding Open
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
            {stats.openCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Accepting live investor bids</p>
        </div>

        {/* Upcoming IPOs */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Upcoming Issues
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
            {stats.upcomingCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Dates or prospectus announced</p>
        </div>

        {/* Listing This Month */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Listing This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
            {stats.listingThisMonthCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Debuting in current calendar month</p>
        </div>

        {/* Total Tracked */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Database Records
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
            {stats.totalTracked}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">India & US market records</p>
        </div>
      </div>

      {/* SECTION 1: LIVE & BIDDING NOW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Live & Bidding Now ({openIpos.length})
            </h2>
          </div>
          <Link
            href="/live-ipo"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            View all ({openIpos.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {openIpos.length === 0 ? (
          <EmptyState
            title="No IPOs currently bidding"
            description="There are currently no active public issues accepting bids today. Check the upcoming section below for scheduled dates."
            showSeedHint={isEmptyDatabase}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {openIpos.slice(0, 6).map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: UPCOMING ISSUES PREVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Upcoming Issues ({upcomingIpos.length})
            </h2>
          </div>
          <Link
            href="/upcoming-ipo"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            View all ({upcomingIpos.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingIpos.length === 0 ? (
          <EmptyState
            title="No upcoming IPOs announced"
            description="No upcoming issues found in current window."
            showSeedHint={false}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingIpos.slice(0, 6).map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: GMP MOVERS TRACKER */}
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/40 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Grey Market Premium (GMP) Movers
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Time-series survey of unofficial grey market transactions and indicative premiums.
            </p>
          </div>
          <div>
            <GmpDisclaimerBadge />
          </div>
        </div>

        {gmpMovers.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
            No GMP records recorded yet. Grey market data will display as informal market surveys are
            logged with source and timestamp.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gmpMovers.map((ipo) => {
              const basePrice = ipo.price_band_high || ipo.issue_price;
              const gmp = ipo.latest_gmp?.gmp_value || 0;
              const estListing = basePrice ? basePrice + gmp : null;
              const gmpPercent = basePrice ? ((gmp / basePrice) * 100).toFixed(1) : null;

              return (
                <div
                  key={ipo.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {ipo.segment}
                      </span>
                      <GmpDisclaimerBadge short />
                    </div>
                    <Link
                      href={`/ipo/${ipo.slug}`}
                      className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 transition-colors line-clamp-1"
                    >
                      {ipo.company_name}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Current GMP</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        +₹{gmp} {gmpPercent ? `(${gmpPercent}%)` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Est. Debut</span>
                      <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                        {estListing ? `₹${estListing}` : 'Not available'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Source: {ipo.latest_gmp?.source || 'Survey'}</span>
                    <Link
                      href={`/ipo/${ipo.slug}`}
                      className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500"
                    >
                      History →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 4: COMPREHENSIVE IPO EXPLORER TABLE */}
      <section className="space-y-4 pt-4">
        <IPOTable ipos={allIpos} title="Comprehensive IPO Tracker" />
      </section>

      {/* SECTION 5: DAILY NEWSLETTER SIGNUP */}
      <section className="pt-4">
        <NewsletterForm />
      </section>
    </div>
  );
}
