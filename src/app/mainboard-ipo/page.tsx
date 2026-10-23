import React from 'react';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { IPOTable } from '@/components/ipo/IPOTable';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Building2 } from 'lucide-react';

import { connection } from 'next/server';

export const metadata: Metadata = constructMetadata({
  title: 'Mainboard IPOs on NSE & BSE India | LiveIPOTracker',
  description:
    'Dedicated tracker for Indian Mainboard IPOs. Track large-cap issues, book building timelines, QIB/NII/Retail subscriptions, and official exchange filings.',
  canonicalPath: '/mainboard-ipo',
});

export default async function MainboardIpoPage() {
  await connection();
  const provider = getIpoProvider();
  const mainboardIpos = await provider.getIpos({ segment: 'mainboard' });

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'Mainboard IPOs', path: '/mainboard-ipo' }]} />
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5" />
          NSE & BSE Main Segment
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Mainboard IPOs
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
          Large and mid-cap public issues listing on the primary boards of the National Stock
          Exchange and Bombay Stock Exchange.
        </p>
      </div>

      <IPOTable
        ipos={mainboardIpos}
        initialSegment="mainboard"
        title="Mainboard IPO Directory"
        hideFilters={false}
      />
    </div>
  );
}
