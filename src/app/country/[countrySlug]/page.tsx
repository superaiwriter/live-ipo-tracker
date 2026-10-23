import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getIpoProvider } from '@/lib/providers';
import { IPOTable } from '@/components/ipo/IPOTable';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PartialFailureBanner } from '@/components/ui/PartialFailureBanner';
import { DataCoverageNotice } from '@/components/ui/DataCoverageNotice';
import { constructMetadata } from '@/lib/seo';
import { Globe } from 'lucide-react';
import { connection } from 'next/server';

interface PageProps {
  params: Promise<{ countrySlug: string }>;
}

// Convert slug like 'united-states' to 'United States'
function slugToCountryName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { countrySlug } = await params;
  const countryName = slugToCountryName(countrySlug);
  const provider = getIpoProvider();
  const allIpos = await provider.getIpos();

  // Find real (non-demo) records for this country
  const countryIpos = allIpos.filter(
    (i) => i.country && i.country.toLowerCase() === countryName.toLowerCase() && !i.is_demo
  );

  const hasRealData = countryIpos.length > 0;

  return constructMetadata({
    title: `${countryName} IPO Calendar & Market Tracker | LiveIPOTracker`,
    description: hasRealData
      ? `Track all active, upcoming, and listed initial public offerings in ${countryName}. Real-time pricing, exchanges, and listing dates.`
      : `IPO coverage and listings in ${countryName}.`,
    canonicalPath: `/country/${countrySlug}`,
    noIndex: !hasRealData, // Indexable ONLY when real data exists!
  });
}

export default async function CountryIpoPage({ params }: PageProps) {
  await connection();
  const { countrySlug } = await params;
  const countryName = slugToCountryName(countrySlug);

  const provider = getIpoProvider();
  const allIpos = await provider.getIpos();
  const fmpStatus = provider.getFmpFetchResult();

  // Match country case-insensitively
  const countryIpos = allIpos.filter(
    (i) => i.country && i.country.toLowerCase() === countryName.toLowerCase()
  );

  // If completely unknown or zero records at all, return 404
  if (countryIpos.length === 0) {
    notFound();
  }

  const openCount = countryIpos.filter((i) => i.status === 'open').length;
  const upcomingCount = countryIpos.filter((i) => i.status === 'upcoming').length;
  const listedCount = countryIpos.filter((i) => i.status === 'listed').length;

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: 'Countries', path: '/' },
          { name: countryName, path: `/country/${countrySlug}` },
        ]}
      />

      <PartialFailureBanner
        selectedRange={{ from: 'Previous 180 days', to: 'Next 90 days' }}
        lastSuccessfulUpdate={fmpStatus?.fetchedAt}
        windows={fmpStatus?.windows}
        isComplete={fmpStatus?.isComplete}
        errorMessage={fmpStatus?.errorMessage}
      />

      <DataCoverageNotice />

      {/* Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/30">
          <Globe className="w-3.5 h-3.5" />
          Country Intelligence
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {countryName} IPO Market
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mt-1 leading-relaxed">
          Comprehensive tracker for Initial Public Offerings in {countryName}. Complete price bands,
          exchange venues, and deterministic status.
        </p>

        {/* Quick Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-400 block text-[11px]">Total Tracked</span>
            <span className="text-xl font-bold font-mono text-white">{countryIpos.length}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Live / Bidding</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{openCount}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Upcoming Pipeline</span>
            <span className="text-xl font-bold font-mono text-blue-400">{upcomingCount}</span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Listed / Historical</span>
            <span className="text-xl font-bold font-mono text-purple-400">{listedCount}</span>
          </div>
        </div>
      </div>

      {/* Country Table */}
      <IPOTable
        ipos={countryIpos}
        initialCountry={countryName}
        title={`${countryName} IPO Directory`}
      />
    </div>
  );
}
