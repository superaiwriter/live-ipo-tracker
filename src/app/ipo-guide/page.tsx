import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { BookOpen, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Complete Indian IPO Guide: Step-by-Step Process & Rules | LiveIPOTracker',
  description:
    'Comprehensive investor guide to understanding initial public offerings in India: DRHP, RHP, anchor allocations, retail quotas, ASBA UPI bidding, and allotment lottery.',
  canonicalPath: '/ipo-guide',
});

export default function IpoGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <Breadcrumbs items={[{ name: 'IPO Guide', path: '/ipo-guide' }]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <BookOpen className="w-3.5 h-3.5" />
          Investor Education
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          The Complete Guide to Indian IPOs
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          A definitive handbook on how public issues are launched, priced, subscribed, and allotted
          under Securities and Exchange Board of India (SEBI) regulations.
        </p>
      </div>

      {/* Section 1: The IPO Timeline */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs flex items-center justify-center font-bold">
            1
          </span>
          The 9-Stage Public Offering Lifecycle
        </h2>

        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              1. DRHP Filing with SEBI
            </h3>
            <p>
              The issuer files a Draft Red Herring Prospectus (DRHP) prepared by Merchant Bankers with
              SEBI. The document is placed in the public domain for a minimum of 21 days for review
              and investor comments.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              2. SEBI Observations & In-Principle Approvals
            </h3>
            <p>
              SEBI reviews disclosures, corporate governance history, and financial metrics. Once
              observations are addressed, both BSE and NSE issue in-principle listing approvals.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              3. RHP Filing & Price Band Announcement
            </h3>
            <p>
              The Red Herring Prospectus (RHP) specifies the issue dates and price band (floor and cap
              price, e.g. ₹475–₹500). Under SEBI rules, the cap price cannot exceed 120% of the floor price.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              4. Anchor Investor Allocation (T-1 Day)
            </h3>
            <p>
              Qualified Institutional Buyers (mutual funds, insurance funds, sovereign wealth funds)
              bid one day prior to public opening. Up to 60% of the QIB quota can be allocated to
              anchors with a 30 to 90-day lock-in period.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              5. Public Bidding Window (3 Business Days)
            </h3>
            <p>
              Retail and non-institutional bidders place applications via ASBA net-banking or UPI apps.
              The bidding window is open strictly from 10:00 AM to 5:00 PM IST on working days.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              6. Basis of Allotment Finalization
            </h3>
            <p>
              The designated Registrar (such as Link Intime or KFintech) processes electronic bids,
              rejects invalid or duplicate PAN submissions, and executes the computerized allotment
              draw under exchange oversight.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              7. Unblocking Funds & Demat Credit (T+2 / T+3)
            </h3>
            <p>
              Under India’s progressive T+3 listing regime, bank liens on unallotted amounts are
              released within 1-2 days, while allotted shares are credited directly to the applicant&apos;s
              NSDL or CDSL depository accounts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
              8. Secondary Market Listing Debut
            </h3>
            <p>
              Shares commence trading on the stock exchange at 10:00 AM IST following a 45-minute
              pre-open discovery call auction (09:00 AM to 09:45 AM IST).
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Quota Breakdown */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs flex items-center justify-center font-bold">
            2
          </span>
          Investor Quotas & Reservation Norms
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              50% Allocation
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Qualified Institutional (QIB)
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              Reserved for registered institutional investors such as domestic mutual funds, foreign
              portfolio investors (FPIs), insurance corporations, and banks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              15% Allocation
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Non-Institutional (NII / HNI)
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              For high-net-worth individuals and corporate entities applying for amounts exceeding
              ₹2,00,000. Sub-divided into Small HNI (bids ₹2L–₹10L) and Big HNI (bids &gt;₹10L).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
              35% Allocation
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Retail Individual (RII)
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              Reserved for resident individuals applying for up to ₹2,00,000. Allotment is conducted
              via a proportionate computerized lottery when oversubscribed.
            </p>
          </div>
        </div>
      </section>

      {/* Cross link */}
      <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-850/60 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-0.5">
            Looking for definitions of financial terms?
          </span>
          <span className="text-zinc-500">
            Check our comprehensive A–Z IPO Glossary for terms like ASBA, Cut-off price, and OFS.
          </span>
        </div>
        <Link
          href="/ipo-glossary"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold hover:opacity-90 shrink-0"
        >
          IPO Glossary <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
