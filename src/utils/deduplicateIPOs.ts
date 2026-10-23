import { IPOWithDetails } from '../types/ipo';

/**
 * Normalises a string key component for stable composite hashing.
 */
function cleanKey(val?: string | null): string {
  if (!val) return '';
  return val.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Computes deduplication key for an IPO record:
 * 1. Stable provider ID (if non-empty and not generic/transient)
 * 2. Composite key: ticker + name + exchange + country + date
 */
export function getIpoDeduplicationKey(ipo: IPOWithDetails): string {
  // If explicitly matching by symbol across providers in same country/exchange:
  const ticker = cleanKey(ipo.symbol);
  const country = cleanKey(ipo.country);

  // Cross-provider match by ticker + country if available
  if (ticker && country) {
    return `ticker_country:${ticker}|${country}`;
  }

  if (ipo.id && ipo.id.trim() && !ipo.id.startsWith('temp-')) {
    return `id:${ipo.id.trim()}`;
  }

  const name = cleanKey(ipo.company_name);
  const exchange = cleanKey(ipo.exchange);
  const date = cleanKey(ipo.listing_date || ipo.ipo_date || ipo.open_date);

  return `composite:${ticker}|${name}|${exchange}|${country}|${date}`;
}

/**
 * Merge Priority Documentation:
 * 1. 'supabase-india' has authoritative priority for Indian (NSE/BSE) records with rich GMP,
 *    detailed lot sizes, lead managers, and SEBI filings.
 * 2. If both records provide non-null differing values for prices, dates, or status,
 *    a conflict is flagged via `has_conflict: true` and `conflict_details`.
 * 3. Non-null values always take precedence over null/undefined.
 */
function mergeRecords(primary: IPOWithDetails, secondary: IPOWithDetails): IPOWithDetails {
  // Determine authoritative primary record
  // If secondary is 'supabase-india' and primary is 'fmp', prefer supabase-india as primary
  let main = primary;
  let other = secondary;

  if (secondary.source === 'supabase-india' && primary.source !== 'supabase-india') {
    main = secondary;
    other = primary;
  }

  const conflicts: string[] = [];

  // Check price conflict
  if (
    main.issue_price !== null &&
    other.issue_price !== null &&
    main.issue_price !== other.issue_price
  ) {
    conflicts.push(`Issue price differs: ${main.source} (${main.issue_price}) vs ${other.source} (${other.issue_price})`);
  }

  // Check listing date conflict
  if (
    main.listing_date &&
    other.listing_date &&
    main.listing_date !== other.listing_date
  ) {
    conflicts.push(`Listing date differs: ${main.source} (${main.listing_date}) vs ${other.source} (${other.listing_date})`);
  }

  // Check status conflict if neither is 'unknown'
  if (
    main.status !== 'unknown' &&
    other.status !== 'unknown' &&
    main.status !== other.status
  ) {
    conflicts.push(`Status differs: ${main.source} (${main.status}) vs ${other.source} (${other.status})`);
  }

  const hasConflict = conflicts.length > 0 || main.has_conflict || other.has_conflict;
  const mergedConflicts = Array.from(
    new Set([...(main.conflict_details || []), ...(other.conflict_details || []), ...conflicts])
  );

  return {
    ...main,
    symbol: main.symbol || other.symbol,
    country: main.country || other.country,
    currency: main.currency || other.currency,
    exchange: main.exchange && main.exchange !== 'UNKNOWN' ? main.exchange : other.exchange,
    open_date: main.open_date || other.open_date,
    close_date: main.close_date || other.close_date,
    listing_date: main.listing_date || other.listing_date,
    ipo_date: main.ipo_date || other.ipo_date,
    price_band_low: main.price_band_low ?? other.price_band_low,
    price_band_high: main.price_band_high ?? other.price_band_high,
    issue_price: main.issue_price ?? other.issue_price,
    listing_price: main.listing_price ?? other.listing_price,
    shares_offered: main.shares_offered ?? other.shares_offered,
    deal_size: main.deal_size ?? other.deal_size,
    market_cap: main.market_cap ?? other.market_cap,
    cik: main.cik || other.cik,
    about: main.about || other.about,
    // Preserve rich Indian sub-details from Supabase if present
    latest_gmp: main.latest_gmp || other.latest_gmp,
    latest_subscription: main.latest_subscription || other.latest_subscription,
    gmp_history: main.gmp_history || other.gmp_history,
    subscription_history: main.subscription_history || other.subscription_history,
    financials: main.financials || other.financials,
    // Preserve provider metadata
    source_note: main.source_note || other.source_note,
    providerStatus: main.providerStatus || other.providerStatus,
    derived_fields: main.derived_fields || other.derived_fields,
    raw_price: main.raw_price || other.raw_price,
    // Status priority: prefer confirmed status over 'unknown'
    status: main.status !== 'unknown' ? main.status : other.status,
    has_conflict: hasConflict,
    conflict_details: mergedConflicts.length > 0 ? mergedConflicts : undefined,
  };
}

/**
 * Deduplicates an array of IPO records using:
 * 1. Stable provider ID or ticker + country composite key
 * 2. Merges duplicate records with documented priority
 * 3. Flags conflicts if values diverge
 */
export function deduplicateIPOs(ipos: IPOWithDetails[]): IPOWithDetails[] {
  const seen = new Map<string, IPOWithDetails>();

  for (const ipo of ipos) {
    const key = getIpoDeduplicationKey(ipo);
    if (!seen.has(key)) {
      seen.set(key, ipo);
    } else {
      const existing = seen.get(key)!;
      seen.set(key, mergeRecords(existing, ipo));
    }
  }

  return Array.from(seen.values());
}
