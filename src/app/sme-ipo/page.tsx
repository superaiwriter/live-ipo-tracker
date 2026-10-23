import React from 'react';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { IPOTable } from '@/components/ipo/IPOTable';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Layers } from 'lucide-react';

import { connection } from 'next/server';

export const metadata: Metadata = constructMetadata({
  title: 'SME IPO Tracker: NSE Emerge & BSE SME Platforms | LiveIPOTracker',
  description:
    'Real-time tracking of SME initial public offerings on NSE Emerge and BSE SME platforms. Minimum lot applications, anchor allotments, and subscription data.',
  canonicalPath: '/sme-ipo',
});

export default async function SmeIpoPage() {
  await connection();
  const provider = getIpoProvider();
  const smeIpos = await provider.getIpos({ segment: 'sme' });

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'SME IPOs', path: '/sme-ipo' }]} />
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3 border border-indigo-500/20">
          <Layers className="w-3.5 h-3.5" />
          NSE Emerge & BSE SME Platforms
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Small and Medium Enterprise (SME) IPOs
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
          Emerging high-growth enterprise public issues subject to dedicated SME listing norms,
          minimum lot applications, and market maker liquidity windows.
        </p>
      </div>

      <IPOTable
        ipos={smeIpos}
        initialSegment="sme"
        title="SME IPO Directory"
        hideFilters={false}
      />
    </div>
  );
}
