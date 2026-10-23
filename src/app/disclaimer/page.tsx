import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { ShieldAlert, AlertTriangle, Info, TrendingDown, BookOpen, ExternalLink, Calculator } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Legal Disclaimer & Regulatory Risk Notice | LiveIPOTracker',
  description:
    'Mandatory SEBI regulatory disclosure: Not SEBI registered. Information is for educational purposes only. Market risk disclosures, SME volatility warnings, and unofficial GMP caveats.',
  canonicalPath: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'Legal Disclaimer', path: '/disclaimer' }]} />

      {/* Primary Mandatory Alert */}
      <div className="p-6 sm:p-7 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-amber-950 dark:text-amber-100">
            Mandatory Regulatory Notice & Risk Disclaimer
          </h1>
        </div>
        <p className="text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-200">
          Not SEBI registered. Information provided on LiveIPOTracker is strictly for educational, research, and informational purposes only and does NOT constitute financial, investment, legal, or tax advice.
        </p>
        <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
          &quot;Investments in securities market are subject to market risks. Read all scheme and offer-related documents (DRHP / RHP) carefully before investing.&quot;
        </p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {/* 1. SEBI RA / IA Disclosure */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-500" />
            1. No Investment Recommendation or Financial Solicitation
          </h2>
          <p>
            LiveIPOTracker is an independent market intelligence aggregator. Neither LiveIPOTracker, its founders, operators, nor contributors are registered with the Securities and Exchange Board of India (SEBI) as:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <li>Research Analysts under SEBI (Research Analysts) Regulations, 2014</li>
            <li>Investment Advisers under SEBI (Investment Advisers) Regulations, 2013</li>
            <li>Stock Brokers or Sub-Brokers under SEBI (Stock Brokers) Regulations, 1992</li>
            <li>Portfolio Managers under SEBI (Portfolio Managers) Regulations, 2020</li>
          </ul>
          <p>
            No content, table, metric, or calculation published on this platform constitutes a recommendation, endorsement, or advice to subscribe to, buy, hold, or sell any equity share, initial public offering, or financial security. Always consult a qualified, certified SEBI-registered financial advisor before committing capital.
          </p>
        </div>

        {/* 2. Unofficial Nature of GMP */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            2. Unofficial Nature of Grey Market Premium (GMP)
          </h2>
          <p>
            Grey Market Premium (GMP) figures displayed on LiveIPOTracker are informal survey figures collected from over-the-counter (OTC) dealers and unorganized market networks.
          </p>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Please note the following critical truths regarding Grey Market Premium:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <li>GMP is <strong>NOT</strong> authorized, regulated, or monitored by SEBI, the National Stock Exchange (NSE), or the Bombay Stock Exchange (BSE).</li>
            <li>GMP can be artificially influenced or manipulated by market cartels and bears no official status.</li>
            <li>GMP changes rapidly based on macro market sentiment and should <strong>NEVER</strong> be regarded as a guarantee, projection, or forecast of actual listing-day price performance.</li>
          </ul>
        </div>

        {/* 3. High Risk Warning for SME IPOs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            3. Specific High-Risk Warning for SME Platform Offerings
          </h2>
          <p>
            Initial public offerings listed on the <strong>NSE Emerge</strong> and <strong>BSE SME</strong> platforms carry significantly higher structural risks than Mainboard issues:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">High Minimum Lot Size:</strong>
              SME IPOs require substantial minimum application ticket sizes (frequently ₹1,00,000 to ₹1,50,000+), concentrating retail exposure.
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">Limited Post-Listing Liquidity:</strong>
              SME trading occurs in lot multiples, making timely exit difficult during market downturns.
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">Early Operating History:</strong>
              Emerging enterprises often possess shorter track records and smaller capitalization buffers.
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">Volatile Swings:</strong>
              Price discovery on SME bourses can be subject to extreme percentage volatility.
            </div>
          </div>
        </div>

        {/* 4. DRHP / RHP Verification */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            4. Primacy of the Red Herring Prospectus (RHP)
          </h2>
          <p>
            Investors are advised to base any investment decision solely on the complete contents of the Draft Red Herring Prospectus (DRHP) or Red Herring Prospectus (RHP) filed by the issuer with the Registrar of Companies (ROC) and SEBI.
          </p>
          <p>
            Official filings can be downloaded directly from the official portals of <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 hover:underline">SEBI <ExternalLink className="w-3 h-3" /></a>, <a href="https://www.nseindia.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 hover:underline">NSE India <ExternalLink className="w-3 h-3" /></a>, and <a href="https://www.bseindia.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 hover:underline">BSE India <ExternalLink className="w-3 h-3" /></a>.
          </p>
        </div>

        {/* 5. Calculators & Estimations */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            5. Financial Calculators & Mathematical Approximations
          </h2>
          <p>
            Any calculators, listing gain estimators, lot size cost computations, or subscription demand projections available on LiveIPOTracker are purely illustrative mathematical models. They do not account for brokerage commissions, Securities Transaction Tax (STT), capital gains taxation, or slippage.
          </p>
        </div>

        {/* 6. Allotment Status Links */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            6. External Registrar Portals
          </h2>
          <p>
            Allotment status inquiry links provided on LiveIPOTracker redirect directly to certified registrar databases (e.g. Link Intime, KFin Technologies, Bigshare Services). LiveIPOTracker has no role in the allotment allotment basis, share credit, or refund mandate unblocking process.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            If you notice any typographical or data error on our platform, please report it via our <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">Contact & Errata Desk</Link> so our team can verify and rectify it promptly.
          </p>
        </div>
      </div>
    </div>
  );
}
