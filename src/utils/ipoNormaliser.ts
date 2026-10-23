import { IPOWithDetails, IpoStatus } from '../types/ipo';
import { deriveIpoStatus } from '../lib/status';

/**
 * Maps known stock exchange codes to standardized country names.
 * Never guesses: if unknown, returns null.
 */
const EXCHANGE_COUNTRY_MAP: Record<string, { country: string; currency: string }> = {
  NASDAQ: { country: 'United States', currency: 'USD' },
  NYSE: { country: 'United States', currency: 'USD' },
  AMEX: { country: 'United States', currency: 'USD' },
  BATS: { country: 'United States', currency: 'USD' },
  OTC: { country: 'United States', currency: 'USD' },
  LSE: { country: 'United Kingdom', currency: 'GBP' },
  AIM: { country: 'United Kingdom', currency: 'GBP' },
  HKEX: { country: 'Hong Kong', currency: 'HKD' },
  TSE: { country: 'Japan', currency: 'JPY' },
  TSX: { country: 'Canada', currency: 'CAD' },
  ASX: { country: 'Australia', currency: 'AUD' },
  SGX: { country: 'Singapore', currency: 'SGD' },
  KRX: { country: 'South Korea', currency: 'KRW' },
  FWB: { country: 'Germany', currency: 'EUR' },
  XETRA: { country: 'Germany', currency: 'EUR' },
  EURONEXT: { country: 'France', currency: 'EUR' },
  NSE: { country: 'India', currency: 'INR' },
  BSE: { country: 'India', currency: 'INR' },
};

/**
 * Creates a URL-friendly slug from company name or symbol.
 */
export function generateSlug(name: string, symbol?: string | null): string {
  const base = name && name.trim() ? name : symbol || 'ipo';
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'ipo';
}

/**
 * Defensively extracts numeric values without converting null/undefined/empty to 0.
 */
export function parseOptionalNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
}

/**
 * Defensively parses price range strings like "$15.00 - $17.00" or single price "18.50".
 */
export function parsePriceRange(rawPrice: unknown, rawRange: unknown): {
  low: number | null;
  high: number | null;
  exact: number | null;
} {
  const rangeStr = rawRange ? String(rawRange).trim() : '';
  const priceStr = rawPrice ? String(rawPrice).trim() : '';

  let low: number | null = null;
  let high: number | null = null;
  let exact: number | null = parseOptionalNumber(rawPrice);

  if (rangeStr) {
    const parts = rangeStr.split(/[-–—to]/i).map((p) => parseOptionalNumber(p));
    if (parts.length >= 2 && parts[0] !== null && parts[1] !== null) {
      low = Math.min(parts[0], parts[1]);
      high = Math.max(parts[0], parts[1]);
    } else if (parts.length === 1 && parts[0] !== null) {
      exact = parts[0];
    }
  } else if (priceStr && priceStr.includes('-')) {
    const parts = priceStr.split(/[-–—]/).map((p) => parseOptionalNumber(p));
    if (parts.length >= 2 && parts[0] !== null && parts[1] !== null) {
      low = Math.min(parts[0], parts[1]);
      high = Math.max(parts[0], parts[1]);
    }
  }

  return { low, high, exact };
}

/**
 * Normalises an external API record (e.g. FMP ipos-calendar response) into the canonical IPO model.
 *
 * Rules:
 * - Missing fields stay null/undefined, never 0.
 * - Source is explicitly attached (e.g. 'fmp').
 * - Preserves original IDs or builds deterministic stable ID.
 * - Checks status evidence safely.
 */
export function normaliseFmpIpo(
  raw: Record<string, unknown>,
  source: string = 'fmp'
): IPOWithDetails {
  const companyName = String(
    raw.company || raw.name || raw.companyName || raw.symbol || 'Not declared'
  ).trim();

  const symbol = raw.symbol ? String(raw.symbol).trim() : null;
  const exchange = raw.exchange ? String(raw.exchange).trim().toUpperCase() : 'UNKNOWN';

  // Exchange mapping
  const exchangeInfo = EXCHANGE_COUNTRY_MAP[exchange];
  const country = raw.country
    ? String(raw.country).trim()
    : exchangeInfo
    ? exchangeInfo.country
    : null;

  const currency = raw.currency
    ? String(raw.currency).trim().toUpperCase()
    : exchangeInfo
    ? exchangeInfo.currency
    : null;

  // Date parsing
  const rawDate = raw.date || raw.ipoDate || raw.listingDate;
  const ipoDate = rawDate && typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rawDate)
    ? rawDate.slice(0, 10)
    : null;

  const openDate = raw.openDate || raw.subscriptionStartDate;
  const parsedOpenDate = openDate && typeof openDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(openDate)
    ? openDate.slice(0, 10)
    : null;

  const closeDate = raw.closeDate || raw.subscriptionEndDate;
  const parsedCloseDate = closeDate && typeof closeDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(closeDate)
    ? closeDate.slice(0, 10)
    : null;

  // Prices
  const prices = parsePriceRange(raw.price || raw.offerPrice, raw.priceRange);
  const listingPrice = parseOptionalNumber(raw.listingPrice || raw.firstDayClose);

  // Shares and sizes
  const sharesOffered = parseOptionalNumber(raw.shares || raw.numberOfShares);
  const dealSize = parseOptionalNumber(raw.dealSize || raw.offeringSize);
  const marketCap = parseOptionalNumber(raw.marketCap);
  const cik = raw.cik ? String(raw.cik).trim() : null;

  // Generate stable ID
  const stableId = raw.id
    ? String(raw.id)
    : cik
    ? `fmp-cik-${cik}`
    : symbol && ipoDate
    ? `fmp-${symbol.toLowerCase()}-${ipoDate}`
    : `fmp-${generateSlug(companyName, symbol)}-${ipoDate || 'nodate'}`;

  const slug = generateSlug(companyName, symbol);

  // Explicit status check: check if provider declared status or actions
  const rawStatus = String(raw.status || raw.actions || '').toLowerCase().trim();
  let status: IpoStatus = 'unknown';

  if (rawStatus.includes('cancel') || rawStatus.includes('withdrawn') || rawStatus.includes('postponed')) {
    status = 'cancelled';
  } else if (rawStatus.includes('priced') || rawStatus.includes('listed') || rawStatus.includes('trading')) {
    status = 'listed';
  } else if (rawStatus.includes('open') || rawStatus.includes('bidding') || rawStatus.includes('active')) {
    status = 'open';
  } else if (rawStatus.includes('expected') || rawStatus.includes('upcoming') || rawStatus.includes('filed')) {
    status = 'upcoming';
  } else {
    // Derive safely from evidence
    status = deriveIpoStatus({
      open_date: parsedOpenDate,
      close_date: parsedCloseDate,
      listing_date: ipoDate,
      listing_price: listingPrice,
    });
  }

  const nowIso = new Date().toISOString();

  return {
    id: stableId,
    slug,
    company_name: companyName,
    symbol,
    country,
    currency,
    segment: 'mainboard',
    exchange,
    open_date: parsedOpenDate,
    close_date: parsedCloseDate,
    allotment_date: null,
    refund_date: null,
    listing_date: ipoDate,
    ipo_date: ipoDate,
    price_band_low: prices.low,
    price_band_high: prices.high,
    lot_size: null,
    issue_size_cr: null,
    fresh_issue_cr: null,
    ofs_cr: null,
    issue_price: prices.exact,
    listing_price: listingPrice,
    shares_offered: sharesOffered,
    deal_size: dealSize,
    market_cap: marketCap,
    cik,
    registrar: null,
    lead_managers: null,
    about: null,
    logo_url: null,
    drhp_url: null,
    rhp_url: null,
    source,
    source_url: 'https://financialmodelingprep.com',
    is_demo: false,
    created_at: nowIso,
    updated_at: nowIso,
    status,
  };
}
