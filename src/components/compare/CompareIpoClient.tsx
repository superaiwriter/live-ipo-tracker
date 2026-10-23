'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IPOWithDetails } from '@/types/ipo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { GmpDisclaimerBadge } from '@/components/ui/GmpDisclaimerBadge';
import { formatISTDate } from '@/lib/dates';
import { calculateMinInvestment } from '@/lib/calculations';
import { X, ArrowUpRight } from 'lucide-react';

export const CompareIpoClient: React.FC<{ initialIpos: IPOWithDetails[] }> = ({
  initialIpos,
}) => {
  // Preselect the first 2 IPOs if available
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return initialIpos.slice(0, 2).map((i) => i.id);
  });

  const selectedIpos = selectedIds
    .map((id) => initialIpos.find((i) => i.id === id))
    .filter(Boolean) as IPOWithDetails[];

  const availableToAdd = initialIpos.filter((i) => !selectedIds.includes(i.id));

  const addIpo = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeIpo = (id: string) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="space-y-6">
      {/* Selector Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            Comparing {selectedIpos.length} of 3 IPOs:
          </span>
          {selectedIpos.map((ipo) => (
            <span
              key={ipo.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
            >
              {ipo.symbol || ipo.company_name}
              <button
                onClick={() => removeIpo(ipo.id)}
                className="hover:text-red-500 transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        {selectedIds.length < 3 && availableToAdd.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Add an issue:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addIpo(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
            >
              <option value="">Select IPO to add...</option>
              {availableToAdd.map((ipo) => (
                <option key={ipo.id} value={ipo.id}>
                  {ipo.company_name} ({ipo.segment.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Grid Table */}
      {selectedIpos.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-400 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
          No IPOs selected. Use the selector above to pick issues to compare.
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-850/60 border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-4 px-4 w-48 font-bold text-zinc-500">Parameter</th>
                {selectedIpos.map((ipo) => (
                  <th key={ipo.id} className="py-4 px-4 min-w-[240px] align-top">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge status={ipo.status} />
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                          {ipo.segment}
                        </span>
                        {ipo.is_demo && <DemoBadge />}
                      </div>

                      <Link
                        href={`/ipo/${ipo.slug}`}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 block leading-snug"
                      >
                        {ipo.company_name}
                      </Link>

                      <div className="text-[11px] font-mono text-zinc-400">
                        {ipo.symbol ? `${ipo.symbol} • ${ipo.exchange}` : ipo.exchange}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {/* Price Band */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Price Band
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {ipo.price_band_low && ipo.price_band_high
                      ? `₹${ipo.price_band_low} – ₹${ipo.price_band_high}`
                      : ipo.issue_price
                      ? `₹${ipo.issue_price}`
                      : 'Not available'}
                  </td>
                ))}
              </tr>

              {/* Lot Size & Min Inv */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Lot Size / Min Retail
                </td>
                {selectedIpos.map((ipo) => {
                  const minInv = calculateMinInvestment(
                    ipo.price_band_high || ipo.issue_price,
                    ipo.lot_size
                  );
                  return (
                    <td key={ipo.id} className="py-3 px-4 font-mono">
                      <div>{ipo.lot_size ? `${ipo.lot_size} shares` : 'Not available'}</div>
                      {minInv && <div className="text-zinc-400 text-[11px]">₹{minInv.toLocaleString('en-IN')}</div>}
                    </td>
                  );
                })}
              </tr>

              {/* Total Issue Size */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Total Issue Size
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4 font-mono font-semibold">
                    {ipo.issue_size_cr ? `₹${ipo.issue_size_cr.toLocaleString('en-IN')} Cr` : 'Not available'}
                  </td>
                ))}
              </tr>

              {/* Fresh vs OFS */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Fresh Issue / OFS
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                    <div>Fresh: {ipo.fresh_issue_cr ? `₹${ipo.fresh_issue_cr} Cr` : 'TBA'}</div>
                    <div>OFS: {ipo.ofs_cr !== null ? `₹${ipo.ofs_cr} Cr` : 'TBA'}</div>
                  </td>
                ))}
              </tr>

              {/* Bidding Window */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Bidding Window (IST)
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4">
                    <div>{ipo.open_date ? formatISTDate(ipo.open_date) : 'TBA'}</div>
                    <div className="text-zinc-400 text-[11px]">
                      to {ipo.close_date ? formatISTDate(ipo.close_date) : 'TBA'} (5 PM)
                    </div>
                  </td>
                ))}
              </tr>

              {/* Allotment & Listing */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Allotment / Listing
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4 text-[11px]">
                    <div>Allotment: {ipo.allotment_date ? formatISTDate(ipo.allotment_date) : 'TBA'}</div>
                    <div>Listing: {ipo.listing_date ? formatISTDate(ipo.listing_date) : 'TBA'}</div>
                  </td>
                ))}
              </tr>

              {/* Latest GMP (Rule 4) */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Latest GMP (Unofficial)
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4">
                    {ipo.latest_gmp ? (
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-emerald-600 text-sm">
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
                ))}
              </tr>

              {/* Registrar */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Registrar
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                    {ipo.registrar || 'Not available'}
                  </td>
                ))}
              </tr>

              {/* Action Link */}
              <tr>
                <td className="py-3 px-4 font-semibold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-850/20">
                  Full Dossier
                </td>
                {selectedIpos.map((ipo) => (
                  <td key={ipo.id} className="py-3 px-4">
                    <Link
                      href={`/ipo/${ipo.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:underline"
                    >
                      View Deep Dive <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
