import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Contact & Editorial Inquiries | LiveIPOTracker',
  description:
    'Contact the LiveIPOTracker editorial and engineering team for data corrections, errata reporting, or official exchange filing inquiries.',
  canonicalPath: '/contact',
});

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'Contact', path: '/contact' }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Mail className="w-3.5 h-3.5" />
          Editorial Desk
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Contact & Data Corrections
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Have an errata notice, updated registrar circular, or technical suggestion? Reach out to our
          editorial and research desk directly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <Mail className="w-6 h-6 text-emerald-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Editorial & Errata
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Report any discrepancies in issue dates, price bands, or allotment announcements. Include
            official BSE/NSE circular links for rapid validation.
          </p>
          <div className="pt-2 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            editorial@liveipotracker.in
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Developer & API Partnerships
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Inquiries regarding our provider adapters, multi-country integration roadmap, or
            institutional primary market feeds.
          </p>
          <div className="pt-2 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
            api@liveipotracker.in
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-500">
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
          Response Times & Editorial Hours:
        </h3>
        <p>
          Our editorial desk operates Monday through Friday during Indian equity market hours (09:00 AM
          to 06:00 PM IST). Submissions referencing official exchange notices are typically reviewed
          and reconciled within 2 hours.
        </p>
      </div>
    </div>
  );
}
