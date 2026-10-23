'use client';

import React, { useState } from 'react';
import { Calculator, Plus, Minus } from 'lucide-react';
import { GmpDisclaimerBadge } from '@/components/ui/GmpDisclaimerBadge';

interface IpoLotCalculatorProps {
  price: number | null;
  lotSize: number | null;
  gmpValue?: number | null;
}

export const IpoLotCalculator: React.FC<IpoLotCalculatorProps> = ({
  price,
  lotSize,
  gmpValue,
}) => {
  const [lots, setLots] = useState(1);

  if (!price || !lotSize) {
    return (
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs text-zinc-500">
        Lot calculator not available until price band and lot size are announced.
      </div>
    );
  }

  const totalShares = lots * lotSize;
  const totalAmount = totalShares * price;
  const estimatedProfit = gmpValue ? totalShares * gmpValue : null;

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-500" />
          Retail Application Calculator
        </h4>
        <span className="text-[11px] font-mono text-zinc-500">
          ₹{price} / share • {lotSize} sh/lot
        </span>
      </div>

      {/* Lot Counter */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-100 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Number of Lots:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLots((prev) => Math.max(1, prev - 1))}
            disabled={lots <= 1}
            className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center font-bold font-mono text-sm">{lots}</span>
          <button
            type="button"
            onClick={() => setLots((prev) => Math.min(30, prev + 1))}
            disabled={totalAmount >= 200000} // SEBI Retail UPI limit is ₹2,00,000
            className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/40 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-500 block mb-0.5">Total Shares</span>
          <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
            {totalShares.toLocaleString('en-IN')} shares
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/40 border border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-500 block mb-0.5">Amount to Block</span>
          <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Estimated Gain if GMP exists */}
      {estimatedProfit !== null && (
        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-emerald-950 dark:text-emerald-300 font-medium">
              Estimated Listing Profit (GMP based):
            </span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
              +₹{estimatedProfit.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <GmpDisclaimerBadge />
          </div>
        </div>
      )}

      {totalAmount > 200000 && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400">
          *Note: Applications above ₹2,00,000 fall under the High Net-worth Individual (HNI/NII)
          category rather than Retail.
        </p>
      )}
    </div>
  );
};
