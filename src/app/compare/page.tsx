import React from 'react';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { CompareIpoClient } from '@/components/compare/CompareIpoClient';
import { PartialFailureBanner } from '@/components/ui/PartialFailureBanner';
import { GitCompare } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Compare IPOs Side-by-Side: Price, Lot Size & GMP | LiveIPOTracker',
  description:
    'Compare 2 to 3 Indian and global IPOs side-by-side. Analyze price bands, issue sizes, subscription demand multiples, and unofficial grey market premiums.',
  canonicalPath: '/compare',
});

import { connection } from 'next/server';

export default async function ComparePage() {
  await connection();
  const provider = getIpoProvider();
  const allIpos = await provider.getIpos();
  const fmpStatus = provider.getFmpFetchResult();

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'Compare IPOs', path: '/compare' }]} />

      <PartialFailureBanner
        selectedRange={{ from: 'Previous 180 days', to: 'Next 90 days' }}
        lastSuccessfulUpdate={fmpStatus?.fetchedAt}
        windows={fmpStatus?.windows}
        isComplete={fmpStatus?.isComplete}
        errorMessage={fmpStatus?.errorMessage}
      />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <GitCompare className="w-3.5 h-3.5" />
          Comparative Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Compare IPOs Side-by-Side
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Select up to 3 Initial Public Offerings to perform a direct side-by-side evaluation of
          valuations, bidding schedules, subscription demand, and unofficial grey market premiums.
        </p>
      </div>

      <CompareIpoClient initialIpos={allIpos} />
    </div>
  );
}
