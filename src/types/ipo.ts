export type IpoSegment = 'mainboard' | 'sme';

export type IpoExchange = 'NSE' | 'BSE' | 'both' | string;

export type IpoStatus =
  | 'upcoming'
  | 'open'
  | 'closed'
  | 'listed'
  | 'cancelled'
  | 'filed'
  | 'confidentially_filed'
  | 'priced'
  | 'unknown';

export interface IPO {
  id: string;
  slug: string;
  company_name: string;
  symbol: string | null;
  country?: string | null;
  currency?: string | null;
  segment: IpoSegment | string;
  exchange: IpoExchange;
  open_date: string | null;       // YYYY-MM-DD or ISO
  close_date: string | null;      // YYYY-MM-DD or ISO
  allotment_date: string | null;  // YYYY-MM-DD or ISO
  refund_date: string | null;     // YYYY-MM-DD or ISO
  listing_date: string | null;    // YYYY-MM-DD or ISO
  ipo_date?: string | null;       // Primary/scheduled IPO date (YYYY-MM-DD)
  price_band_low: number | null;
  price_band_high: number | null;
  lot_size: number | null;
  issue_size_cr: number | null;
  fresh_issue_cr: number | null;
  ofs_cr: number | null;
  issue_price: number | null;
  listing_price: number | null;
  shares_offered?: number | null;
  deal_size?: number | null;
  market_cap?: number | null;
  cik?: string | null;
  registrar: string | null;
  lead_managers: string[] | null;
  about: string | null;
  logo_url: string | null;
  drhp_url: string | null;
  rhp_url: string | null;
  source: string;
  source_url: string | null;
  source_note?: string | null;
  providerStatus?: string | null;
  derived_fields?: string[];
  raw_price?: string | null;
  is_demo: boolean;
  has_conflict?: boolean;
  conflict_details?: string[];
  created_at: string;
  updated_at: string;
  // Pre-IPO / Confidential Filings fields
  sub_title?: string | null;
  filing_status?: 'confidentially_filed' | 'public_s1' | string | null;
  source_type?: 'official' | 'reported' | string | null;
  last_private_valuation?: string | null;
  reported_note?: string | null;
  reported_source?: string | null;
  listing_date_note?: string | null;
  external_links?: Array<{ label: string; url: string }> | null;
  footer_disclaimer?: string | null;
  disable_bidding?: boolean;
}

export interface GmpHistory {
  id: string;
  ipo_id: string;
  gmp_value: number;
  recorded_at: string;
  source: string;
}

export interface SubscriptionHistory {
  id: string;
  ipo_id: string;
  qib_x: number | null;
  nii_x: number | null;
  retail_x: number | null;
  total_x: number | null;
  recorded_at: string;
  source: string;
}

export interface Financial {
  id: string;
  ipo_id: string;
  fiscal_year: string;
  revenue: number | null;
  profit: number | null;
  net_worth: number | null;
}

export interface IPOWithDetails extends IPO {
  status: IpoStatus;
  latest_gmp?: GmpHistory | null;
  latest_subscription?: SubscriptionHistory | null;
  gmp_history?: GmpHistory[];
  subscription_history?: SubscriptionHistory[];
  financials?: Financial[];
}

export interface IpoFilterOptions {
  segment?: IpoSegment | string;
  status?: IpoStatus;
  country?: string;
  exchange?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'open_date' | 'close_date' | 'listing_date' | 'issue_size_cr' | 'company_name' | 'ipo_date';
  sortOrder?: 'asc' | 'desc';
}

export interface IpoDashboardStats {
  openCount: number;
  upcomingCount: number;
  listingThisMonthCount: number;
  totalTracked: number;
}
