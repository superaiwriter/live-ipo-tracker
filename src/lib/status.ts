import { IpoStatus } from '@/types/ipo';
import { parseDateToIST } from './dates';

export interface IpoStatusInputs {
  open_date?: string | null;
  close_date?: string | null;
  listing_date?: string | null;
  listing_price?: number | null;
  status?: IpoStatus | string | null;
}

/**
 * CANONICAL STATUS DERIVATION FUNCTION (Rule 5 & Master Prompt Alignment)
 *
 * Rules:
 * 1. Never fabricate 'cancelled': only set if explicitly confirmed by provider.
 * 2. Never return 'listed' from dates alone: requires real evidence (listing_price > 0 or explicit provider status).
 *    If listing_date has passed without listing price or confirmation, returns 'closed' (if bidding ended) or 'unknown'.
 * 3. Never return 'open' from dates alone without complete subscription window evidence:
 *    Requires verified open_date AND close_date with open_date <= now <= close_date, or explicit provider status.
 *    If open_date is in the past but close_date is missing, status is 'unknown' (never assumed open).
 * 4. Missing dates or incomplete evidence return 'upcoming' (if future) or 'unknown'.
 */
export function deriveIpoStatus(
  ipo: IpoStatusInputs,
  nowReference?: Date | string | number
): IpoStatus {
  // 1. Check explicit provider status first (if confirmed by data provider)
  const explicit = ipo.status ? String(ipo.status).toLowerCase().trim() : '';
  if (explicit === 'cancelled' || explicit === 'withdrawn' || explicit === 'postponed') {
    return 'cancelled';
  }
  if (explicit === 'listed') {
    return 'listed';
  }
  if (explicit === 'open' || explicit === 'bidding') {
    return 'open';
  }
  if (explicit === 'closed') {
    return 'closed';
  }
  if (explicit === 'filed') {
    return 'filed';
  }
  if (explicit === 'priced') {
    return 'priced';
  }
  if (explicit === 'confidentially_filed' || explicit === 'confidentially filed') {
    return 'confidentially_filed';
  }
  if (explicit === 'upcoming' || explicit === 'expected') {
    return 'upcoming';
  }

  // 2. Verified Listing Evidence: listing price recorded and > 0
  if (ipo.listing_price !== null && ipo.listing_price !== undefined && ipo.listing_price > 0) {
    return 'listed';
  }

  const nowMs = nowReference
    ? typeof nowReference === 'number'
      ? nowReference
      : new Date(nowReference).getTime()
    : Date.now();

  const openMs = parseDateToIST(ipo.open_date, 'start');
  const closeMs = parseDateToIST(ipo.close_date, 'bidding_close');
  const listingMs = parseDateToIST(ipo.listing_date, 'listing_open');

  // If no dates at all are provided
  if (openMs === null && closeMs === null && listingMs === null) {
    return 'unknown';
  }

  // Future scheduled dates: upcoming
  if (openMs !== null && nowMs < openMs) {
    return 'upcoming';
  }
  if (openMs === null && listingMs !== null && nowMs < listingMs) {
    return 'upcoming';
  }

  // Bidding Open: requires BOTH confirmed open_date and close_date
  if (openMs !== null && closeMs !== null) {
    if (nowMs >= openMs && nowMs <= closeMs) {
      return 'open';
    }
    if (nowMs > closeMs) {
      // Past bidding close: if listing_price exists it would have returned 'listed' above.
      // Without listing price evidence, it remains 'closed' (awaiting listing confirmation).
      return 'closed';
    }
  }

  // Incomplete evidence cases:
  // If only open_date was known, and it is past, we cannot assume it remains open.
  // If only listing_date was known, and it is past, without listing price we cannot assume it listed.
  return 'unknown';
}
