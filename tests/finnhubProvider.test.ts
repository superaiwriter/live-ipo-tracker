import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normaliseFinnhubRecord,
  parseFinnhubPrice,
  FinnhubIpoProvider,
} from '../src/lib/providers/finnhub-provider';

describe('Finnhub Price Parsing (Defensive & Safe)', () => {
  it('parses clean price range without converting to 0', () => {
    const res = parseFinnhubPrice('$14.00 - $16.00');
    expect(res.low).toBe(14);
    expect(res.high).toBe(16);
    expect(res.exact).toBeNull();
    expect(res.raw).toBe('$14.00 - $16.00');
  });

  it('parses single clean price', () => {
    const res = parseFinnhubPrice('$15.50');
    expect(res.low).toBeNull();
    expect(res.high).toBeNull();
    expect(res.exact).toBe(15.5);
    expect(res.raw).toBe('$15.50');
  });

  it('handles null, undefined, and empty string safely', () => {
    expect(parseFinnhubPrice(null)).toEqual({ low: null, high: null, exact: null, raw: null });
    expect(parseFinnhubPrice(undefined)).toEqual({ low: null, high: null, exact: null, raw: null });
    expect(parseFinnhubPrice('')).toEqual({ low: null, high: null, exact: null, raw: null });
  });

  it('keeps malformed price unparsed without guessing or returning 0', () => {
    const res = parseFinnhubPrice('TBD / Not Declared');
    expect(res.low).toBeNull();
    expect(res.high).toBeNull();
    expect(res.exact).toBeNull();
    expect(res.raw).toBe('TBD / Not Declared');
  });
});

describe('Finnhub Record Normalisation', () => {
  it('normalises observed real shape with null fields safely (no 0 substitutions)', () => {
    const raw = {
      date: '2026-10-19',
      exchange: null,
      name: 'Kepuni Holdings Inc.',
      numberOfShares: null,
      price: null,
      status: 'withdrawn',
      symbol: null,
      totalSharesValue: null,
    };

    const norm = normaliseFinnhubRecord(raw);

    expect(norm.company_name).toBe('Kepuni Holdings Inc.');
    expect(norm.symbol).toBeNull();
    expect(norm.exchange).toBe('UNKNOWN');
    expect(norm.country).toBeNull(); // Exchange is null, so country remains undeclared
    expect(norm.currency).toBeNull();
    expect(norm.status).toBe('cancelled'); // withdrawn -> cancelled
    expect(norm.providerStatus).toBe('withdrawn');
    expect(norm.shares_offered).toBeNull();
    expect(norm.deal_size).toBeNull();
    expect(norm.price_band_low).toBeNull();
    expect(norm.price_band_high).toBeNull();
    expect(norm.issue_price).toBeNull();
    expect(norm.source).toBe('finnhub');
    expect(norm.is_demo).toBe(false);
    expect(norm.id).toBeDefined();
    expect(norm.id.startsWith('finnhub-')).toBe(true);
  });

  it('maps all four verified statuses accurately', () => {
    // 1. withdrawn -> cancelled
    expect(normaliseFinnhubRecord({ status: 'withdrawn' }).status).toBe('cancelled');
    // 2. expected -> upcoming
    expect(normaliseFinnhubRecord({ status: 'expected' }).status).toBe('upcoming');
    // 3. filed -> filed (NOT upcoming, NOT open)
    expect(normaliseFinnhubRecord({ status: 'filed' }).status).toBe('filed');
    // 4. priced -> priced (NOT listed)
    expect(normaliseFinnhubRecord({ status: 'priced' }).status).toBe('priced');
    // Unknown fallback
    expect(normaliseFinnhubRecord({ status: 'unknown_str' }).status).toBe('unknown');
    expect(normaliseFinnhubRecord({ status: null }).status).toBe('unknown');
  });

  it('derives United States and USD only for NASDAQ and NYSE exchanges', () => {
    const nasdaq = normaliseFinnhubRecord({
      exchange: 'NASDAQ Global',
      name: 'Tech Corp',
    });
    expect(nasdaq.country).toBe('United States');
    expect(nasdaq.currency).toBe('USD');
    expect(nasdaq.derived_fields).toEqual(['country', 'currency']);

    const nyse = normaliseFinnhubRecord({
      exchange: 'NYSE MKT',
      name: 'Energy Corp',
    });
    expect(nyse.country).toBe('United States');
    expect(nyse.currency).toBe('USD');
    expect(nyse.derived_fields).toEqual(['country', 'currency']);

    const other = normaliseFinnhubRecord({
      exchange: 'LSE',
      name: 'London Corp',
    });
    expect(other.country).toBeNull();
    expect(other.currency).toBeNull();
    expect(other.derived_fields).toBeUndefined();
  });

  it('produces deterministic IDs even with missing symbols', () => {
    const recordA = {
      date: '2026-10-15',
      exchange: 'NASDAQ Global',
      name: 'Alpha Bio Ltd',
      symbol: null,
    };
    const normA1 = normaliseFinnhubRecord(recordA);
    const normA2 = normaliseFinnhubRecord(recordA);
    expect(normA1.id).toBe(normA2.id);
    expect(normA1.id).toContain('alphabioltd');
  });
});

describe('FinnhubIpoProvider Integration & Error Handling', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, FINNHUB_API_KEY: 'test_finnhub_key' };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('handles empty response array gracefully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ ipoCalendar: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new FinnhubIpoProvider();
    const result = await provider.getIpos({
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
    });

    expect(result).toEqual([]);
    expect(provider.getLastFetchResult()?.isComplete).toBe(true);
    expect(provider.getLastFetchResult()?.totalRecords).toBe(0);
  });

  it('handles HTTP 429 without entering a retry loop', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 429,
      ok: false,
      text: async () => 'Rate limit exceeded',
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new FinnhubIpoProvider();
    const result = await provider.getIpos({
      dateFrom: '2026-07-01',
      dateTo: '2026-10-01',
    });

    // Exactly 1 call was attempted for the first window; stopped immediately upon 429
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    const fetchRes = provider.getLastFetchResult();
    expect(fetchRes?.isComplete).toBe(false);
    expect(fetchRes?.httpStatus).toBe(429);
  });

  it('sends API key strictly via X-Finnhub-Token header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        ipoCalendar: [
          {
            date: '2026-10-18',
            exchange: 'NASDAQ Capital',
            name: 'CloudScale Inc',
            numberOfShares: 5000000,
            price: '$12.00 - $14.00',
            status: 'priced',
            symbol: 'CLDS',
            totalSharesValue: 65000000,
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new FinnhubIpoProvider();
    const result = await provider.getIpos({
      dateFrom: '2026-10-01',
      dateTo: '2026-10-20',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [callUrl, callInit] = fetchMock.mock.calls[0];

    // Ensure API key is NOT in the URL
    expect(callUrl).not.toContain('test_finnhub_key');
    // Ensure header contains key
    expect(callInit.headers['X-Finnhub-Token']).toBe('test_finnhub_key');

    expect(result.length).toBe(1);
    expect(result[0].company_name).toBe('CloudScale Inc');
    expect(result[0].symbol).toBe('CLDS');
    expect(result[0].status).toBe('priced');
    expect(result[0].price_band_low).toBe(12);
    expect(result[0].price_band_high).toBe(14);
    expect(result[0].shares_offered).toBe(5000000);
  });
});
