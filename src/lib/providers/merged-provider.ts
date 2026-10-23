import { IIpoProvider } from './types';
import {
  IPOWithDetails,
  IpoFilterOptions,
  IpoDashboardStats,
  GmpHistory,
  SubscriptionHistory,
  Financial,
} from '@/types/ipo';
import { SupabaseIpoProvider } from './supabase-provider';
import { FmpIpoProvider } from './fmp-provider';
import { FinnhubIpoProvider, FinnhubFetchResult } from './finnhub-provider';
import { deduplicateIPOs } from '@/utils/deduplicateIPOs';
import { isListingThisMonthIST } from '@/lib/dates';
import { FmpFetchResult } from '@/services/ipoApi';

/**
 * MergedIpoProvider coordinates data fetching across connected sources:
 * 1. Supabase ('supabase-india') - Authoritative source for Indian NSE/BSE listings,
 *    official prospectus dates, subscription metrics, and grey market surveys.
 * 2. Finnhub ('finnhub') - Verified provider for US exchange listings (NASDAQ, NYSE).
 * 3. FMP ('fmp') - International listings (disabled by default via FMP_ENABLED=false).
 *
 * Merge priority rules:
 * - 'supabase-india' always takes precedence for Indian records.
 * - Conflicting attributes across providers are preserved with `has_conflict: true`
 *   and individual conflict strings in `conflict_details`.
 * - Provider errors, rate limits (HTTP 429), or missing credentials never crash the site.
 */
export class MergedIpoProvider implements IIpoProvider {
  name = 'MergedProvider';
  private supabaseProvider: SupabaseIpoProvider;
  private fmpProvider: FmpIpoProvider;
  private finnhubProvider: FinnhubIpoProvider;

  constructor() {
    this.supabaseProvider = new SupabaseIpoProvider();
    this.fmpProvider = new FmpIpoProvider();
    this.finnhubProvider = new FinnhubIpoProvider();
  }

  isAvailable(): boolean {
    return (
      this.supabaseProvider.isAvailable() ||
      this.finnhubProvider.isAvailable() ||
      this.fmpProvider.isAvailable()
    );
  }

  getFmpFetchResult(): FmpFetchResult | null {
    return this.fmpProvider.getLastFetchResult();
  }

  getFinnhubFetchResult(): FinnhubFetchResult | null {
    return this.finnhubProvider.getLastFetchResult();
  }

  async getIpos(filters?: IpoFilterOptions): Promise<IPOWithDetails[]> {
    const promises: Promise<IPOWithDetails[]>[] = [];

    // Query Supabase for authoritative curated records
    if (this.supabaseProvider.isAvailable()) {
      promises.push(
        this.supabaseProvider.getIpos(filters).catch((err) => {
          console.error('Supabase fetch failed in MergedProvider:', err);
          return [];
        })
      );
    }

    // Query Finnhub (unless a non-US country is specifically requested)
    if (this.finnhubProvider.isAvailable()) {
      if (
        !filters?.country ||
        filters.country.toLowerCase() === 'united states' ||
        filters.country.toLowerCase() === 'us' ||
        filters.country.toLowerCase() === 'usa'
      ) {
        promises.push(
          this.finnhubProvider.getIpos(filters).catch((err) => {
            console.error('Finnhub fetch failed in MergedProvider:', err);
            return [];
          })
        );
      }
    }

    // Query FMP (disabled by default unless FMP_ENABLED=true)
    if (this.fmpProvider.isAvailable()) {
      promises.push(
        this.fmpProvider.getIpos(filters).catch((err) => {
          console.error('FMP fetch failed in MergedProvider:', err);
          return [];
        })
      );
    }

    const results = await Promise.allSettled(promises);
    const combined: IPOWithDetails[] = [];

    for (const r of results) {
      if (r.status === 'fulfilled') {
        combined.push(...r.value);
      }
    }

    // Deduplicate and resolve merge priority
    let deduplicated = deduplicateIPOs(combined);

    // Apply country filter if specified
    if (filters?.country) {
      const cLower = filters.country.toLowerCase();
      deduplicated = deduplicated.filter(
        (i) => i.country && i.country.toLowerCase() === cLower
      );
    }

    // Apply exchange filter if specified
    if (filters?.exchange) {
      const exLower = filters.exchange.toLowerCase();
      deduplicated = deduplicated.filter(
        (i) => i.exchange && i.exchange.toLowerCase() === exLower
      );
    }

    // Apply status filter if specified
    if (filters?.status) {
      deduplicated = deduplicated.filter(
        (i) =>
          i.status === filters.status ||
          (filters.status === 'upcoming' && i.status === 'confidentially_filed')
      );
    }

    // Apply search filter if specified
    if (filters?.search) {
      const term = filters.search.toLowerCase().trim();
      deduplicated = deduplicated.filter(
        (i) =>
          i.company_name.toLowerCase().includes(term) ||
          (i.symbol && i.symbol.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      const field = filters.sortBy;
      const asc = filters.sortOrder === 'asc';
      deduplicated.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    if (filters?.limit) {
      return deduplicated.slice(0, filters.limit);
    }

    return deduplicated;
  }

  async getIpoBySlug(slug: string): Promise<IPOWithDetails | null> {
    // Check Supabase first for rich Indian details
    if (this.supabaseProvider.isAvailable()) {
      const sbResult = await this.supabaseProvider.getIpoBySlug(slug).catch(() => null);
      if (sbResult) return sbResult;
    }

    // Check Finnhub next
    if (this.finnhubProvider.isAvailable()) {
      const finnhubResult = await this.finnhubProvider.getIpoBySlug(slug).catch(() => null);
      if (finnhubResult) return finnhubResult;
    }

    // Fall back to FMP if enabled
    if (this.fmpProvider.isAvailable()) {
      const fmpResult = await this.fmpProvider.getIpoBySlug(slug).catch(() => null);
      if (fmpResult) return fmpResult;
    }

    return null;
  }

  async getGmpHistory(ipoId: string): Promise<GmpHistory[]> {
    return this.supabaseProvider.getGmpHistory(ipoId);
  }

  async getSubscriptions(ipoId: string): Promise<SubscriptionHistory[]> {
    return this.supabaseProvider.getSubscriptions(ipoId);
  }

  async getFinancials(ipoId: string): Promise<Financial[]> {
    return this.supabaseProvider.getFinancials(ipoId);
  }

  async getDashboardStats(): Promise<IpoDashboardStats> {
    const all = await this.getIpos();
    let openCount = 0;
    let upcomingCount = 0;
    let listingThisMonthCount = 0;

    for (const ipo of all) {
      if (ipo.status === 'open') openCount++;
      if (ipo.status === 'upcoming' || ipo.status === 'confidentially_filed') upcomingCount++;
      if (isListingThisMonthIST(ipo.listing_date || ipo.ipo_date)) listingThisMonthCount++;
    }

    return {
      openCount,
      upcomingCount,
      listingThisMonthCount,
      totalTracked: all.length,
    };
  }

  async getLatestGmpMovers(limit?: number): Promise<IPOWithDetails[]> {
    return this.supabaseProvider.getLatestGmpMovers(limit);
  }
}
