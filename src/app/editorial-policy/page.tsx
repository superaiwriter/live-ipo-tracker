import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Newspaper, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Editorial Policy & Data Provenance Standards | LiveIPOTracker',
  description:
    'Our rigorous standards for financial data sourcing: zero data fabrication, permitted circular ingestion, clear GMP unofficial disclaimers, and transparent corrections.',
  canonicalPath: '/editorial-policy',
});

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'Editorial Policy', path: '/editorial-policy' }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Newspaper className="w-3.5 h-3.5" />
          Standards of Journalistic & Data Integrity
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Editorial & Sourcing Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          How LiveIPOTracker gathers, verifies, timestamps, and presents capital market information
          without compromise.
        </p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300">
        {/* Policy 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            1. Zero Fabrication Standard
          </h2>
          <p className="leading-relaxed">
            We will never fabricate, simulate, or generate hypothetical IPO issue prices, GMP numbers,
            subscription multiples, or debut returns to generate clicks or artificial engagement. If an
            official prospectus has not established a price band or issue size, that metric will display
            &quot;Not available&quot;.
          </p>
        </div>

        {/* Policy 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            2. Permitted Sourcing & Copyright Compliance
          </h2>
          <p className="leading-relaxed">
            LiveIPOTracker strictly respects copyright laws and website terms of service. We do not
            scrape platforms whose terms prohibit automated ingestion. All official disclosures are
            verified from authorized exchange public bulletins (BSE & NSE), SEBI filings, or registered
            Registrar publications.
          </p>
        </div>

        {/* Policy 3 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            3. Treatment of Grey Market Premium (GMP)
          </h2>
          <p className="leading-relaxed">
            Grey Market Premium is an informal, unofficial transaction price between private parties.
            We explicitly badge all GMP figures with <em>&quot;Unofficial, not a forecast&quot;</em>. We store GMP
            as an audited time-series with originating surveyor sources and timestamps, ensuring
            historical transparency without endorsing speculative trades.
          </p>
        </div>

        {/* Policy 4 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            4. Corrections & Errata Protocol
          </h2>
          <p className="leading-relaxed">
            Should an error occur due to amended exchange circulars or revised registrar basis of
            allotment documents, our editorial team corrects the entry promptly and logs the update
            time in Indian Standard Time (IST). Users can report discrepancies through our contact portal.
          </p>
        </div>
      </div>
    </div>
  );
}
