import React from 'react';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { IpoCalendarView } from '@/components/calendar/IpoCalendarView';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Calendar } from 'lucide-react';

import { PartialFailureBanner } from '@/components/ui/PartialFailureBanner';

import { connection } from 'next/server';

export const metadata: Metadata = constructMetadata({
  title: 'IPO Calendar India: Bidding Dates, Allotment & Listing Schedule | LiveIPOTracker',
  description:
    'Comprehensive monthly calendar for Indian and global IPOs. Track bidding opening dates, closing dates, basis of allotment, and listing debuts across exchanges.',
  canonicalPath: '/ipo-calendar',
});

export default async function IpoCalendarPage() {
  await connection();
  const provider = getIpoProvider();
  const allIpos = await provider.getIpos();
  const fmpStatus = provider.getFmpFetchResult();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ name: 'IPO Calendar', path: '/ipo-calendar' }]} />

      <PartialFailureBanner
        selectedRange={{ from: 'Previous 180 days', to: 'Next 90 days' }}
        lastSuccessfulUpdate={fmpStatus?.fetchedAt}
        windows={fmpStatus?.windows}
        isComplete={fmpStatus?.isComplete}
        errorMessage={fmpStatus?.errorMessage}
      />

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
          <Calendar className="w-3.5 h-3.5" />
          Market Timetable
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Global & Indian IPO Calendar
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
          Interactive schedule of upcoming and active initial public offerings. Filter
          by segment, navigate by month, or toggle between calendar grid and timeline list view.
        </p>
      </div>

      <IpoCalendarView ipos={allIpos} />
    </div>
  );
}
