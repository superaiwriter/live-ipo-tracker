import { IIpoProvider } from './types';
import {
  IPO,
  IPOWithDetails,
  IpoFilterOptions,
  IpoDashboardStats,
  GmpHistory,
  SubscriptionHistory,
  Financial,
} from '@/types/ipo';
import { supabasePublic, isSupabaseConfigured } from '@/lib/db/supabase';
import { deriveIpoStatus } from '@/lib/status';
import { isListingThisMonthIST } from '@/lib/dates';
import { getLocalDemoIpos } from '@/lib/demo/demoData';
import curatedIposData from '../../../data/india-ipos.json';

function isDemoAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_DATA === 'true';
}

/**
 * Loads verified local curated records (e.g. data/india-ipos.json).
 * Uses static JSON import so it is reliably bundled on Vercel serverless functions.
 */
export function getLocalIndiaIpos(): IPOWithDetails[] {
  try {
    if (Array.isArray(curatedIposData)) {
      return (curatedIposData as unknown as IPO[]).map((item: IPO) => ({
        ...item,
        status: deriveIpoStatus(item),
      }));
    }
  } catch (err) {
    console.error('Failed to load curated data/india-ipos.json:', err);
  }
  return [];
}

/**
 * Merges Supabase records with curated JSON records.
 * Rules:
 * 1. If the same slug or id exists in both, Supabase wins.
 * 2. Records present only in curated JSON are preserved.
 * 3. If Supabase is empty or fails, all curated JSON records are returned.
 */
export function mergeSupabaseAndCurated(
  sbRecords: IPOWithDetails[],
  curatedRecords: IPOWithDetails[]
): IPOWithDetails[] {
  if (!sbRecords || sbRecords.length === 0) {
    return curatedRecords || [];
  }
  if (!curatedRecords || curatedRecords.length === 0) {
    return sbRecords || [];
  }

  const sbSlugs = new Set(sbRecords.map((r) => r.slug).filter(Boolean));
  const sbIds = new Set(sbRecords.map((r) => r.id).filter(Boolean));

  const curatedOnly = curatedRecords.filter(
    (c) => (!c.slug || !sbSlugs.has(c.slug)) && (!c.id || !sbIds.has(c.id))
  );

  return [...sbRecords, ...curatedOnly];
}

export class SupabaseIpoProvider implements IIpoProvider {
  name = 'SupabaseProvider';
  private client: any;

  constructor(client: any = supabasePublic) {
    this.client = client;
  }

  isAvailable(): boolean {
    return (
      (isSupabaseConfigured() && Boolean(this.client)) ||
      getLocalIndiaIpos().length > 0 ||
      isDemoAllowed()
    );
  }

  async getIpos(filters?: IpoFilterOptions): Promise<IPOWithDetails[]> {
    const curated = getLocalIndiaIpos();
    let sbProcessed: IPOWithDetails[] = [];

    if (isSupabaseConfigured() && this.client) {
      try {
        let query = this.client.from('ipos').select('*');

        if (filters?.segment) {
          query = query.eq('segment', filters.segment);
        }

        if (filters?.search) {
          const term = filters.search.trim();
          query = query.or(`company_name.ilike.%${term}%,symbol.ilike.%${term}%`);
        }

        const { data, error } = await query.order('open_date', { ascending: false });

        if (!error && data) {
          const rawIpos = data as IPO[];
          const ipoIds = rawIpos.map((i) => i.id);

          const gmpMap = await this.getLatestGmpMap(ipoIds);

          sbProcessed = rawIpos.map((ipo) => {
            const status = deriveIpoStatus(ipo);
            const latest_gmp = gmpMap.get(ipo.id) || null;
            return {
              ...ipo,
              status,
              latest_gmp,
            };
          });
        } else if (error) {
          console.error('Supabase query error:', error.message);
        }
      } catch (err) {
        console.error('Failed to load IPOs from Supabase:', err);
      }
    }

    // Merge Supabase records with Curated JSON (Supabase wins on collision)
    let combined = mergeSupabaseAndCurated(sbProcessed, curated);

    // If both Supabase and Curated are empty, check demo data
    if (combined.length === 0 && isDemoAllowed()) {
      combined = getLocalDemoIpos();
    }

    // Apply all filters in memory so both Supabase & Curated records are consistently filtered
    let records = combined;

    if (filters?.segment) {
      records = records.filter((i) => i.segment === filters.segment);
    }
    if (filters?.country) {
      const c = filters.country.toLowerCase().trim();
      records = records.filter(
        (i) =>
          i.country &&
          (i.country.toLowerCase() === c ||
            (c === 'us' && i.country.toLowerCase() === 'united states') ||
            (c === 'united-states' && i.country.toLowerCase() === 'united states') ||
            (c === 'india' && i.country.toLowerCase() === 'india'))
      );
    }
    if (filters?.status) {
      records = records.filter(
        (i) =>
          i.status === filters.status ||
          (filters.status === 'upcoming' && i.status === 'confidentially_filed')
      );
    }
    if (filters?.search) {
      const t = filters.search.toLowerCase().trim();
      records = records.filter(
        (i) =>
          i.company_name.toLowerCase().includes(t) ||
          (i.symbol && i.symbol.toLowerCase().includes(t))
      );
    }
    if (filters?.limit) {
      records = records.slice(0, filters.limit);
    }

    return records;
  }

  async getIpoBySlug(slug: string): Promise<IPOWithDetails | null> {
    const curated = getLocalIndiaIpos();
    const curatedMatch = curated.find((i) => i.slug === slug);

    if (isSupabaseConfigured() && this.client) {
      try {
        const { data, error } = await this.client
          .from('ipos')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const ipo = data as IPO;
          const status = deriveIpoStatus(ipo);

          // Fetch related sub-records in parallel
          const [gmp_history, subscription_history, financials] = await Promise.all([
            this.getGmpHistory(ipo.id),
            this.getSubscriptions(ipo.id),
            this.getFinancials(ipo.id),
          ]);

          const latest_gmp = gmp_history.length > 0 ? gmp_history[0] : null;
          const latest_subscription =
            subscription_history.length > 0 ? subscription_history[0] : null;

          return {
            ...ipo,
            status,
            latest_gmp,
            latest_subscription,
            gmp_history,
            subscription_history,
            financials,
          };
        }
      } catch (err) {
        console.error(`Error loading IPO by slug "${slug}" from Supabase:`, err);
      }
    }

    // If Supabase did not have this slug (e.g. Anthropic, OpenAI) or errored, return curated match
    if (curatedMatch) {
      return curatedMatch;
    }

    if (isDemoAllowed()) {
      const demo = getLocalDemoIpos();
      return demo.find((i) => i.slug === slug) || null;
    }

    return null;
  }

  async getGmpHistory(ipoId: string): Promise<GmpHistory[]> {
    const local = getLocalIndiaIpos().find((i) => i.id === ipoId || i.slug === ipoId);

    if (isSupabaseConfigured() && this.client) {
      try {
        const { data, error } = await this.client
          .from('gmp_history')
          .select('*')
          .eq('ipo_id', ipoId)
          .order('recorded_at', { ascending: false });

        if (!error && data && data.length > 0) return data as GmpHistory[];
      } catch (err) {
        console.error('Error fetching GMP history:', err);
      }
    }

    if (local?.latest_gmp) return [local.latest_gmp];
    if (isDemoAllowed()) {
      const item = getLocalDemoIpos().find((i) => i.id === ipoId);
      return item?.latest_gmp ? [item.latest_gmp] : [];
    }
    return [];
  }

  async getSubscriptions(ipoId: string): Promise<SubscriptionHistory[]> {
    const local = getLocalIndiaIpos().find((i) => i.id === ipoId || i.slug === ipoId);

    if (isSupabaseConfigured() && this.client) {
      try {
        const { data, error } = await this.client
          .from('subscription_history')
          .select('*')
          .eq('ipo_id', ipoId)
          .order('recorded_at', { ascending: false });

        if (!error && data && data.length > 0) return data as SubscriptionHistory[];
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
      }
    }

    if (local?.latest_subscription) return [local.latest_subscription];
    if (isDemoAllowed()) {
      const item = getLocalDemoIpos().find((i) => i.id === ipoId);
      return item?.latest_subscription ? [item.latest_subscription] : [];
    }
    return [];
  }

  async getFinancials(ipoId: string): Promise<Financial[]> {
    const local = getLocalIndiaIpos().find((i) => i.id === ipoId || i.slug === ipoId);

    if (isSupabaseConfigured() && this.client) {
      try {
        const { data, error } = await this.client
          .from('financials')
          .select('*')
          .eq('ipo_id', ipoId)
          .order('fiscal_year', { ascending: false });

        if (!error && data && data.length > 0) return data as Financial[];
      } catch (err) {
        console.error('Error fetching financials:', err);
      }
    }

    if (local?.financials) return local.financials;
    if (isDemoAllowed()) {
      const item = getLocalDemoIpos().find((i) => i.id === ipoId);
      return item?.financials || [];
    }
    return [];
  }

  async getDashboardStats(): Promise<IpoDashboardStats> {
    const all = await this.getIpos();
    let openCount = 0;
    let upcomingCount = 0;
    let listingThisMonthCount = 0;

    for (const ipo of all) {
      if (ipo.status === 'open') openCount++;
      if (ipo.status === 'upcoming' || ipo.status === 'confidentially_filed') upcomingCount++;
      if (isListingThisMonthIST(ipo.listing_date)) listingThisMonthCount++;
    }

    return {
      openCount,
      upcomingCount,
      listingThisMonthCount,
      totalTracked: all.length,
    };
  }

  async getLatestGmpMovers(limit: number = 5): Promise<IPOWithDetails[]> {
    const all = await this.getIpos();
    return all
      .filter((i) => i.latest_gmp !== null && i.latest_gmp !== undefined)
      .sort((a, b) => (b.latest_gmp?.gmp_value || 0) - (a.latest_gmp?.gmp_value || 0))
      .slice(0, limit);
  }

  private async getLatestGmpMap(ipoIds: string[]): Promise<Map<string, GmpHistory>> {
    const map = new Map<string, GmpHistory>();
    if (ipoIds.length === 0 || !this.client) return map;

    try {
      const { data, error } = await this.client
        .from('gmp_history')
        .select('*')
        .in('ipo_id', ipoIds)
        .order('recorded_at', { ascending: false });

      if (error || !data) return map;

      for (const item of data) {
        if (!map.has(item.ipo_id)) {
          map.set(item.ipo_id, item as GmpHistory);
        }
      }
    } catch (err) {
      console.error('Error fetching latest GMP map:', err);
    }

    return map;
  }
}
