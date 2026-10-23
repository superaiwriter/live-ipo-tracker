import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Calculator, Clock, TrendingUp } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'How We Calculate IPO Status, Gains & Lot Metrics | LiveIPOTracker',
  description:
    'Full transparency into our computational formulas: deterministic IST status derivation, listing gain percentages, retail lot minimums, and unofficial GMP estimates.',
  canonicalPath: '/how-we-calculate',
});

export default function HowWeCalculatePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <Breadcrumbs items={[{ name: 'How We Calculate', path: '/how-we-calculate' }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Calculator className="w-3.5 h-3.5" />
          Algorithmic Transparency
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          How We Calculate
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Complete mathematical formulations and deterministic algorithms powering our status
          derivations, gain analytics, and financial calculators.
        </p>
      </div>

      <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-300">
        {/* Module 1: Status Derivation */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              1. Deterministic Status Derivation Engine (Rule 5)
            </h2>
          </div>
          <p className="leading-relaxed">
            Unlike portals that store a static arbitrary text flag (which frequently goes out of date),
            LiveIPOTracker computes the status dynamically on every query against Indian Standard Time
            (IST, UTC+05:30) using the canonical formula:
          </p>

          <div className="p-4 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-200 overflow-x-auto space-y-1.5 border border-zinc-800">
            <p className="text-emerald-400">{'// Derived in Asia/Kolkata (UTC+05:30)'}</p>
            <p>IF listing_price &gt; 0 THEN Status = &quot;listed&quot;</p>
            <p>ELSE IF now &gt;= listing_date (10:00:00 IST) THEN Status = &quot;listed&quot;</p>
            <p>ELSE IF now &gt; close_date (17:00:00 IST) THEN Status = &quot;closed&quot;</p>
            <p>ELSE IF now &gt;= open_date (00:00:00 IST) AND now &lt;= close_date (17:00:00 IST) THEN Status = &quot;open&quot;</p>
            <p>ELSE IF now &lt; open_date THEN Status = &quot;upcoming&quot;</p>
            <p>ELSE Status = &quot;unknown&quot;</p>
          </div>
        </section>

        {/* Module 2: Listing Gain */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              2. Listing Gain / Loss Formulation
            </h2>
          </div>
          <p className="leading-relaxed">
            Listing gain quantifies the debut performance relative to the price paid by successful
            allottees at issue allotment:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Absolute Gain (₹)
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Absolute Gain = Listing Price - Issue Price
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Percentage Gain (%)
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Percentage = ((Listing - Issue) / Issue) * 100
              </span>
            </div>
          </div>
        </section>

        {/* Module 3: Retail Lot Minimums */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              3. Minimum Retail Application & Lot Sizing
            </h2>
          </div>
          <p className="leading-relaxed">
            SEBI guidelines require that a single retail lot for Mainboard IPOs falls within the range
            of approximately ₹14,000 to ₹15,000. Our minimum application calculation uses:
          </p>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
            <span className="text-zinc-400 block mb-1">Minimum Investment (1 Lot)</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Amount = Price Band High (Cap Price) × Lot Size
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
