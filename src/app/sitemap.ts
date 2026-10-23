import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getIpoProvider } from '@/lib/providers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const provider = getIpoProvider();
  const allIpos = await provider.getIpos();

  // Core indexable landing and directory pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/live-ipo`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/upcoming-ipo`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/listed-ipo`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/mainboard-ipo`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sme-ipo`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ipo-calendar`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ipo-this-week`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ipo-list/2026`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/calculators`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ipo-list/2025`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/ipo-guide`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/ipo-glossary`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/how-we-calculate`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/editorial-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms-and-conditions`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic IPO detail pages (excluding duplicates or empty slugs)
  const ipoRoutes: MetadataRoute.Sitemap = allIpos
    .filter((ipo) => Boolean(ipo.slug && ipo.slug.trim()))
    .map((ipo) => ({
      url: `${SITE_URL}/ipo/${encodeURIComponent(ipo.slug)}`,
      lastModified: ipo.updated_at ? new Date(ipo.updated_at).toISOString() : new Date().toISOString(),
      changeFrequency: ipo.status === 'open' ? 'hourly' : ipo.status === 'upcoming' ? 'daily' : 'weekly',
      priority: ipo.status === 'open' ? 0.9 : ipo.status === 'upcoming' ? 0.8 : 0.7,
    }));

  // Dynamic country pages (only for countries with real IPO data, excluding demo)
  const countryMap = new Set<string>();
  for (const ipo of allIpos) {
    if (ipo.country && !ipo.is_demo) {
      countryMap.add(ipo.country.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  }

  const countryRoutes: MetadataRoute.Sitemap = Array.from(countryMap).map((countrySlug) => ({
    url: `${SITE_URL}/country/${countrySlug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...countryRoutes, ...ipoRoutes];
}
