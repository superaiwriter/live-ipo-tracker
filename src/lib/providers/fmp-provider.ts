import { IIpoProvider } from './types';
import {
  IPOWithDetails,
  IpoFilterOptions,
  IpoDashboardStats,
  GmpHistory,
  SubscriptionHistory,
  Financial,
} from '@/types/ipo';
import { fetchFmpIpos, FmpFetchResult } from '@/services/ipoApi';
import { isListingThisMonthIST } from '@/lib/dates';

export class FmpIpoProvider implements IIpoProvider {
  name = 'FmpProvider';
  private lastFetchResult: FmpFetchResult | null = null;

  isAvailable(): boolean {
    const isEnabled = process.env.FMP_ENABLED === 'true';
    return Boolean(isEnabled && process.env.FMP_API_KEY && process.env.FMP_API_KEY.trim().length > 0);
  }

  getLastFetchResult(): FmpFetchResult | null {
    return this.lastFetchResult;
  }

  async getIpos(filters?: IpoFilterOptions): Promise<IPOWithDetails[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      // Calculate date window: default from 180 days ago to 90 days ahead
      const now = new Date();
      const defaultPast = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      const defaultFuture = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const startDate = filters?.dateFrom || defaultPast.toISOString().slice(0, 10);
      const endDate = filters?.dateTo || defaultFuture.toISOString().slice(0, 10);

      const result = await fetchFmpIpos(startDate, endDate);
      this.lastFetchResult = result;

      let list = result.ipos;

      if (filters?.country) {
        const cLower = filters.country.toLowerCase();
        list = list.filter((i) => i.country && i.country.toLowerCase() === cLower);
      }

      if (filters?.exchange) {
        const exLower = filters.exchange.toLowerCase();
        list = list.filter((i) => i.exchange && i.exchange.toLowerCase() === exLower);
      }

      if (filters?.status) {
        list = list.filter((i) => i.status === filters.status);
      }

      if (filters?.search) {
        const term = filters.search.toLowerCase().trim();
        list = list.filter(
          (i) =>
            i.company_name.toLowerCase().includes(term) ||
            (i.symbol && i.symbol.toLowerCase().includes(term))
        );
      }

      if (filters?.sortBy) {
        list.sort((a, b) => {
          const field = filters.sortBy!;
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return list;
    } catch (err) {
      console.error('FmpIpoProvider failed to fetch IPOs:', err);
      return [];
    }
  }

  async getIpoBySlug(slug: string): Promise<IPOWithDetails | null> {
    const list = await this.getIpos();
    const found = list.find((i) => i.slug === slug);
    return found || null;
  }

  async getGmpHistory(): Promise<GmpHistory[]> {
    // FMP does not provide Indian grey market premium data
    return [];
  }

  async getSubscriptions(): Promise<SubscriptionHistory[]> {
    // FMP does not provide Indian category subscription bids
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
