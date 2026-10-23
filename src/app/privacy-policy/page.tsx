import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Lock, EyeOff, ShieldCheck, Mail, Database, UserCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy | LiveIPOTracker',
  description:
    'Our privacy commitment: zero tracking of investment watchlists (stored locally in your browser), no personal data sales, and full DPDP Act compliance.',
  canonicalPath: '/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'Privacy Policy', path: '/privacy-policy' }]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Lock className="w-3.5 h-3.5" />
          Data Protection & DPDP Act 2023
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Last updated: October 2026. LiveIPOTracker (&quot;we&quot;, &quot;our&quot;, or &quot;the Platform&quot;) is committed to protecting your personal data and respecting your right to privacy under the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian information technology laws.
        </p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {/* Section 1: Client-Side Watchlist */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-500" />
            1. Zero Tracking of Investment Watchlists (Client-Side Storage)
          </h2>
          <p>
            When you bookmark or track an IPO on LiveIPOTracker, your saved items are stored strictly inside your personal browser using the standard HTML5 <code>localStorage</code> API.
          </p>
          <p>
            We do not transmit, sync, or persist your private watchlist choices on external servers or databases. Your investment interests remain entirely local to your device and cannot be viewed, sold, or utilized for behavioral targeted advertising.
          </p>
        </div>

        {/* Section 2: Information We Collect */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            2. Information We Collect
          </h2>
          <p>
            Because we do not mandate user registration, we collect only the minimal data necessary to maintain service reliability and fulfill user-requested features:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <li>
              <strong>Newsletter Subscriptions:</strong> If you voluntarily subscribe to our IPO bulletin or daily subscription digest, we securely store your email address. You may unsubscribe at any time via the one-click link included in every email.
            </li>
            <li>
              <strong>Technical Telemetry & Server Logs:</strong> To safeguard against distributed denial-of-service (DDoS) attacks and ensure uptime, our infrastructure logs anonymized HTTP headers, IP addresses, browser user-agents, and timestamp metrics.
            </li>
            <li>
              <strong>Errata & Contact Inquiries:</strong> When you submit a data correction or general inquiry via our contact form, we collect your provided name, email address, and message text solely to resolve the ticket.
            </li>
          </ul>
        </div>

        {/* Section 3: Data Sharing & Non-Disclosure */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            3. Strict Non-Disclosure & No Sale of Data
          </h2>
          <p>
            <strong>We do not sell, rent, license, or trade your personal data</strong> to third-party data brokers, stock brokers, merchant bankers, or loan telemarketers.
          </p>
          <p>
            We only disclose information when required under strict legal compulsion by an authorized regulatory agency (such as SEBI, the Reserve Bank of India, or Indian courts of competent jurisdiction) under applicable laws.
          </p>
        </div>

        {/* Section 4: Rights of Data Principals (DPDP Act 2023) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            4. Your Rights Under the DPDP Act 2023
          </h2>
          <p>
            As a Data Principal under Indian digital data protection legislation, you possess explicit rights regarding your digital information:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">Right to Access:</strong>
              Confirm whether we process any personal data relating to you and receive a summary.
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">Right to Correction:</strong>
              Request the updating or rectification of outdated or inaccurate personal records.
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">Right to Erasure:</strong>
              Request complete deletion of your email address from our subscriber records.
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <strong className="text-zinc-900 dark:text-zinc-100 block mb-1">Right to Grievance Redressal:</strong>
              Register concerns directly with our designated data grievance desk.
            </div>
          </div>
        </div>

        {/* Section 5: Cookies and External Links */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            5. Cookies, Local Storage & External Links
          </h2>
          <p>
            Our use of cookies is limited to essential operational parameters, theme preferences, and edge caching. For a comprehensive breakdown of all cookies and local keys utilized, please inspect our dedicated <Link href="/cookie-policy" className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2">Cookie Policy</Link>.
          </p>
          <p>
            LiveIPOTracker contains hyperlinks to official registrar portals (e.g. Link Intime, KFintech, Bigshare) and regulatory exchanges (NSE, BSE, SEBI). We are not responsible for the privacy practices or data policies of external third-party sites.
          </p>
        </div>

        {/* Section 6: Children's Privacy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            6. Children&apos;s Privacy
          </h2>
          <p>
            LiveIPOTracker is a financial market telemetry platform designed for adult individuals who meet legal qualifications for capital market participation (18 years of age or older in India). We do not knowingly collect or solicit personal data from minors.
          </p>
        </div>

        {/* Section 7: Grievance Desk */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-500" />
            7. Data Grievance Redressal & Contact
          </h2>
          <p>
            If you have questions regarding this Privacy Policy, wish to exercise your rights as a Data Principal, or report a data grievance, you may reach out to our privacy desk:
          </p>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 space-y-1 text-xs">
            <p><strong>Entity:</strong> LiveIPOTracker Data Privacy & Compliance Desk</p>
            <p><strong>Grievance Email:</strong> privacy@liveipotracker.in</p>
            <p><strong>Response Timeline:</strong> Within 48 hours for acknowledgment; within 30 days for resolution under DPDP Act norms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
