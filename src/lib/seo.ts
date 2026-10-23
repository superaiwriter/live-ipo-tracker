import { Metadata } from 'next';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://liveipotracker.in';

export const SITE_NAME = 'LiveIPOTracker';

export interface MetadataOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogType?: 'website' | 'article';
}

/**
 * Standardized Metadata Generator for LiveIPOTracker
 */
export function constructMetadata({
  title,
  description,
  canonicalPath = '/',
  keywords = [
    'IPO India',
    'Mainboard IPO',
    'SME IPO',
    'NSE Emerge',
    'BSE SME',
    'Live IPO GMP Today',
    'IPO subscription numbers',
    'IPO allotment date',
    'SEBI IPO filings',
  ],
  noIndex = false,
  ogType = 'website',
}: MetadataOptions): Metadata {
  const url = `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: ogType,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * JSON-LD Schema: BreadcrumbList (Matches visible breadcrumbs, Rule 3)
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

/**
 * JSON-LD Schema: Organization (Matches visible about/company info)
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Independent financial market intelligence platform tracking Mainboard and SME Initial Public Offerings in India.',
    knowsAbout: [
      'Initial Public Offerings (IPOs)',
      'National Stock Exchange of India (NSE)',
      'Bombay Stock Exchange (BSE)',
      'Securities and Exchange Board of India (SEBI) guidelines',
    ],
  };
}

/**
 * JSON-LD Schema: FAQPage (Strictly matches visible FAQ accordions)
 */
export function generateFaqJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
