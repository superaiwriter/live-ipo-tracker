import React from 'react';
import Link from 'next/link';
import { IPOWithDetails } from '@/types/ipo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { GmpDisclaimerBadge } from '@/components/ui/GmpDisclaimerBadge';
import { WatchlistButton } from './WatchlistButton';
import { formatISTDate, formatISTDateTime } from '@/lib/dates';
import { calculateMinInvestment, calculateListingGain } from '@/lib/calculations';
import { getCurrencySymbol } from '@/utils/currency';
import {
  ArrowUpRight,
  AlertCircle,
  Building2,
  Bell,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

interface IPOCardProps {
  ipo: IPOWithDetails;
}

export const IPOCard: React.FC<IPOCardProps> = ({ ipo }) => {
  const currSym = getCurrencySymbol(ipo.currency);
  const isConfidential = ipo.filing_status === 'confidentially_filed' || ipo.status === 'confidentially_filed';

  const priceBandText =
    ipo.price_band_low && ipo.price_band_high
      ? `${currSym}${ipo.price_band_low} – ${currSym}${ipo.price_band_high}`
      : ipo.issue_price
      ? `${currSym}${ipo.issue_price}`
      : ipo.raw_price
      ? ipo.raw_price
      : isConfidential
      ? 'Not announced'
      : 'Not available';

  const minInvestment = calculateMinInvestment(
    ipo.price_band_high || ipo.issue_price,
    ipo.lot_size
  );

  const gainResult = calculateListingGain(ipo.issue_price, ipo.listing_price);

  return (
    <div className="relative group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
      {/* Top Header: Badges & Watchlist */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={ipo.status} />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                ipo.segment === 'mainboard'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {ipo.segment === 'mainboard' ? 'Mainboard' : 'SME Platform'}
            </span>

            {/* RULE 2: Official Data Badge */}
            {ipo.source_type === 'official' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Official Source
              </span>
            )}

            {ipo.is_demo && <DemoBadge />}
            {ipo.has_conflict && (
              <span
                title={ipo.conflict_details?.join('; ') || 'Provider data conflict'}
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-medium"
              >
                <AlertCircle className="w-3 h-3" /> Conflict
              </span>
            )}
          </div>

          <WatchlistButton ipoId={ipo.id} companyName={ipo.company_name} />
        </div>

        {/* Company Title & Sub-title */}
        <Link href={`/ipo/${ipo.slug}`} className="block group-hover:text-emerald-600 transition-colors">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
            {ipo.company_name}
          </h3>
          {ipo.sub_title ? (
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mt-0.5">
              {ipo.sub_title}
            </p>
          ) : (
            <p className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              {ipo.symbol ? `${ipo.symbol}` : 'Ticker not declared'}
              {ipo.exchange && ipo.exchange !== 'UNKNOWN' ? ` • ${ipo.exchange}` : ''}
              {ipo.country ? ` (${ipo.country})` : ''}
            </p>
          )}
          {ipo.sub_title && (
            <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
              Ticker: {ipo.symbol || 'Not announced'} • Exchange: {ipo.exchange && ipo.exchange !== 'UNKNOWN' ? ipo.exchange : 'Not announced'}
            </p>
          )}
        </Link>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-100 dark:border-zinc-800/60 text-xs">
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">
              Price Band
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              {priceBandText}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">
              Lot Size / Min Inv.
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              {ipo.lot_size ? `${ipo.lot_size} shares` : isConfidential ? 'Not announced' : 'Not available'}
              {minInvestment ? ` (${currSym}${minInvestment.toLocaleString()})` : ''}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">
              Issue Size
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              {ipo.issue_size_cr
                ? `${currSym}${ipo.issue_size_cr.toLocaleString()} Cr`
                : ipo.deal_size
                ? `${currSym}${(ipo.deal_size / 1000000).toFixed(1)}M`
                : isConfidential
                ? 'Not announced'
                : 'Not available'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-0.5">
              Bidding / Subscription Window
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {ipo.open_date && ipo.close_date
                ? `${formatISTDate(ipo.open_date)} – ${formatISTDate(ipo.close_date)}`
                : ipo.listing_date
                ? formatISTDate(ipo.listing_date)
                : isConfidential
                ? 'Not announced'
                : 'Not available'}
            </span>
          </div>

          {/* IPO / Listing Date Row */}
          <div className="col-span-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400">IPO / Listing Date:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {ipo.listing_date_note || (ipo.listing_date ? formatISTDate(ipo.listing_date) : 'Not confirmed')}
            </span>
          </div>
        </div>

        {/* RULE 1: Dedicated Private Valuation Section (Never mixed with price band or issue size) */}
        {ipo.last_private_valuation && (
          <div className="my-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                Last Private Valuation:
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
                {ipo.last_private_valuation}
              </span>
            </div>
            <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80">
              Private funding round valuation. Not public offering price or issue size.
            </p>
          </div>
        )}

        {/* RULE 2: Reported Data Section marked with distinct 'Reported' badge */}
        {ipo.reported_note && (
          <div className="my-2 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                Reported
              </span>
              <span className="text-[11px] font-medium text-amber-900/80 dark:text-amber-300/80">
                Media Intelligence:
              </span>
            </div>
            <p className="text-xs italic text-amber-900 dark:text-amber-200 leading-relaxed">
              &quot;{ipo.reported_note}&quot;
            </p>
          </div>
        )}

        {/* RULE 3: Disabled 'Notify Me' button instead of any Apply/Bid button */}
        {(ipo.disable_bidding || isConfidential) && (
          <div className="mt-3">
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 text-xs font-semibold cursor-not-allowed border border-zinc-200 dark:border-zinc-700/60"
            >
              <Bell className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              Notify me (Pre-IPO / Bidding Not Open)
            </button>
          </div>
        )}

        {/* Dynamic Section: Listing Gain OR Latest GMP */}
        {ipo.status === 'listed' && gainResult ? (
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs flex items-center justify-between">
            <span className="text-purple-900 dark:text-purple-300 font-medium">Listing Gain:</span>
            <span
              className={`font-bold font-mono ${
                gainResult.absoluteGain >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {gainResult.absoluteGain >= 0 ? '+' : ''}
              {currSym}{gainResult.absoluteGain} ({gainResult.percentageGain}%)
            </span>
          </div>
        ) : ipo.latest_gmp ? (
          <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Latest GMP:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{currSym}{ipo.latest_gmp.gmp_value}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <GmpDisclaimerBadge short />
              <span className="text-[10px] text-zinc-400">
                Source: {ipo.latest_gmp.source}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Card Footer: Source, External Links & Last Updated */}
      <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500">Official source:</span>
            {ipo.source_url ? (
              <a
                href={ipo.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                title="Verify at original source"
              >
                {ipo.source || 'Announcement'}
              </a>
            ) : (
              <span className="font-medium text-zinc-600 dark:text-zinc-300">{ipo.source || 'Not available'}</span>
            )}

            {ipo.external_links && ipo.external_links.length > 0 && (
              <>
                <span className="text-zinc-400">•</span>
                {ipo.external_links.map((link, idx) => (
                  <React.Fragment key={link.label}>
                    {idx > 0 && <span className="text-zinc-400">|</span>}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      {link.label}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Last updated: {formatISTDate(ipo.updated_at)}</span>
            <Link
              href={`/ipo/${ipo.slug}`}
              className="inline-flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 transition-colors shrink-0"
            >
              Details
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Existing source note if present */}
        {ipo.source_note && !ipo.reported_note && (
          <div className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800/40 leading-relaxed">
            <strong>Note:</strong> {ipo.source_note}
          </div>
        )}

        {/* RULE 4: Mandatory Confidential Filing Footer Disclaimer */}
        {ipo.footer_disclaimer && (
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed flex items-start gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{ipo.footer_disclaimer}</span>
          </div>
        )}
      </div>
    </div>
  );
};
