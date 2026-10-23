'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { IPOWithDetails, IpoSegment, IpoStatus } from '@/types/ipo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { GmpDisclaimerBadge } from '@/components/ui/GmpDisclaimerBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { WatchlistButton } from './WatchlistButton';
import { formatISTDate, formatISTDateTime } from '@/lib/dates';
import { calculateListingGain, calculateMinInvestment } from '@/lib/calculations';
import { getCurrencySymbol } from '@/utils/currency';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building2,
  AlertCircle,
} from 'lucide-react';

interface IPOTableProps {
  ipos: IPOWithDetails[];
  initialSegment?: IpoSegment;
  initialStatus?: IpoStatus;
  initialCountry?: string;
  initialExchange?: string;
  title?: string;
  hideFilters?: boolean;
}

type SortField = 'company_name' | 'open_date' | 'close_date' | 'issue_size_cr' | 'gmp';
type SortDirection = 'asc' | 'desc';

export const IPOTable: React.FC<IPOTableProps> = ({
  ipos,
  initialSegment,
  initialStatus,
  initialCountry,
  initialExchange,
  title,
  hideFilters = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>(initialSegment || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'all');
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry || 'all');
  const [selectedExchange, setSelectedExchange] = useState<string>(initialExchange || 'all');
  const [sortField, setSortField] = useState<SortField>('open_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Extract distinct countries and exchanges present in data
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    for (const ipo of ipos) {
      if (ipo.country) set.add(ipo.country);
    }
    return Array.from(set).sort();
  }, [ipos]);

  const availableExchanges = useMemo(() => {
    const set = new Set<string>();
    for (const ipo of ipos) {
      if (ipo.exchange && ipo.exchange !== 'UNKNOWN') set.add(ipo.exchange);
    }
    return Array.from(set).sort();
  }, [ipos]);

  // Filtering & Sorting
  const filteredIpos = useMemo(() => {
    return ipos
      .filter((ipo) => {
        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const nameMatch = ipo.company_name.toLowerCase().includes(term);
          const symbolMatch = ipo.symbol?.toLowerCase().includes(term);
          if (!nameMatch && !symbolMatch) return false;
        }

        // Segment filter
        if (selectedSegment !== 'all' && ipo.segment !== selectedSegment) {
          return false;
        }

        // Status filter
        if (
          selectedStatus !== 'all' &&
          ipo.status !== selectedStatus &&
          !(selectedStatus === 'upcoming' && ipo.status === 'confidentially_filed')
        ) {
          return false;
        }

        // Country filter
        if (selectedCountry !== 'all' && ipo.country?.toLowerCase() !== selectedCountry.toLowerCase()) {
          return false;
        }

        // Exchange filter
        if (selectedExchange !== 'all' && ipo.exchange?.toLowerCase() !== selectedExchange.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number | null = null;
        let valB: string | number | null = null;

        switch (sortField) {
          case 'company_name':
            valA = a.company_name.toLowerCase();
            valB = b.company_name.toLowerCase();
            break;
          case 'open_date':
            valA = a.open_date ? new Date(a.open_date).getTime() : 0;
            valB = b.open_date ? new Date(b.open_date).getTime() : 0;
            break;
          case 'close_date':
            valA = a.close_date ? new Date(a.close_date).getTime() : 0;
            valB = b.close_date ? new Date(b.close_date).getTime() : 0;
            break;
          case 'issue_size_cr':
            valA = a.issue_size_cr || 0;
            valB = b.issue_size_cr || 0;
            break;
          case 'gmp':
            valA = a.latest_gmp?.gmp_value || 0;
            valB = b.latest_gmp?.gmp_value || 0;
            break;
        }

        if (valA === valB) return 0;
        if (valA === null || valA === 0) return 1;
        if (valB === null || valB === 0) return -1;

        if (sortDirection === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [ipos, searchTerm, selectedSegment, selectedStatus, selectedCountry, selectedExchange, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredIpos.length / pageSize) || 1;
  const paginatedIpos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIpos.slice(start, start + pageSize);
  }, [filteredIpos, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Title, Search, Filters, Page Size */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {title && (
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {title}{' '}
              <span className="text-sm font-normal text-zinc-500">
                (Showing {filteredIpos.length} of {ipos.length} total)
              </span>
            </h2>
          )}

          {/* Search Input */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search company, ticker, exchange..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        {!hideFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            {/* Country Filter */}
            {availableCountries.length > 0 && (
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl text-xs">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Countries</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exchange Filter */}
            {availableExchanges.length > 0 && (
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl text-xs">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={selectedExchange}
                  onChange={(e) => {
                    setSelectedExchange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Exchanges</option>
                  {availableExchanges.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Segment Filter */}
            <select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
            >
              <option value="all">All Segments</option>
              <option value="mainboard">Mainboard</option>
              <option value="sme">SME</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="open">Live / Open</option>
              <option value="upcoming">Upcoming</option>
              <option value="confidentially_filed">Confidentially Filed</option>
              <option value="filed">Filed</option>
              <option value="priced">Priced</option>
              <option value="closed">Closed / Allotment</option>
              <option value="listed">Listed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Page Size Selector */}
            <div className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      {paginatedIpos.length === 0 ? (
        <EmptyState
          title="No IPOs match your criteria"
          description="Try adjusting your search query, country, exchange, or status filters."
          showSeedHint={ipos.length === 0}
        />
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-850/70 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4 w-10 text-center">
                    #
                  </th>
                  <th scope="col" className="py-3 px-4">
                    <button
                      onClick={() => handleSort('company_name')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Company & Symbol
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Country & Exchange
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Price Band / Issue Price
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Lot / Min Inv.
                  </th>
                  <th scope="col" className="py-3 px-4">
                    <button
                      onClick={() => handleSort('issue_size_cr')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Issue Size
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4">
                    <button
                      onClick={() => handleSort('open_date')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Bidding Window
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4">
                    <button
                      onClick={() => handleSort('gmp')}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white"
                    >
                      GMP / Gain
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Source & Audit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedIpos.map((ipo) => {
                  const currSym = getCurrencySymbol(ipo.currency);
                  const gain = calculateListingGain(ipo.issue_price, ipo.listing_price);
                  const minInv = calculateMinInvestment(
                    ipo.price_band_high || ipo.issue_price,
                    ipo.lot_size
                  );

                  return (
                    <tr
                      key={ipo.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/40 transition-colors"
                    >
                      {/* Watchlist toggle */}
                      <td className="py-3 px-4 text-center">
                        <WatchlistButton ipoId={ipo.id} companyName={ipo.company_name} />
                      </td>

                      {/* Company Name & Ticker */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <Link
                              href={`/ipo/${ipo.slug}`}
                              className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 transition-colors block text-[13px]"
                            >
                              {ipo.company_name}
                            </Link>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {ipo.symbol ? `${ipo.symbol}` : 'Ticker not declared'}
                            </span>
                          </div>
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
                      </td>

                      {/* Country & Exchange */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {ipo.country || 'Global'}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {ipo.exchange && ipo.exchange !== 'UNKNOWN' ? ipo.exchange : 'Unassigned'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={ipo.status} />
                      </td>

                      {/* Price Band */}
                      <td className="py-3 px-4 font-mono font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                        {ipo.price_band_low && ipo.price_band_high
                          ? `${currSym}${ipo.price_band_low} – ${currSym}${ipo.price_band_high}`
                          : ipo.issue_price
                          ? `${currSym}${ipo.issue_price}`
                          : 'Not available'}
                      </td>

                      {/* Lot Size */}
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                          {ipo.lot_size ? `${ipo.lot_size} sh.` : 'Not available'}
                        </div>
                        {minInv && (
                          <div className="text-[10px] text-zinc-400">
                            {currSym}{minInv.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Issue Size */}
                      <td className="py-3 px-4 font-mono font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                        {ipo.issue_size_cr
                          ? `${currSym}${ipo.issue_size_cr.toLocaleString()} Cr`
                          : ipo.deal_size
                          ? `${currSym}${(ipo.deal_size / 1000000).toFixed(1)}M`
                          : 'Not available'}
                      </td>

                      {/* Bidding Window */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {ipo.open_date ? formatISTDate(ipo.open_date) : 'TBA'}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          to {ipo.close_date ? formatISTDate(ipo.close_date) : 'TBA'}
                        </div>
                      </td>

                      {/* GMP or Listing Gain */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {ipo.status === 'listed' && gain ? (
                          <div className="font-mono">
                            <span
                              className={`font-bold ${
                                gain.absoluteGain >= 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}
                            >
                              {gain.absoluteGain >= 0 ? '+' : ''}
                              {currSym}{gain.absoluteGain} ({gain.percentageGain}%)
                            </span>
                            <div className="text-[10px] text-zinc-400">Listing Gain</div>
                          </div>
                        ) : ipo.latest_gmp ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              +{currSym}{ipo.latest_gmp.gmp_value}
                            </span>
                            <div>
                              <GmpDisclaimerBadge short />
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-400">Not available</span>
                        )}
                      </td>

                      {/* Source & Updated */}
                      <td className="py-3 px-4 text-right whitespace-nowrap text-[11px] text-zinc-400">
                        <div className="font-medium text-zinc-300">{ipo.source || 'Manual Admin'}</div>
                        <div className="text-[10px]">{formatISTDateTime(ipo.updated_at)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Pagination */}
          <div className="py-3 px-4 bg-zinc-50/70 dark:bg-zinc-850/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredIpos.length)} of {filteredIpos.length} records
              {filteredIpos.length !== ipos.length && ` (filtered from ${ipos.length} total)`}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 py-1 font-semibold text-zinc-700 dark:text-zinc-300">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
