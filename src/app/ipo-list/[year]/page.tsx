import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getIpoProvider } from '@/lib/providers';
import { IPOTable } from '@/components/ipo/IPOTable';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Calendar, Building2, Layers, IndianRupee } from 'lucide-react';

interface PageProps {
  params: Promise<{ year: string }>;
}

const SUPPORTED_YEARS = ['2026', '2025', '2024', '2023'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;

  return constructMetadata({
    title: `IPO List ${year} India: All Mainboard & SME Issues | LiveIPOTracker`,
    description: `Complete directory of all initial public offerings (IPOs) launched in ${year} on NSE and BSE. Issue sizes, listing gains, price bands, and performance statistics.`,
    canonicalPath: `/ipo-list/${year}`,
  });
}

export default async function IpoYearArchivePage({ params }: PageProps) {
  await connection();
  const { year } = await params;

  if (!/^\d{4}$/.test(year)) {
    notFound();
  }

  const provider = getIpoProvider();
  const allIpos = await provider.getIpos();

  // Filter IPOs that have open_date, close_date or listing_date starting with the year
  const yearIpos = allIpos.filter((ipo) => {
    const dates = [ipo.open_date, ipo.close_date, ipo.listing_date].filter(Boolean) as string[];
    return dates.some((d) => d.startsWith(year));
  });

  const mainboardCount = yearIpos.filter((i) => i.segment === 'mainboard').length;
  const smeCount = yearIpos.filter((i) => i.segment === 'sme').length;
  const totalCapitalRaisedCr = yearIpos.reduce((acc, curr) => acc + (curr.issue_size_cr || 0), 0);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { name: 'IPO Archives', path: `/ipo-list/${year}` },
          { name: `Year ${year}`, path: `/ipo-list/${year}` },
        ]}
      />

      {/* Header with Year Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold mb-3">
            <Calendar className="w-3.5 h-3.5" />
            Historical Exchange Archive
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            IPO List {year}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
            Historical records and comprehensive listing directory for all public offerings launched
            during the calendar year {year}.
          </p>
        </div>

        {/* Year Pills Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start md:self-auto">
          {SUPPORTED_YEARS.map((y) => {
            const isActive = y === year;
            return (
              <Link
                key={y}
                href={`/ipo-list/${y}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {y}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Year Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Total Issues in {year}</span>
          <div className="text-2xl font-mono font-extrabold text-zinc-900 dark:text-zinc-100">
            {yearIpos.length} IPOs
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {mainboardCount} Mainboard • {smeCount} SME
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Capital Mobilized</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{totalCapitalRaisedCr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Total issue size across all tranches</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-xs font-medium text-zinc-400 block mb-1">Platform Distribution</span>
          <div className="text-2xl font-mono font-extrabold text-zinc-900 dark:text-zinc-100">
            {mainboardCount > 0 ? ((mainboardCount / (yearIpos.length || 1)) * 100).toFixed(0) : 0}% MB
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {smeCount > 0 ? ((smeCount / (yearIpos.length || 1)) * 100).toFixed(0) : 0}% SME share
          </p>
        </div>
      </div>

      {/* Table */}
      <IPOTable ipos={yearIpos} title={`All ${year} IPO Issues`} hideFilters={false} />
    </div>
  );
}
