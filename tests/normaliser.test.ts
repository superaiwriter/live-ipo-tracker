import { describe, it, expect } from 'vitest';
import { normaliseFmpIpo, parsePriceRange } from '../src/utils/ipoNormaliser';
import { deduplicateIPOs, getIpoDeduplicationKey } from '../src/utils/deduplicateIPOs';
import { IPOWithDetails } from '../src/types/ipo';

describe('IPO Normaliser (normaliseFmpIpo)', () => {
  it('leaves missing fields as null/undefined, never converts to 0', () => {
    const raw = {
      symbol: 'TEST',
      company: 'Test Corp',
      date: '2026-05-10',
    };

    const normalised = normaliseFmpIpo(raw, 'fmp');
    expect(normalised.symbol).toBe('TEST');
    expect(normalised.company_name).toBe('Test Corp');
    expect(normalised.listing_date).toBe('2026-05-10');

    // Missing numeric values must be null, NOT 0
    expect(normalised.issue_price).toBeNull();
    expect(normalised.price_band_low).toBeNull();
    expect(normalised.price_band_high).toBeNull();
    expect(normalised.shares_offered).toBeNull();
    expect(normalised.deal_size).toBeNull();
    expect(normalised.market_cap).toBeNull();
  });

  it('correctly parses price range strings into low and high', () => {
    const parsedRange = parsePriceRange(null, '$14.00 - $16.00');
    expect(parsedRange.low).toBe(14);
    expect(parsedRange.high).toBe(16);
    expect(parsedRange.exact).toBeNull();

    const parsedSingle = parsePriceRange('22.50', null);
    expect(parsedSingle.exact).toBe(22.5);
    expect(parsedSingle.low).toBeNull();
    expect(parsedSingle.high).toBeNull();
  });

  it('infers country and currency for recognized global exchanges', () => {
    const nasdaq = normaliseFmpIpo({ symbol: 'AAPL', exchange: 'NASDAQ' });
    expect(nasdaq.country).toBe('United States');
    expect(nasdaq.currency).toBe('USD');

    const lse = normaliseFmpIpo({ symbol: 'SHEL', exchange: 'LSE' });
    expect(lse.country).toBe('United Kingdom');
    expect(lse.currency).toBe('GBP');

    const unknown = normaliseFmpIpo({ symbol: 'XYZ', exchange: 'SOME_UNKNOWN_EXCHANGE' });
    expect(unknown.country).toBeNull(); // Never fabricate
  });

  it('respects explicit provider status/action keywords', () => {
    const cancelled = normaliseFmpIpo({ symbol: 'CANC', actions: 'Postponed/Withdrawn' });
    expect(cancelled.status).toBe('cancelled');

    const priced = normaliseFmpIpo({ symbol: 'PRIC', status: 'Priced' });
    expect(priced.status).toBe('listed');
  });
});

describe('IPO Deduplication (deduplicateIPOs)', () => {
  it('deduplicates based on stable provider ID first', () => {
    const ipo1 = normaliseFmpIpo({
      id: 'fmp-unique-123',
      symbol: 'ABC',
      company: 'ABC Holdings',
      date: '2026-04-10',
    });

    const ipo2 = normaliseFmpIpo({
      id: 'fmp-unique-123',
      symbol: 'ABC',
      company: 'ABC Holdings Inc',
      date: '2026-04-10',
      price: 15, // extra detail
    });

    const deduplicated = deduplicateIPOs([ipo1, ipo2]);
    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0].id).toBe('fmp-unique-123');
    expect(deduplicated[0].issue_price).toBe(15);
  });

  it('falls back to composite key (ticker+name+exchange+country+date) when ID is transient', () => {
    const ipo1: IPOWithDetails = {
      ...normaliseFmpIpo({
        symbol: 'GLOB',
        company: 'Global Corp',
        exchange: 'NASDAQ',
        date: '2026-06-01',
      }),
      id: 'temp-1',
    };

    const ipo2: IPOWithDetails = {
      ...normaliseFmpIpo({
        symbol: 'GLOB',
        company: 'Global Corp',
        exchange: 'NASDAQ',
        date: '2026-06-01',
        shares: 5000000,
      }),
      id: 'temp-2',
    };

    const key1 = getIpoDeduplicationKey(ipo1);
    const key2 = getIpoDeduplicationKey(ipo2);
    expect(key1).toBe(key2);

    const deduplicated = deduplicateIPOs([ipo1, ipo2]);
    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0].shares_offered).toBe(5000000);
  });

  it('keeps distinct IPOs separate', () => {
    const ipoA = normaliseFmpIpo({ symbol: 'AAA', company: 'Company A', date: '2026-05-01' });
    const ipoB = normaliseFmpIpo({ symbol: 'BBB', company: 'Company B', date: '2026-05-02' });

    const deduplicated = deduplicateIPOs([ipoA, ipoB]);
    expect(deduplicated).toHaveLength(2);
  });

  it('prioritizes supabase-india over fmp for Indian IPOs and flags conflicts', () => {
    const supabaseIpo: IPOWithDetails = {
      ...normaliseFmpIpo({
        symbol: 'TATATECH',
        company: 'Tata Technologies Ltd',
        exchange: 'NSE',
        date: '2023-11-30',
        price: '500',
      }),
      source: 'supabase-india',
      id: 'supabase-tata-tech',
      issue_price: 500,
      listing_date: '2023-11-30',
      status: 'listed',
    };

    const fmpIpo: IPOWithDetails = {
      ...normaliseFmpIpo({
        symbol: 'TATATECH',
        company: 'Tata Tech',
        exchange: 'NSE',
        date: '2023-11-28', // conflicting date
        price: '495', // conflicting price
      }),
      source: 'fmp',
      id: 'fmp-tatatech',
      issue_price: 495,
      listing_date: '2023-11-28',
      status: 'upcoming', // conflicting status
    };

    const merged = deduplicateIPOs([fmpIpo, supabaseIpo]);
    expect(merged).toHaveLength(1);
    // Primary authoritative record is supabase-india
    expect(merged[0].source).toBe('supabase-india');
    expect(merged[0].issue_price).toBe(500);
    expect(merged[0].listing_date).toBe('2023-11-30');
    // Conflict is flagged
    expect(merged[0].has_conflict).toBe(true);
    expect(merged[0].conflict_details?.length).toBeGreaterThan(0);
  });
});
