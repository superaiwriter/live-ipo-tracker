import React from 'react';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { IPOTable } from '@/components/ipo/IPOTable';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Calendar } from 'lucide-react';

import { PartialFailureBanner } from '@/components/ui/PartialFailureBanner';

import { connection } from 'next/server';

export const metadata: Metadata = constructMetadata({
  title: 'Upcoming IPO Pipeline & Calendar India | LiveIPOTracker',
  description:
    'Complete pipeline of upcoming Mainboard and SME IPOs filed with SEBI. Scheduled issue dates, price bands, issue sizes, and draft prospectuses.',
  canonicalPath: '/upcoming-ipo',
});

export default async function UpcomingIpoPage() {
  await connection();
  const provider = getIpoProvider();
  const upcomingIpos = await provider.getIpos({ status: 'upcoming' });
  const fmpStatus = provider.getFmpFetchResult();

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'Upcoming IPOs', path: '/upcoming-ipo' }]} />

      <PartialFailureBanner
        selectedRange={{ from: 'Previous 180 days', to: 'Next 90 days' }}
        lastSuccessfulUpdate={fmpStatus?.fetchedAt}
        windows={fmpStatus?.windows}
        isComplete={fmpStatus?.isComplete}
        errorMessage={fmpStatus?.errorMessage}
      />
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20">
          <Calendar className="w-3.5 h-3.5" />
          Scheduled Issues
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Upcoming IPO Pipeline
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
          Companies that have filed their Red Herring Prospectus (RHP) with SEBI and scheduled their
          issue dates for the upcoming weeks.
        </p>
      </div>

      <IPOTable
        ipos={upcomingIpos}
        initialStatus="upcoming"
        title="Upcoming Pipeline Directory"
        hideFilters={false}
      />
    </div>
  );
}
