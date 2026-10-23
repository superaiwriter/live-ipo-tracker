import React from 'react';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata } from '@/lib/seo';
import { BookA, Search } from 'lucide-react';

const GLOSSARY_TERMS = [
  {
    term: 'Anchor Investor',
    definition:
      'A Qualified Institutional Buyer (QIB) that applies for a minimum of ₹10 Crores in an IPO one day before the issue opens to the public. Anchor allotments create market confidence and are subject to mandatory 30-day and 90-day lock-in periods.',
  },
  {
    term: 'ASBA (Application Supported by Blocked Amount)',
    definition:
      'A banking mechanism mandated by SEBI where an applicant’s money is not debited immediately upon IPO application, but merely blocked in their bank account. Money is only deducted if shares are allotted.',
  },
  {
    term: 'Basis of Allotment',
    definition:
      'The official executive document published by the Registrar and stock exchanges detailing how shares have been distributed among applicants across QIB, NII, and Retail investor categories.',
  },
  {
    term: 'Book Building Issue',
    definition:
      'A price discovery mechanism where the company announces a 20% price band (e.g. ₹190 to ₹200) and invites bids from investors, rather than offering shares at a single predetermined fixed price.',
  },
  {
    term: 'Cap Price & Floor Price',
    definition:
      'In a book-built issue, the Floor Price is the minimum bid price acceptable, while the Cap Price is the maximum allowed price. SEBI mandates that the cap price cannot exceed 120% of the floor price.',
  },
  {
    term: 'Cut-off Price',
    definition:
      'The final issue price decided by the company and lead managers after evaluating all bids. Retail investors are allowed to tick the "Cut-off" box on their application to automatically bid at whatever final price is chosen.',
  },
  {
    term: 'DRHP (Draft Red Herring Prospectus)',
    definition:
      'The preliminary registration document submitted to SEBI containing comprehensive disclosures about the company’s business operations, promoters, financial statements, risks, and objectives of the issue, excluding the price or quantum of shares.',
  },
  {
    term: 'Fresh Issue vs Offer for Sale (OFS)',
    definition:
      'In a Fresh Issue, new shares are created, and capital raised goes directly into the company’s balance sheet for growth or debt repayment. In an Offer for Sale (OFS), existing promoters or private equity investors sell their existing shares, and proceeds go to the selling shareholders.',
  },
  {
    term: 'GMP (Grey Market Premium)',
    definition:
      'An unofficial, informal price premium negotiated by unofficial traders before official exchange listing. GMP is completely unregulated by SEBI and does not represent a guaranteed listing forecast.',
  },
  {
    term: 'Lead Manager (Book Running Lead Manager - BRLM)',
    definition:
      'SEBI-registered merchant banking institutions appointed by the company to manage the IPO process, conduct due diligence, draft the prospectus, organize institutional roadshows, and coordinate listing.',
  },
  {
    term: 'Lot Size',
    definition:
      'The minimum number of shares an investor must bid for in an IPO. All bids must be placed in exact multiples of this lot size (e.g. 1 lot = 30 shares, 2 lots = 60 shares).',
  },
  {
    term: 'NII / HNI (Non-Institutional Investors)',
    definition:
      'Investors including resident Indian individuals, NRIs, and corporate bodies applying for more than ₹2,00,000 worth of shares in an IPO. Subdivided into sHNI (bids ₹2L–₹10L) and bHNI (bids &gt;₹10L).',
  },
  {
    term: 'QIB (Qualified Institutional Buyers)',
    definition:
      'Institutional financial entities recognized by SEBI (such as domestic Mutual Funds, Insurance companies, Pension funds, and registered Foreign Portfolio Investors) perceived to possess market expertise.',
  },
  {
    term: 'RHP (Red Herring Prospectus)',
    definition:
      'The updated prospectus filed with the Registrar of Companies (RoC) containing complete details on the issue dates and price band, but omitting the final issue price until the book is closed.',
  },
  {
    term: 'Registrar to the Issue',
    definition:
      'An independent SEBI-registered corporate body (such as Link Intime or KFintech) responsible for processing bids, identifying valid applications, conducting the allotment lottery, and coordinating refunds.',
  },
  {
    term: 'SME IPO (NSE Emerge / BSE SME)',
    definition:
      'Specialized exchange platforms created for Small and Medium Enterprises with lower post-issue paid-up capital requirements (under ₹25 Crores) and higher application lot thresholds (typically ₹1 Lakh+).',
  },
  {
    term: 'UPI IPO Mandate',
    definition:
      'A digital banking mechanism allowing retail investors to approve an ASBA block of funds for their IPO bid directly on supported UPI applications (such as BHIM, Google Pay, PhonePe) up to ₹5,00,000.',
  },
];

export const metadata: Metadata = constructMetadata({
  title: 'Indian IPO Glossary: A to Z Terms Explained | LiveIPOTracker',
  description:
    'Comprehensive dictionary of Indian IPO terminology: ASBA, Book Building, Cut-off price, DRHP, OFS, Anchor investors, Lot size, and unofficial GMP defined.',
  canonicalPath: '/ipo-glossary',
});

export default function IpoGlossaryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: 'IPO Glossary', path: '/ipo-glossary' }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <BookA className="w-3.5 h-3.5" />
          Financial Lexicon
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          A–Z IPO Glossary
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Clear definitions of essential technical, regulatory, and market concepts used in Indian
          primary markets and SEBI documentation.
        </p>
      </div>

      {/* Term Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GLOSSARY_TERMS.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-xs"
          >
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {item.term}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {item.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
