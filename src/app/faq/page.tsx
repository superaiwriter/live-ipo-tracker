import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata, generateFaqJsonLd } from '@/lib/seo';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'What is an Initial Public Offering (IPO)?',
    answer:
      'An Initial Public Offering (IPO) is the process by which an unlisted private company offers shares to the public for the first time, allowing it to raise capital from institutional and retail investors and subsequently trade on stock exchanges like the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).',
  },
  {
    question: 'What is the key difference between a Mainboard IPO and an SME IPO in India?',
    answer:
      'Mainboard IPOs are for established medium-to-large corporations with a minimum post-issue paid-up capital of ₹10 Crores, offering smaller retail lot sizes (typically ₹14,000–₹15,000 per application). SME IPOs are listed on dedicated exchange platforms (NSE Emerge and BSE SME) for emerging companies with a post-issue capital between ₹1 Crore and ₹25 Crores, and mandate much larger application lot sizes (typically ₹1,00,000 to ₹1,40,000) to ensure sophisticated investor participation.',
  },
  {
    question: 'What is Grey Market Premium (GMP) and why is it strictly unofficial?',
    answer:
      'Grey Market Premium (GMP) is the informal price at which IPO applications or allotted shares are traded by dealers in an unregulated, over-the-counter market before official exchange listing. GMP is completely unofficial, neither recognized nor regulated by SEBI, BSE, or NSE. It fluctuates based on informal sentiment and must never be treated as an investment guarantee or accurate listing forecast.',
  },
  {
    question: 'How does ASBA and UPI payment blocking work in Indian IPOs?',
    answer:
      'Applications Supported by Blocked Amount (ASBA) ensures that an investor’s money remains in their bank account while applying for an IPO. When you submit your application using a UPI ID or net banking ASBA, the application amount is merely blocked/lien-marked. Money is only debited if shares are allotted to you. If no allotment is made, the lien block is automatically released on the refund date.',
  },
  {
    question: 'Can I apply for an IPO using multiple demat accounts with the same PAN?',
    answer:
      'No. SEBI regulations strictly prohibit multiple applications under the same Permanent Account Number (PAN). If an investor submits more than one application using different broker or demat accounts sharing the same PAN, all applications will be rejected as duplicates during technical verification.',
  },
  {
    question: 'How is basis of allotment determined when an IPO is oversubscribed in the retail category?',
    answer:
      'Under SEBI guidelines, if the retail individual investor (RII) portion is oversubscribed, allotment is conducted via an electronic computerized lottery draw. Each successful applicant in the lottery receives a minimum of one lot. No investor can be allotted more than one lot in retail until every applicant has received at least one lot.',
  },
  {
    question: 'How does LiveIPOTracker calculate IPO status (Upcoming, Live, Closed, Listed)?',
    answer:
      'LiveIPOTracker uses a single, deterministic function in Indian Standard Time (IST). An issue is "Upcoming" before 00:00 IST on open_date, "Live / Open" during the bidding window (between open_date and close_date 17:00 IST), "Closed / Allotment" after bidding cut-off until the morning of listing day, and "Listed" from 10:00 AM IST on listing_date or once verified debut prices are recorded.',
  },
];

export const metadata: Metadata = constructMetadata({
  title: 'IPO Frequently Asked Questions (FAQ) | LiveIPOTracker',
  description:
    'Answers to essential questions on Indian Mainboard and SME IPOs: bidding rules, ASBA UPI blocking, allotment lottery, unofficial GMP definition, and SEBI regulations.',
  canonicalPath: '/faq',
});

export default function FaqPage() {
  const faqJsonLd = generateFaqJsonLd(FAQ_ITEMS);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Schema.org FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Breadcrumbs items={[{ name: 'Frequently Asked Questions', path: '/faq' }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <HelpCircle className="w-3.5 h-3.5" />
          Investor Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Clear, authoritative answers explaining the IPO investment lifecycle, SEBI bidding
          rules, quota classifications, and unofficial GMP mechanics in India.
        </p>
      </div>

      {/* Accordion FAQ List */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
        {FAQ_ITEMS.map((item, idx) => (
          <details
            key={idx}
            className="group py-5 first:pt-0 last:pb-0 [&_summary::-webkit-details-marker]:hidden"
            open={idx === 0}
          >
            <summary className="flex items-center justify-between cursor-pointer list-none text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
              <span>{item.question}</span>
              <ChevronDown className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform shrink-0 ml-4" />
            </summary>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
