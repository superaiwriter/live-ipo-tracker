import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata, generateOrganizationJsonLd } from '@/lib/seo';
import { Shield, Database, Cpu, Globe } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'About Us & Editorial Standards | LiveIPOTracker',
  description:
    'Learn about LiveIPOTracker, our commitment to zero data fabrication, deterministic IST status engines, and transparent primary market telemetry.',
  canonicalPath: '/about',
});

export default function AboutPage() {
  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <Breadcrumbs items={[{ name: 'About', path: '/about' }]} />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          About LiveIPOTracker
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          An independent financial intelligence platform engineered to bring disciplined, verified,
          and transparent primary market telemetry to Indian retail and institutional investors.
        </p>
      </div>

      {/* Mission */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          Our Mission: Integrity Over Sensationalism
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          The Indian primary capital market has expanded dramatically, with record numbers of Mainboard
          and SME IPOs mobilizing thousands of crores annually. However, investor information is often
          plagued by fabricated predictions, unverified grey market rumors disguised as official news,
          and speculative forecasts.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          LiveIPOTracker was architected on a single core principle: <strong>Absolute Data Integrity</strong>.
          We never invent numbers. If a price band, lot size, or official subscription ratio has not yet
          been formally declared by the exchange or issuer, we explicitly show &quot;Not available&quot;.
        </p>
      </div>

      {/* Engineering Pillars */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Our Architectural Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Permitted Sourcing Only
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              We exclusively utilize official regulatory filings (SEBI, NSE, BSE), verified registrar
              feeds, or authorized manual entries. We never scrape platforms whose terms prohibit it.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Deterministic IST Engine
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              IPO status is never arbitrarily guessed. It is evaluated deterministically in Indian
              Standard Time (IST, UTC+05:30) following official exchange market hours and cut-offs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Extensible Global Design
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              While our initial focus is India (Mainboard and SME platforms), our provider adapter
              architecture is designed from the ground up to support international primary markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
