import React from 'react';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { IPOTable } from '@/components/ipo/IPOTable';
import { IPOCard } from '@/components/ipo/IPOCard';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Flame } from 'lucide-react';
import { IPOWithDetails } from '@/types/ipo';

import { connection } from 'next/server';

export const metadata: Metadata = constructMetadata({
  title: 'Live & Open IPOs Today in India | LiveIPOTracker',
  description:
    'Track all Mainboard and SME Initial Public Offerings currently open for bidding on NSE and BSE. Live subscription status, lot sizes, price bands, and dates.',
  canonicalPath: '/live-ipo',
});

export default async function LiveIpoPage() {
  await connection();
  const provider = getIpoProvider();
  const liveIpos = await provider.getIpos({ status: 'open' });

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ name: 'Live IPOs', path: '/live-ipo' }]} />
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
          <Flame className="w-3.5 h-3.5" />
          Active Bidding Window
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Live & Open IPOs
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
          Initial Public Offerings currently accepting retail and institutional bids on the
          National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).
        </p>
      </div>

      {liveIpos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveIpos.map((ipo: IPOWithDetails) => (
            <IPOCard key={ipo.id} ipo={ipo} />
          ))}
        </div>
      )}

      <IPOTable
        ipos={liveIpos}
        initialStatus="open"
        title="Live Bidding Directory"
        hideFilters={false}
      />
    </div>
  );
}
