import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Cookie, ShieldCheck, Database, Sliders, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: 'Cookie Policy | LiveIPOTracker',
  description:
    'Learn how LiveIPOTracker uses essential cookies and local storage to power your IPO watchlist and platform preferences with privacy-first standards.',
  canonicalPath: '/cookie-policy',
});

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'Cookie Policy', path: '/cookie-policy' }]} />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Cookie className="w-3.5 h-3.5" />
          Transparency & Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Cookie Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Last updated: October 2026. This policy explains how LiveIPOTracker uses cookies, local browser storage, and related web technologies when you browse our Indian primary market tracking platform.
        </p>
      </div>

      <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {/* Intro Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-500" />
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember your display preferences, and provide aggregated analytical information.
          </p>
          <p>
            In addition to HTTP cookies, modern web applications utilize <strong>HTML5 Local Storage</strong> (<code>localStorage</code>). Unlike traditional cookies, data stored in local storage is kept strictly in your local web browser and is <em>never automatically sent to remote servers</em> with every network request.
          </p>
        </div>

        {/* Client-Side Watchlist Guarantee */}
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            2. Our Privacy-First Storage Architecture
          </h2>
          <p className="text-emerald-900 dark:text-emerald-200/90">
            LiveIPOTracker operates on a <strong>privacy-first model</strong>. We do not require mandatory user accounts or logins to track initial public offerings.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2 text-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>IPO Watchlist:</strong> When you click the star/bookmark icon on any Mainboard or SME IPO, the stock identifier is saved strictly in your browser&apos;s <code>localStorage</code>. It is never logged on our servers or linked to your identity.</span>
            </li>
            <li className="flex items-start gap-2 text-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Comparison Tool State:</strong> Selected IPO comparison parameters are kept in local storage for your convenience during your browsing session.</span>
            </li>
            <li className="flex items-start gap-2 text-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Zero Behavioral Profiling:</strong> We do not track your financial net worth, trading activity, or cross-site investment habits.</span>
            </li>
          </ul>
        </div>

        {/* Categories of Technologies */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            3. Technologies We Utilize
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <th className="py-2.5 pr-4 font-semibold">Storage Key / Cookie</th>
                  <th className="py-2.5 pr-4 font-semibold">Category</th>
                  <th className="py-2.5 pr-4 font-semibold">Purpose</th>
                  <th className="py-2.5 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="py-3 pr-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">ipo_watchlist</td>
                  <td className="py-3 pr-4">Local Storage (Functional)</td>
                  <td className="py-3 pr-4">Stores your pinned IPOs so your custom watchlist persists across visits.</td>
                  <td className="py-3">Persistent (until manually cleared)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">ipo_compare_list</td>
                  <td className="py-3 pr-4">Local Storage (Functional)</td>
                  <td className="py-3 pr-4">Temporarily saves company symbols chosen for side-by-side financial metric comparison.</td>
                  <td className="py-3">Persistent (browser session)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">theme / color-scheme</td>
                  <td className="py-3 pr-4">Local Storage (Preferences)</td>
                  <td className="py-3 pr-4">Remembers your display theme (Dark Mode / Light Mode).</td>
                  <td className="py-3">Persistent</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">_edge_cache_id</td>
                  <td className="py-3 pr-4">HTTP Cookie (Essential)</td>
                  <td className="py-3 pr-4">Enables fast edge CDN routing and real-time subscription metric updates.</td>
                  <td className="py-3">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Third-Party Links & Registrars */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            4. Third-Party Links & External Services
          </h2>
          <p>
            When viewing IPO allotment statuses or exchange announcements, you may click outbound links to official registrars (such as Link Intime India, KFin Technologies, Bigshare Services, Cameo Corporate Services) or stock exchanges (NSE India, BSE India).
          </p>
          <p>
            These external domains have independent cookie policies and terms of service. LiveIPOTracker does not control or operate third-party tracking scripts hosted on external domains.
          </p>
        </div>

        {/* How to Manage */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            5. How Can You Manage or Clear Cookies & Local Storage?
          </h2>
          <p>
            You have full control over cookies and local storage directly through your browser settings:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Third-party cookies & Site data.</li>
            <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy & Security &rarr; Cookies and Site Data.</li>
            <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data.</li>
            <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies.</li>
          </ul>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <em>Please note:</em> If you clear your browser&apos;s site data or local storage for LiveIPOTracker, your pinned IPO watchlist will be reset to empty, as we do not hold a remote backup of your client-side bookmarks.
          </p>
        </div>

        {/* Related Policies */}
        <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-zinc-600 dark:text-zinc-300">
            Questions regarding our privacy framework or data standards?
          </span>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Privacy Policy
            </Link>
            <Link href="/disclaimer" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Legal Disclaimer
            </Link>
            <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Contact Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
