import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const isSuccess = status !== 'invalid';

  return (
    <div className="max-w-xl mx-auto py-12 text-center space-y-6">
      <Breadcrumbs items={[{ name: 'Newsletter Confirmation', path: '/newsletter/confirmed' }]} />

      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isSuccess ? 'Subscription Confirmed!' : 'Invalid or Expired Token'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isSuccess
            ? 'You are now set to receive our Daily 9:00 AM IST IPO Market Intelligence Digest covering active bidding issues and upcoming pipelines.'
            : 'The confirmation link may have already been used or has expired. You can submit your email again on our homepage to receive a new link.'}
        </p>
      </div>

      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Explore IPO Market Overview <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
