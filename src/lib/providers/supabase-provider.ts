import fs from 'fs';
import path from 'path';
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

function isDemoAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_DATA === 'true';
}

/**
 * Loads verified local Indian records (e.g. data/india-ipos.json) when database is not configured.
 */
function getLocalIndiaIpos(): IPOWithDetails[] {
  try {
    const filePath = path.resolve(process.cwd(), 'data', 'india-ipos.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((item: IPO) => ({
          ...item,
          status: deriveIpoStatus(item),
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load data/india-ipos.json:', err);
  }
  return [];
}

export class SupabaseIpoProvider implements IIpoProvider {
  name = 'SupabaseProvider';

  isAvailable(): boolean {
    return (
      (isSupabaseConfigured() && supabasePublic !== null) ||
      getLocalIndiaIpos().length > 0 ||
      isDemoAllowed()
    );
  }

  async getIpos(filters?: IpoFilterOptions): Promise<IPOWithDetails[]> {
    if (!isSupabaseConfigured() || !supabasePublic) {
      const localIndia = getLocalIndiaIpos();
      let records: IPOWithDetails[] = [];

      if (localIndia.length > 0) {
        records = localIndia;
      } else if (isDemoAllowed()) {
        records = getLocalDemoIpos();
      } else {
        return [];
      }

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

    try {
      let query = supabasePublic.from('ipos').select('*');

      if (filters?.segment) {
        query = query.eq('segment', filters.segment);
      }

      if (filters?.search) {
        const term = filters.search.trim();
        query = query.or(`company_name.ilike.%${term}%,symbol.ilike.%${term}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query.order('open_date', { ascending: false });

      if (error || !data) {
        console.error('Supabase query error:', error?.message);
        return [];
      }

      const rawIpos = data as IPO[];
      const ipoIds = rawIpos.map((i) => i.id);

      // Fetch latest GMP map in one query to avoid N+1 queries
      const gmpMap = await this.getLatestGmpMap(ipoIds);

      // Derive status safely and attach latest GMP
      const processed: IPOWithDetails[] = rawIpos.map((ipo) => {
        const status = deriveIpoStatus(ipo);
        const latest_gmp = gmpMap.get(ipo.id) || null;
        return {
          ...ipo,
          status,
          latest_gmp,
        };
      });

      // Filter by status in memory (status is derived dynamically via Rule 5)
      if (filters?.status) {
        return processed.filter((i) => i.status === filters.status);
      }

      return processed;
    } catch (err) {
      console.error('Failed to load IPOs:', err);
      return [];
    }
  }

  async getIpoBySlug(slug: string): Promise<IPOWithDetails | null> {
    if (!isSupabaseConfigured() || !supabasePublic) {
      const localIndia = getLocalIndiaIpos();
      const found = localIndia.find((i) => i.slug === slug);
      if (found) return found;

      if (isDemoAllowed()) {
        const demo = getLocalDemoIpos();
        return demo.find((i) => i.slug === slug) || null;
      }
      return null;
    }

    try {
      const { data, error } = await supabasePublic
        .from('ipos')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return null;
      }

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
    } catch (err) {
      console.error(`Error loading IPO by slug "${slug}":`, err);
      return null;
    }
  }

  async getGmpHistory(ipoId: string): Promise<GmpHistory[]> {
    if (!isSupabaseConfigured() || !supabasePublic) {
      const local = getLocalIndiaIpos().find((i) => i.id === ipoId || i.slug === ipoId);
      if (local) return local.latest_gmp ? [local.latest_gmp] : [];

      if (isDemoAllowed()) {
        const item = getLocalDemoIpos().find((i) => i.id === ipoId);
        return item?.latest_gmp ? [item.latest_gmp] : [];
      }
      return [];
    }

    try {
      const { data, error } = await supabasePublic
        .from('gmp_history')
        .select('*')
        .eq('ipo_id', ipoId)
        .order('recorded_at', { ascending: false });

      if (error || !data) return [];
      return data as GmpHistory[];
    } catch (err) {
      console.error('Error fetching GMP history:', err);
      return [];
    }
  }

  async getSubscriptions(ipoId: string): Promise<SubscriptionHistory[]> {
    if (!isSupabaseConfigured() || !supabasePublic) {
      const local = getLocalIndiaIpos().find((i) => i.id === ipoId || i.slug === ipoId);
      if (local) return local.latest_subscription ? [local.latest_subscription] : [];

      if (isDemoAllowed()) {
        const item = getLocalDemoIpos().find((i) => i.id === ipoId);
        return item?.latest_subscription ? [item.latest_subscription] : [];
      }
      return [];
    }

    try {
      const { data, error } = await supabasePublic
        .from('subscription_history')
        .select('*')
        .eq('ipo_id', ipoId)
        .order('recorded_at', { ascending: false });

      if (error || !data) return [];
      return data as SubscriptionHistory[];
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      return [];
    }
  }

  async getFinancials(ipoId: string): Promise<Financial[]> {
    if (!isSupabaseConfigured() || !supabasePublic) {
      const local = getLocalIndiaIpos().find((i) => i.id === ipoId || i.slug === ipoId);
      if (local) return local.financials || [];

      if (isDemoAllowed()) {
        const item = getLocalDemoIpos().find((i) => i.id === ipoId);
        return item?.financials || [];
      }
      return [];
    }

    try {
      const { data, error } = await supabasePublic
        .from('financials')
        .select('*')
        .eq('ipo_id', ipoId)
        .order('fiscal_year', { ascending: false });

      if (error || !data) return [];
      return data as Financial[];
    } catch (err) {
      console.error('Error fetching financials:', err);
      return [];
    }
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
    if (ipoIds.length === 0 || !supabasePublic) return map;

    try {
      const { data, error } = await supabasePublic
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
