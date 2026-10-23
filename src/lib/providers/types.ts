import {
  IPOWithDetails,
  IpoFilterOptions,
  IpoDashboardStats,
  GmpHistory,
  SubscriptionHistory,
  Financial,
} from '@/types/ipo';

export interface IIpoProvider {
  name: string;
  isAvailable(): boolean;
  getIpos(filters?: IpoFilterOptions): Promise<IPOWithDetails[]>;
  getIpoBySlug(slug: string): Promise<IPOWithDetails | null>;
  getGmpHistory(ipoId: string): Promise<GmpHistory[]>;
  getSubscriptions(ipoId: string): Promise<SubscriptionHistory[]>;
  getFinancials(ipoId: string): Promise<Financial[]>;
  getDashboardStats(): Promise<IpoDashboardStats>;
  getLatestGmpMovers(limit?: number): Promise<IPOWithDetails[]>;
}
