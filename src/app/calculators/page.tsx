'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  computeListingGain,
  computeProfitLoss,
  computeLotQuotaTiers,
} from '@/lib/calculators';
import { Calculator, TrendingUp, DollarSign, Layers, Info } from 'lucide-react';

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<'gain' | 'pnl' | 'lot'>('gain');

  // Listing Gain State
  const [gainIssuePrice, setGainIssuePrice] = useState(500);
  const [gainExpectedPrice, setGainExpectedPrice] = useState(625);
  const [gainLotSize, setGainLotSize] = useState(30);
  const [gainLots, setGainLots] = useState(1);

  // Profit/Loss State
  const [pnlBuyPrice, setPnlBuyPrice] = useState(300);
  const [pnlSellPrice, setPnlSellPrice] = useState(375);
  const [pnlShares, setPnlShares] = useState(100);
  const [pnlIncludeCharges, setPnlIncludeCharges] = useState(true);

  // Lot Size State
  const [lotPrice, setLotPrice] = useState(450);
  const [lotSizeValue, setLotSizeValue] = useState(33);

  // Computations
  const gainResult = computeListingGain({
    issuePrice: gainIssuePrice,
    expectedListingPrice: gainExpectedPrice,
    lotSize: gainLotSize,
    numberOfLots: gainLots,
  });

  const pnlResult = computeProfitLoss({
    buyPrice: pnlBuyPrice,
    sellPrice: pnlSellPrice,
    shares: pnlShares,
    includeCharges: pnlIncludeCharges,
  });

  const quotaTiers = computeLotQuotaTiers(lotPrice, lotSizeValue);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'Calculators', path: '/calculators' }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Calculator className="w-3.5 h-3.5" />
          Interactive Investor Tools
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          IPO Investment Calculators
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Accurate, client-side financial tools to evaluate potential debut gains, net trading
          returns with statutory charges, and retail vs HNI lot allocations.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gain')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'gain'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Listing Gain Calculator
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'pnl'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-blue-500" />
          Net Profit / Loss (P&L)
        </button>

        <button
          onClick={() => setActiveTab('lot')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'lot'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-500" />
          Lot Sizing & Quotas
        </button>
      </div>

      {/* TAB 1: LISTING GAIN CALCULATOR */}
      {activeTab === 'gain' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Input Parameters
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">Issue Price (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={gainIssuePrice}
                  onChange={(e) => setGainIssuePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">
                  Expected Listing Debut Price (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  value={gainExpectedPrice}
                  onChange={(e) => setGainExpectedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Lot Size (Shares)</label>
                  <input
                    type="number"
                    min={1}
                    value={gainLotSize}
                    onChange={(e) => setGainLotSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Number of Lots</label>
                  <input
                    type="number"
                    min={1}
                    value={gainLots}
                    onChange={(e) => setGainLots(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="p-6 rounded-3xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Estimated Debut Return
              </span>
              <div
                className={`text-3xl sm:text-4xl font-extrabold font-mono ${
                  (gainResult?.totalGain || 0) >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600'
                }`}
              >
                {(gainResult?.totalGain || 0) >= 0 ? '+' : ''}₹
                {gainResult?.totalGain.toLocaleString('en-IN') || 0}
              </div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1 block">
                {gainResult?.percentageGain}% Listing Gain
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-700/60">
                <span className="text-[11px] text-zinc-400 block mb-0.5">Total Invested</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  ₹{gainResult?.totalInvestment.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-700/60">
                <span className="text-[11px] text-zinc-400 block mb-0.5">Total Value at Debut</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  ₹{gainResult?.totalEstimatedValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NET PROFIT/LOSS WITH STATUTORY CHARGES */}
      {activeTab === 'pnl' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Trade Parameters
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">
                  Allotment / Buy Price (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  value={pnlBuyPrice}
                  onChange={(e) => setPnlBuyPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Sell Price (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={pnlSellPrice}
                  onChange={(e) => setPnlSellPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Number of Shares</label>
                <input
                  type="number"
                  min={1}
                  value={pnlShares}
                  onChange={(e) => setPnlShares(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 text-zinc-600 dark:text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pnlIncludeCharges}
                  onChange={(e) => setPnlIncludeCharges(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include STT (0.1%), Stamp Duty (0.015%), Exchange Fees & GST</span>
              </label>
            </div>
          </div>

          {/* Results Box */}
          <div className="p-6 rounded-3xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Net Profit / Loss (Post-Charges)
              </span>
              <div
                className={`text-3xl sm:text-4xl font-extrabold font-mono ${
                  (pnlResult?.netProfitLoss || 0) >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600'
                }`}
              >
                {(pnlResult?.netProfitLoss || 0) >= 0 ? '+' : ''}₹
                {pnlResult?.netProfitLoss.toLocaleString('en-IN') || 0}
              </div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1 block">
                Net ROI: {pnlResult?.netRoiPercentage}%
              </span>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Gross P&L:</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                  ₹{pnlResult?.grossProfitLoss.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Securities Transaction Tax (STT):</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">
                  ₹{pnlResult?.sttCharge.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Total Statutory Charges:</span>
                <span className="font-mono font-semibold text-red-600">
                  -₹{pnlResult?.totalCharges.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOT SIZING & QUOTA TIERS */}
      {activeTab === 'lot' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Issue Price & Lot Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">Cap / Issue Price (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={lotPrice}
                  onChange={(e) => setLotPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Lot Size (Shares)</label>
                <input
                  type="number"
                  min={1}
                  value={lotSizeValue}
                  onChange={(e) => setLotSizeValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quotaTiers?.map((tier) => (
              <div
                key={tier.category}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    {tier.category}
                  </span>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    ₹{tier.minAmount.toLocaleString('en-IN')}
                    {tier.maxAmount ? ` – ₹${tier.maxAmount.toLocaleString('en-IN')}` : '+'}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{tier.description}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs space-y-1 font-mono text-zinc-700 dark:text-zinc-300">
                  <div className="flex justify-between">
                    <span>Allowed Lots:</span>
                    <span className="font-bold">
                      {tier.minLots} {tier.maxLots ? `to ${tier.maxLots}` : '+'} lots
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shares Range:</span>
                    <span>
                      {tier.minShares} {tier.maxShares ? `to ${tier.maxShares}` : '+'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
