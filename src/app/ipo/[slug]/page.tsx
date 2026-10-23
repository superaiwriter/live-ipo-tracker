import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getIpoProvider } from '@/lib/providers';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { GmpDisclaimerBadge } from '@/components/ui/GmpDisclaimerBadge';
import { WatchlistButton } from '@/components/ipo/WatchlistButton';
import { IpoLotCalculator } from '@/components/calculators/IpoLotCalculator';
import { formatISTDate, formatISTDateTime } from '@/lib/dates';
import { calculateListingGain, calculateMinInvestment } from '@/lib/calculations';
import {
  Calendar,
  Building2,
  FileText,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ExternalLink,
  Users,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Bell,
  ShieldAlert,
} from 'lucide-react';

import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

import { connection } from 'next/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = getIpoProvider();
  const ipo = await provider.getIpoBySlug(slug);

  if (!ipo) {
    return constructMetadata({
      title: 'IPO Not Found | LiveIPOTracker',
      description: 'The requested IPO could not be located in our database.',
      noIndex: true,
    });
  }

  const priceText =
    ipo.price_band_low && ipo.price_band_high
      ? `₹${ipo.price_band_low}–₹${ipo.price_band_high}`
      : ipo.issue_price
      ? `₹${ipo.issue_price}`
      : '';

  const title = `${ipo.company_name} (${ipo.symbol || ipo.exchange}) IPO: Dates, Price Band & GMP | LiveIPOTracker`;
  const description = `In-depth analysis for ${ipo.company_name} (${ipo.segment === 'mainboard' ? 'Mainboard' : 'SME'} on ${ipo.exchange}). Price band: ${priceText || 'Not available'}, Lot size: ${ipo.lot_size || 'Not available'}, Issue size: ${ipo.issue_size_cr ? `₹${ipo.issue_size_cr} Cr` : 'Not available'}. Official filings and dates in IST.`;

  return constructMetadata({
    title,
    description,
    canonicalPath: `/ipo/${ipo.slug}`,
    ogType: 'article',
  });
}

export default async function IpoDetailPage({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const provider = getIpoProvider();
  const ipo = await provider.getIpoBySlug(slug);

  if (!ipo) {
    notFound();
  }

  const listingGain = calculateListingGain(ipo.issue_price, ipo.listing_price);
  const minInvestment = calculateMinInvestment(
    ipo.price_band_high || ipo.issue_price,
    ipo.lot_size
  );

  // Timeline events definition
  const timeline = [
    { label: 'Issue Opens', date: ipo.open_date, key: 'open' },
    { label: 'Issue Closes', date: ipo.close_date, key: 'close' },
    { label: 'Basis of Allotment', date: ipo.allotment_date, key: 'allotment' },
    { label: 'Refunds Initiation', date: ipo.refund_date, key: 'refund' },
    { label: 'Listing on Exchange', date: ipo.listing_date, key: 'listing' },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          {
            name: ipo.segment === 'mainboard' ? 'Mainboard IPOs' : 'SME IPOs',
            path: ipo.segment === 'mainboard' ? '/mainboard-ipo' : '/sme-ipo',
          },
          { name: ipo.company_name, path: `/ipo/${ipo.slug}` },
        ]}
      />

      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Overview
        </Link>
        <div className="flex items-center gap-2">
          {ipo.is_demo && <DemoBadge size="md" />}
          <WatchlistButton ipoId={ipo.id} companyName={ipo.company_name} />
        </div>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={ipo.status} />
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                  ipo.segment === 'mainboard'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {ipo.segment === 'mainboard' ? 'Mainboard' : 'SME Platform'}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {ipo.exchange}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {ipo.company_name}
            </h1>

            {ipo.sub_title && (
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {ipo.sub_title}
              </p>
            )}

            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Ticker Symbol: <strong className="text-zinc-900 dark:text-zinc-200">{ipo.symbol || 'Not announced'}</strong>
              {' • '}Exchange: <strong className="text-zinc-900 dark:text-zinc-200">{ipo.exchange && ipo.exchange !== 'UNKNOWN' ? ipo.exchange : 'Not announced'}</strong>
              {ipo.country ? ` (${ipo.country})` : ''}
            </p>

            {ipo.about && (
              <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed pt-1">
                {ipo.about}
              </p>
            )}

            {/* RULE 2: Reported Media Intelligence Note */}
            {ipo.reported_note && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-1 max-w-3xl">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                    Reported
                  </span>
                  <span className="text-[11px] font-medium text-amber-900/80 dark:text-amber-300/80">
                    Media Dispatch ({ipo.reported_source || 'News Wire'}):
                  </span>
                </div>
                <p className="italic text-amber-900 dark:text-amber-200 leading-relaxed">
                  &quot;{ipo.reported_note}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Quick Value Box */}
          <div className="lg:w-80 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-100 dark:border-zinc-800 space-y-3 shrink-0">
            <div>
              <span className="text-xs text-zinc-500 block mb-0.5">Price Band</span>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                {ipo.price_band_low && ipo.price_band_high
                  ? `${ipo.currency === 'USD' ? '$' : '₹'}${ipo.price_band_low} – ${ipo.currency === 'USD' ? '$' : '₹'}${ipo.price_band_high}`
                  : ipo.issue_price
                  ? `${ipo.currency === 'USD' ? '$' : '₹'}${ipo.issue_price}`
                  : ipo.filing_status === 'confidentially_filed'
                  ? 'Not announced'
                  : 'Not available'}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Min. Retail Application:</span>
              <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {minInvestment
                  ? `${ipo.currency === 'USD' ? '$' : '₹'}${minInvestment.toLocaleString('en-IN')}`
                  : ipo.filing_status === 'confidentially_filed'
                  ? 'Not announced'
                  : 'Not available'}
              </span>
            </div>

            {/* RULE 1: Dedicated Private Valuation Section */}
            {ipo.last_private_valuation && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-0.5">
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                  Last Private Valuation:
                </span>
                <span className="text-base font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                  {ipo.last_private_valuation}
                </span>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  Private round valuation. Not public offering price.
                </p>
              </div>
            )}

            {/* RULE 3: Disabled Notify Me button */}
            {(ipo.disable_bidding || ipo.filing_status === 'confidentially_filed') && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-semibold cursor-not-allowed border border-zinc-300 dark:border-zinc-700/60"
                >
                  <Bell className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  Notify me (Bidding Not Open)
                </button>
              </div>
            )}

            {/* Listing Gain or Latest GMP */}
            {ipo.status === 'listed' && listingGain ? (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">Listing Gain:</span>
                <span
                  className={`font-mono font-bold ${
                    listingGain.absoluteGain >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {listingGain.absoluteGain >= 0 ? '+' : ''}
                  ₹{listingGain.absoluteGain} ({listingGain.percentageGain}%)
                </span>
              </div>
            ) : ipo.latest_gmp ? (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium">Latest GMP:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +₹{ipo.latest_gmp.gmp_value}
                  </span>
                </div>
                <div>
                  <GmpDisclaimerBadge short />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* DATES TIMELINE (Chronological Progress Tracker) */}
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Issue Schedule & Important Dates (IST)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {timeline.map((item, idx) => {
            const isAvailable = Boolean(item.date);
            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-2">
                    <span>Step 0{idx + 1}</span>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {item.label}
                  </h4>
                </div>

                <div className="mt-3">
                  <span
                    className={`font-mono text-sm font-bold ${
                      isAvailable ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 font-normal'
                    }`}
                  >
                    {isAvailable ? formatISTDate(item.date) : 'Not available'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* KEY DETAILS GRID & CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Key Parameters */}
        <div className="lg:col-span-2 space-y-8">
          {/* Issue Parameters Card */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Key Issue Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block mb-1">Lot Size</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                  {ipo.lot_size ? `${ipo.lot_size} Shares` : 'Not available'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block mb-1">Total Issue Size</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                  {ipo.issue_size_cr ? `₹${ipo.issue_size_cr.toLocaleString('en-IN')} Cr` : 'Not available'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block mb-1">Fresh Issue</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                  {ipo.fresh_issue_cr ? `₹${ipo.fresh_issue_cr.toLocaleString('en-IN')} Cr` : 'Not available'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block mb-1">Offer for Sale (OFS)</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                  {ipo.ofs_cr !== null && ipo.ofs_cr !== undefined
                    ? `₹${ipo.ofs_cr.toLocaleString('en-IN')} Cr`
                    : 'Not available'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block mb-1">Final Issue Price</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                  {ipo.issue_price ? `₹${ipo.issue_price}` : 'Not available'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block mb-1">Listing Debut Price</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                  {ipo.listing_price ? `₹${ipo.listing_price}` : 'Not available'}
                </span>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION TABLE */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Subscription Demand Breakdown
              </h3>
              {ipo.latest_subscription && (
                <span className="text-[11px] text-zinc-400">
                  As of {formatISTDateTime(ipo.latest_subscription.recorded_at)}
                </span>
              )}
            </div>

            {ipo.subscription_history && ipo.subscription_history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-850/70 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date (IST)</th>
                      <th className="py-2.5 px-3">QIB (x)</th>
                      <th className="py-2.5 px-3">NII / HNI (x)</th>
                      <th className="py-2.5 px-3">Retail (x)</th>
                      <th className="py-2.5 px-3">Total (x)</th>
                      <th className="py-2.5 px-3 text-right">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {ipo.subscription_history.map((sub) => (
                      <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
                        <td className="py-2.5 px-3 text-zinc-800 dark:text-zinc-200 font-sans">
                          {formatISTDate(sub.recorded_at)}
                        </td>
                        <td className="py-2.5 px-3">{sub.qib_x ? `${sub.qib_x}x` : 'Not available'}</td>
                        <td className="py-2.5 px-3">{sub.nii_x ? `${sub.nii_x}x` : 'Not available'}</td>
                        <td className="py-2.5 px-3">{sub.retail_x ? `${sub.retail_x}x` : 'Not available'}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">
                          {sub.total_x ? `${sub.total_x}x` : 'Not available'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans text-zinc-400 text-[11px]">
                          {sub.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-850/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                No subscription figures recorded yet. Exchange bidding telemetry will be published once
                bidding commences.
              </div>
            )}
          </div>

          {/* GMP HISTORY TABLE (Rule 4: strictly unofficial time series) */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Grey Market Premium (GMP) Time Series
              </h3>
              <GmpDisclaimerBadge />
            </div>

            {ipo.gmp_history && ipo.gmp_history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-850/70 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Survey Recorded (IST)</th>
                      <th className="py-2.5 px-3">GMP (₹)</th>
                      <th className="py-2.5 px-3">Est. Listing Price</th>
                      <th className="py-2.5 px-3 text-right">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {ipo.gmp_history.map((gmp) => {
                      const basePrice = ipo.price_band_high || ipo.issue_price;
                      const estListing = basePrice ? basePrice + gmp.gmp_value : null;

                      return (
                        <tr key={gmp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
                          <td className="py-2.5 px-3 text-zinc-800 dark:text-zinc-200 font-sans">
                            {formatISTDateTime(gmp.recorded_at)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">
                            +₹{gmp.gmp_value}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                            {estListing ? `₹${estListing}` : 'Not available'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-sans text-zinc-400 text-[11px]">
                            {gmp.source}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-850/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                No unofficial GMP transactions recorded for this issue.
              </div>
            )}
          </div>

          {/* FINANCIALS TABLE */}
          {ipo.financials && ipo.financials.length > 0 && (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Financial Summary (₹ in Crores)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-850/70 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Total Revenue</th>
                      <th className="py-2.5 px-3">Profit After Tax (PAT)</th>
                      <th className="py-2.5 px-3">Net Worth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {ipo.financials.map((fin) => (
                      <tr key={fin.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40">
                        <td className="py-2.5 px-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                          {fin.fiscal_year}
                        </td>
                        <td className="py-2.5 px-3">
                          {fin.revenue ? `₹${fin.revenue} Cr` : 'Not available'}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">
                          {fin.profit ? `₹${fin.profit} Cr` : 'Not available'}
                        </td>
                        <td className="py-2.5 px-3">
                          {fin.net_worth ? `₹${fin.net_worth} Cr` : 'Not available'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Calculator, Intermediaries & Filings */}
        <div className="space-y-6">
          {/* Interactive Lot Calculator */}
          <IpoLotCalculator
            price={ipo.price_band_high || ipo.issue_price}
            lotSize={ipo.lot_size}
            gmpValue={ipo.latest_gmp?.gmp_value}
          />

          {/* Registrar & Intermediaries */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 shadow-xs space-y-4 text-xs">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Registrar & Intermediaries
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-zinc-400 block mb-0.5">Registrar to Issue</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {ipo.registrar || 'Not available'}
                </span>
              </div>

              <div>
                <span className="text-zinc-400 block mb-0.5">Book Running Lead Managers</span>
                {ipo.lead_managers && ipo.lead_managers.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-700 dark:text-zinc-300">
                    {ipo.lead_managers.map((mgr, i) => (
                      <li key={i}>{mgr}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-400">Not available</span>
                )}
              </div>
            </div>
          </div>

          {/* Official Prospectus Filings */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 shadow-xs space-y-3 text-xs">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Official Filings
            </h4>

            <div className="space-y-2">
              {ipo.drhp_url ? (
                <a
                  href={ipo.drhp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    Draft Red Herring Prospectus (DRHP)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              ) : (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 text-zinc-400">
                  DRHP document not available
                </div>
              )}

              {ipo.rhp_url ? (
                <a
                  href={ipo.rhp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    Red Herring Prospectus (RHP)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              ) : (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 text-zinc-400">
                  RHP document not available
                </div>
              )}
            </div>
          </div>

          {/* Source Attribution Box (Rule 6) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/40 p-4 text-[11px] text-zinc-500 space-y-1">
            <p>
              <strong className="text-zinc-700 dark:text-zinc-300">Data Source:</strong> {ipo.source}
            </p>
            <p>
              <strong className="text-zinc-700 dark:text-zinc-300">Last Verified:</strong>{' '}
              {formatISTDateTime(ipo.updated_at)}
            </p>
            {ipo.source_url && (
              <p>
                <a
                  href={ipo.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  Verify at Source Portal <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
            {ipo.external_links && ipo.external_links.length > 0 && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                <strong className="text-zinc-700 dark:text-zinc-300 block">Official Links & Filings:</strong>
                <div className="flex flex-col gap-1">
                  {ipo.external_links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      {link.label} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {ipo.source_note && (
              <p className="pt-2 text-amber-700 dark:text-amber-400 font-medium leading-relaxed border-t border-zinc-200 dark:border-zinc-800 mt-2">
                <strong>Source & Reliability Note:</strong> {ipo.source_note}
              </p>
            )}
            {ipo.footer_disclaimer && (
              <div className="p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 text-[10px] text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 leading-relaxed mt-2 flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{ipo.footer_disclaimer}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
