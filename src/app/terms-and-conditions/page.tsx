import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { FileCheck, Shield, AlertCircle, Ban, Scale, Clock, Globe } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Terms and Conditions | LiveIPOTracker',
  description:
    'Terms of service and acceptable use agreement governing access to LiveIPOTracker market intelligence tools, calculators, and educational primary market telemetry.',
  canonicalPath: '/terms-and-conditions',
});

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'Terms & Conditions', path: '/terms-and-conditions' }]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <FileCheck className="w-3.5 h-3.5" />
          Terms of Use & Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Terms and Conditions
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Last updated: October 2026. Please carefully read these Terms and Conditions before utilizing the LiveIPOTracker platform. By accessing or interacting with our services, you signify your unreserved acceptance of these terms.
        </p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {/* 1. Acceptance & Eligibility */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-500" />
            1. Acceptance of Terms & Investor Eligibility
          </h2>
          <p>
            By accessing, browsing, or utilizing any feature of LiveIPOTracker (including our live IPO tracking dashboards, upcoming pipelines, subscription tracker, GMP indicators, and calculators), you confirm that you are at least 18 years of age and hold the legal capacity to enter into binding agreements under Indian law.
          </p>
          <p>
            If you do not agree with any part of these Terms and Conditions or our <Link href="/disclaimer" className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2">Regulatory Disclaimer</Link>, your sole recourse is to discontinue using this platform immediately.
          </p>
        </div>

        {/* 2. Educational Nature & Not SEBI Registered */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            2. Strictly Informational Platform (Not SEBI Registered)
          </h2>
          <p>
            <strong>LiveIPOTracker is an independent financial technology and data aggregation service.</strong> We are not registered with the Securities and Exchange Board of India (SEBI) as a Research Analyst, Investment Adviser, Portfolio Manager, Merchant Banker, or Stock Broker.
          </p>
          <p>
            Nothing published, calculated, or displayed on LiveIPOTracker constitutes an investment recommendation, financial advice, or an offer or solicitation to buy, subscribe to, or sell any security. You agree to make all investment choices solely on your independent evaluation and after consulting a qualified SEBI-registered professional.
          </p>
        </div>

        {/* 3. No Bidding or Fund Handling */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-500" />
            3. No Execution, Bidding, or Fund Handling Services
          </h2>
          <p>
            LiveIPOTracker does not handle investor funds, accept IPO application fees, execute bids, or operate an ASBA (Application Supported by Blocked Amount) banking portal.
          </p>
          <p>
            All IPO applications must be placed through your registered stock broker, bank ASBA facility, or UPI-mandate trading interface. We assume no responsibility or liability for failed bid submissions, blocked fund delays, or UPI mandate rejection issues experienced with third-party brokers or banks.
          </p>
        </div>

        {/* 4. Data Latency & Source Verification */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            4. Market Telemetry, Latencies & DRHP/RHP Priority
          </h2>
          <p>
            LiveIPOTracker aggregates primary market telemetry from public stock exchanges (NSE, BSE), statutory filings (SEBI DRHP / RHP documents), and official registrar disclosures.
          </p>
          <p>
            While we strive for deterministic accuracy, data may be subject to transmission latency, exchange maintenance downtime, or delayed registrar releases during peak bidding windows (such as Day 3 closing hours). In any situation involving conflicting data, the official Red Herring Prospectus (RHP) and formal exchange circulars shall always take legal precedence.
          </p>
        </div>

        {/* 5. Grey Market Premium (GMP) Caveat */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            5. Unofficial Nature of Grey Market Premium (GMP)
          </h2>
          <p>
            Grey Market Premium (GMP) data displayed on LiveIPOTracker represents informal, unregulated over-the-counter market sentiment gathered from market surveys.
          </p>
          <p>
            GMP is neither sanctioned nor supervised by SEBI, NSE, or BSE. It carries no legal validity, can fluctuate wildly, and should never be construed as a listing day price guarantee or guaranteed financial return.
          </p>
        </div>

        {/* 6. Prohibited Scraping & IP */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-500" />
            6. Intellectual Property & Anti-Scraping Restrictions
          </h2>
          <p>
            All custom code, database structures, UI design tokens, proprietary calculation algorithms, and editorial articles on LiveIPOTracker are protected intellectual property.
          </p>
          <p>
            You expressly agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <li>Deploy automated web crawlers, scrapers, data miners, or bots to harvest live subscription numbers or historical tables without prior written permission.</li>
            <li>Frame, mirror, or repackage our real-time telemetry or calculators inside commercial software or paid financial channels.</li>
            <li>Launch any distributed denial-of-service (DDoS) attack or engage in activity that impairs server availability for other retail investors.</li>
          </ul>
        </div>

        {/* 7. Limitation of Liability */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            7. Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p>
            LiveIPOTracker and its services are provided on an <strong>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express or implied.
          </p>
          <p>
            To the maximum extent permitted under applicable law, LiveIPOTracker, its developers, authors, and affiliates shall not be liable for any direct, indirect, incidental, punitive, or consequential losses (including trading losses, capital depreciation, or missed allotment opportunities) arising from your access to or reliance on this platform.
          </p>
        </div>

        {/* 8. Governing Law */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            8. Governing Law & Jurisdiction
          </h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or claim arising under these terms shall be subject to the exclusive jurisdiction of the competent courts of India.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            For legal inquiries or notices regarding these Terms, contact: <span className="font-mono text-emerald-600 dark:text-emerald-400">legal@liveipotracker.in</span>
          </p>
        </div>
      </div>
    </div>
  );
}
