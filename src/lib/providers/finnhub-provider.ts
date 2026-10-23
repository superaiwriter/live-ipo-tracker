import { IIpoProvider } from './types';
import {
  IPOWithDetails,
  IpoFilterOptions,
  IpoDashboardStats,
  GmpHistory,
  SubscriptionHistory,
  Financial,
  IpoStatus,
} from '@/types/ipo';
import { deduplicateIPOs } from '@/utils/deduplicateIPOs';
import { generateSlug } from '@/utils/ipoNormaliser';
import { isListingThisMonthIST } from '@/lib/dates';

export interface FinnhubRawRecord {
  date?: string | null;
  exchange?: string | null;
  name?: string | null;
  numberOfShares?: number | null;
  price?: string | null;
  status?: string | null;
  symbol?: string | null;
  totalSharesValue?: number | null;
}

export interface FinnhubFetchResult {
  fetchedAt: string;
  isComplete: boolean;
  totalRecords: number;
  httpStatus?: number;
  errorMessage?: string;
}

function cleanStr(val?: string | null): string {
  if (!val) return '';
  return val.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Defensively parses price string (e.g. "$14.00 - $16.00" or "$15.00")
 * Only sets numeric values if parsed cleanly without guessing.
 */
export function parseFinnhubPrice(rawPrice?: string | null): {
  low: number | null;
  high: number | null;
  exact: number | null;
  raw: string | null;
} {
  if (!rawPrice || typeof rawPrice !== 'string' || !rawPrice.trim()) {
    return { low: null, high: null, exact: null, raw: null };
  }

  const trimmed = rawPrice.trim();

  // Check for range like "$14.00 - $16.00" or "14 - 16"
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').map((p) => {
      const cleaned = p.replace(/[^0-9.]/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    });

    if (parts.length === 2 && parts[0] !== null && parts[1] !== null) {
      return {
        low: Math.min(parts[0], parts[1]),
        high: Math.max(parts[0], parts[1]),
        exact: null,
        raw: trimmed,
      };
    }
  }

  // Single price like "$15.00" or "15.5"
  const cleanedSingle = trimmed.replace(/[^0-9.]/g, '').trim();
  const singleNum = parseFloat(cleanedSingle);
  if (!isNaN(singleNum) && /^\$?\d+(\.\d+)?$/.test(trimmed)) {
    return {
      low: null,
      high: null,
      exact: singleNum,
      raw: trimmed,
    };
  }

  // Malformed or non-numeric (e.g. "TBD", "N/A")
  return {
    low: null,
    high: null,
    exact: null,
    raw: trimmed,
  };
}

/**
 * Normalises a verified Finnhub raw IPO record into canonical IPOWithDetails.
 */
export function normaliseFinnhubRecord(raw: FinnhubRawRecord): IPOWithDetails {
  const companyName = (raw.name && raw.name.trim()) || raw.symbol || 'Not declared';
  const symbol = raw.symbol && raw.symbol.trim() ? raw.symbol.trim() : null;
  const rawExchange = raw.exchange && raw.exchange.trim() ? raw.exchange.trim() : null;
  const exchange = rawExchange || 'UNKNOWN';

  // Country derivation: set "United States" ONLY when exchange is NASDAQ* or NYSE*
  let country: string | null = null;
  let currency: string | null = null;
  const derivedFields: string[] = [];

  if (rawExchange) {
    const upperEx = rawExchange.toUpperCase();
    if (upperEx.startsWith('NASDAQ') || upperEx.startsWith('NYSE')) {
      country = 'United States';
      currency = 'USD';
      derivedFields.push('country', 'currency');
    }
  }

  // Status mapping:
  // withdrawn -> cancelled
  // expected -> upcoming
  // filed -> filed
  // priced -> priced
  // Never infer listed or open from dates alone
  const rawStatus = raw.status ? raw.status.toLowerCase().trim() : '';
  let status: IpoStatus = 'unknown';

  if (rawStatus === 'withdrawn') {
    status = 'cancelled';
  } else if (rawStatus === 'expected') {
    status = 'upcoming';
  } else if (rawStatus === 'filed') {
    status = 'filed';
  } else if (rawStatus === 'priced') {
    status = 'priced';
  }

  // Date parsing
  const rawDate = raw.date && typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw.date)
    ? raw.date.slice(0, 10)
    : null;

  // Price parsing
  const priceInfo = parseFinnhubPrice(raw.price);

  // Shares and valuation: keep null when null/undefined (never 0)
  const numberOfShares = typeof raw.numberOfShares === 'number' && !isNaN(raw.numberOfShares)
    ? raw.numberOfShares
    : null;

  const totalSharesValue = typeof raw.totalSharesValue === 'number' && !isNaN(raw.totalSharesValue)
    ? raw.totalSharesValue
    : null;

  // Deterministic composite ID
  const id = `finnhub-${cleanStr(symbol || 'nosym')}-${cleanStr(companyName)}-${cleanStr(rawExchange || 'noex')}-${cleanStr(rawDate || 'nodate')}`;
  const slug = generateSlug(companyName, symbol);
  const nowIso = new Date().toISOString();

  return {
    id,
    slug,
    company_name: companyName,
    symbol,
    country,
    currency,
    segment: 'mainboard',
    exchange,
    open_date: null,
    close_date: null,
    allotment_date: null,
    refund_date: null,
    listing_date: rawDate,
    ipo_date: rawDate,
    price_band_low: priceInfo.low,
    price_band_high: priceInfo.high,
    lot_size: null,
    issue_size_cr: null,
    fresh_issue_cr: null,
    ofs_cr: null,
    issue_price: priceInfo.exact,
    listing_price: null,
    shares_offered: numberOfShares,
    deal_size: totalSharesValue,
    market_cap: null,
    cik: null,
    registrar: null,
    lead_managers: null,
    about: null,
    logo_url: null,
    drhp_url: null,
    rhp_url: null,
    source: 'finnhub',
    source_url: 'https://finnhub.io',
    providerStatus: raw.status || null,
    derived_fields: derivedFields.length > 0 ? derivedFields : undefined,
    raw_price: priceInfo.raw,
    is_demo: false,
    created_at: nowIso,
    updated_at: nowIso,
    status,
  };
}

export class FinnhubIpoProvider implements IIpoProvider {
  name = 'FinnhubProvider';
  private lastFetchResult: FinnhubFetchResult | null = null;

  // In-memory cache to respect rate limit & prevent redundant queries
  private cache: {
    data: IPOWithDetails[];
    timestamp: number;
    rangeKey: string;
  } | null = null;

  isAvailable(): boolean {
    return Boolean(process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY.trim().length > 0);
  }

  getLastFetchResult(): FinnhubFetchResult | null {
    return this.lastFetchResult;
  }

  private getCacheDurationMs(): number {
    const envSec = process.env.FINNHUB_CACHE_REVALIDATE_SECONDS;
    if (envSec) {
      const parsed = parseInt(envSec, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed * 1000;
    }
    // Default: 6 hours
    return 6 * 60 * 60 * 1000;
  }

  /**
   * Splits a date span into windows of at most maxDays (90 days default).
   */
  private splitDateWindows(startDate: string, endDate: string, maxDays = 90): { from: string; to: string }[] {
    const windows: { from: string; to: string }[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [{ from: startDate, to: endDate }];
    }

    let curStart = new Date(start);
    while (curStart <= end) {
      const curEnd = new Date(curStart.getTime() + maxDays * 24 * 60 * 60 * 1000);
      const actualEnd = curEnd < end ? curEnd : end;

      windows.push({
        from: curStart.toISOString().slice(0, 10),
        to: actualEnd.toISOString().slice(0, 10),
      });

      // Advance by 1 day past actualEnd
      curStart = new Date(actualEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    return windows;
  }

  async getIpos(filters?: IpoFilterOptions): Promise<IPOWithDetails[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const apiKey = process.env.FINNHUB_API_KEY!.trim();

    // Default range: 90 days ago to 90 days ahead
    const now = new Date();
    const defaultPast = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const defaultFuture = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const startDate = filters?.dateFrom || defaultPast.toISOString().slice(0, 10);
    const endDate = filters?.dateTo || defaultFuture.toISOString().slice(0, 10);
    const rangeKey = `${startDate}_${endDate}`;

    // Check cache
    const cacheTtl = this.getCacheDurationMs();
    if (
      this.cache &&
      this.cache.rangeKey === rangeKey &&
      Date.now() - this.cache.timestamp < cacheTtl
    ) {
      return this.applyFilters(this.cache.data, filters);
    }

    const windows = this.splitDateWindows(startDate, endDate, 90);
    const allRecords: FinnhubRawRecord[] = [];
    let isComplete = true;
    let lastHttpStatus = 200;
    let errorMessage: string | undefined;

    for (const win of windows) {
      const url = `https://finnhub.io/api/v1/calendar/ipo?from=${win.from}&to=${win.to}`;

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Finnhub-Token': apiKey,
            'Accept': 'application/json',
          },
          // Revalidate cache support for Next.js data cache
          next: { revalidate: Math.floor(cacheTtl / 1000) },
        });

        lastHttpStatus = res.status;

        if (res.status === 429) {
          console.warn('Finnhub rate limit reached (HTTP 429). Stopping without retrying.');
          isComplete = false;
          errorMessage = 'Finnhub rate limit reached (HTTP 429).';
          break; // Stop immediately without retry loop
        }

        if (!res.ok) {
          console.warn(`Finnhub returned HTTP ${res.status} for range ${win.from} to ${win.to}`);
          isComplete = false;
          errorMessage = `HTTP error ${res.status}`;
          break;
        }

        const json = await res.json();
        if (Array.isArray(json?.ipoCalendar)) {
          allRecords.push(...json.ipoCalendar);
        }
      } catch (err: unknown) {
        console.error('Finnhub fetch request failed:', err);
        isComplete = false;
        errorMessage = err instanceof Error ? err.message : String(err);
        break;
      }
    }

    // Normalise and deduplicate
    const normalised = allRecords.map((r) => normaliseFinnhubRecord(r));
    const deduplicated = deduplicateIPOs(normalised);

    // Save fetch result
    this.lastFetchResult = {
      fetchedAt: new Date().toISOString(),
      isComplete,
      totalRecords: deduplicated.length,
      httpStatus: lastHttpStatus,
      errorMessage,
    };

    // Store in cache
    this.cache = {
      data: deduplicated,
      timestamp: Date.now(),
      rangeKey,
    };

    return this.applyFilters(deduplicated, filters);
  }

  private applyFilters(list: IPOWithDetails[], filters?: IpoFilterOptions): IPOWithDetails[] {
    let result = list;

    if (filters?.country) {
      const cLower = filters.country.toLowerCase();
      result = result.filter((i) => i.country && i.country.toLowerCase() === cLower);
    }

    if (filters?.exchange) {
      const exLower = filters.exchange.toLowerCase();
      result = result.filter((i) => i.exchange && i.exchange.toLowerCase() === exLower);
    }

    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status);
    }

    if (filters?.search) {
      const term = filters.search.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.company_name.toLowerCase().includes(term) ||
          (i.symbol && i.symbol.toLowerCase().includes(term))
      );
    }

    if (filters?.sortBy) {
      result.sort((a, b) => {
        const field = filters.sortBy!;
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (filters?.limit) {
      return result.slice(0, filters.limit);
    }

    return result;
  }

  async getIpoBySlug(slug: string): Promise<IPOWithDetails | null> {
    const list = await this.getIpos();
    const found = list.find((i) => i.slug === slug);
    return found || null;
  }

  async getGmpHistory(): Promise<GmpHistory[]> {
    return [];
  }

  async getSubscriptions(): Promise<SubscriptionHistory[]> {
    return [];
  }

  async getFinancials(): Promise<Financial[]> {
    return [];
  }

  async getDashboardStats(): Promise<IpoDashboardStats> {
    const all = await this.getIpos();
    let openCount = 0;
    let upcomingCount = 0;
    let listingThisMonthCount = 0;

    for (const ipo of all) {
      if (ipo.status === 'open') openCount++;
      if (ipo.status === 'upcoming') upcomingCount++;
      if (isListingThisMonthIST(ipo.listing_date || ipo.ipo_date)) listingThisMonthCount++;
    }

    return {
      openCount,
      upcomingCount,
      listingThisMonthCount,
      totalTracked: all.length,
    };
  }

  async getLatestGmpMovers(): Promise<IPOWithDetails[]> {
    return [];
  }
}
