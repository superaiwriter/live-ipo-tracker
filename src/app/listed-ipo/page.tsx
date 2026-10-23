import React from 'react';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { IPOTable } from '@/components/ipo/IPOTable';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { CheckCircle2 } from 'lucide-react';

import { PartialFailureBanner } from '@/components/ui/PartialFailureBanner';

import { connection } from 'next/server';

export const metadata: Metadata = constructMetadata({
  title: 'Recently Listed IPOs: Debut Prices & Listing Gains | LiveIPOTracker',
  description:
    'Track performance of recent Indian and global IPO listings. Compare issue prices against debut listing prices, percentage listing gains, and historical returns.',
  canonicalPath: '/listed-ipo',
});

export default async function ListedIpoPage() {
  await connection();
  const provider = getIpoProvider();
  const listedIpos = await provider.getIpos({ status: 'listed' });
  const fmpStatus = provider.getFmpFetchResult();

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'Listed IPOs', path: '/listed-ipo' }]} />

      <PartialFailureBanner
        selectedRange={{ from: 'Previous 180 days', to: 'Next 90 days' }}
        lastSuccessfulUpdate={fmpStatus?.fetchedAt}
        windows={fmpStatus?.windows}
        isComplete={fmpStatus?.isComplete}
        errorMessage={fmpStatus?.errorMessage}
      />
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-3 border border-purple-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Market Debuts
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Recently Listed IPOs
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
          Historical records of recent exchange listings with listing price performance, debut gains,
          and final issue valuations.
        </p>
      </div>

      <IPOTable
        ipos={listedIpos}
        initialStatus="listed"
        title="Recently Listed Directory"
        hideFilters={false}
      />
    </div>
  );
}
