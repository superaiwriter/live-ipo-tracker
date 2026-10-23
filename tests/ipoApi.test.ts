import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchFmpIposInternal } from '@/services/ipoApi';
import { inMemoryCache } from '@/services/cacheService';

describe('src/services/ipoApi', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    inMemoryCache.clear();
    process.env = { ...originalEnv, FMP_API_KEY: 'test-fmp-key-123' };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('1. missing key -> typed not_configured result', async () => {
    delete process.env.FMP_API_KEY;

    const result = await fetchFmpIposInternal('2024-01-01', '2024-01-30');

    expect(result.isComplete).toBe(false);
    expect(result.errorType).toBe('not_configured');
    expect(result.ipos).toHaveLength(0);
    expect(result.windows).toHaveLength(1);
    expect(result.windows[0].status).toBe('failed');
    expect(result.windows[0].code).toBe('not_configured');
    expect(result.errorMessage).toContain('FMP API key not configured');
  });

  it('2. 403 / 402 plan limit -> typed plan_restricted result, never "no IPOs"', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      statusText: 'Payment Required',
      text: async () => 'Restricted Endpoint: upgrade your plan',
    } as unknown as Response);

    const result = await fetchFmpIposInternal('2024-01-01', '2024-01-30');

    expect(result.isComplete).toBe(false);
    expect(result.errorType).toBe('plan_restricted');
    expect(result.windows[0].status).toBe('failed');
    expect(result.windows[0].code).toBe('plan_restricted');
    expect(result.errorMessage).toContain('subscription');
  });

  it('3. success -> parses array and returns normalised IPOs', async () => {
    const mockFmpData = [
      {
        company: 'Acme Global Corp',
        symbol: 'ACME',
        exchange: 'NASDAQ',
        date: '2024-01-15',
        price: '18.00',
        shares: 5000000,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockFmpData),
    } as unknown as Response);

    const result = await fetchFmpIposInternal('2024-01-01', '2024-01-30');

    expect(result.isComplete).toBe(true);
    expect(result.errorType).toBeUndefined();
    expect(result.ipos).toHaveLength(1);
    expect(result.ipos[0].company_name).toBe('Acme Global Corp');
    expect(result.ipos[0].symbol).toBe('ACME');
    expect(result.ipos[0].source).toBe('fmp');
    expect(result.ipos[0].exchange).toBe('NASDAQ');
    expect(result.ipos[0].country).toBe('United States');
    expect(result.windows[0].status).toBe('ok');
  });

  it('4. empty array -> returns 0 ipos with isComplete: true', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify([]),
    } as unknown as Response);

    const result = await fetchFmpIposInternal('2024-01-01', '2024-01-30');

    expect(result.isComplete).toBe(true);
    expect(result.ipos).toHaveLength(0);
    expect(result.windows[0].status).toBe('ok');
  });

  it('5. 429 then success -> retries and recovers', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: async () => 'Rate limit exceeded',
        } as unknown as Response;
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ company: 'Recovered Corp', symbol: 'RCV' }]),
      } as unknown as Response;
    });

    const result = await fetchFmpIposInternal('2024-01-01', '2024-01-30', {
      retryDelayMs: 10,
    });

    expect(callCount).toBe(2);
    expect(result.isComplete).toBe(true);
    expect(result.ipos).toHaveLength(1);
    expect(result.ipos[0].company_name).toBe('Recovered Corp');
  });

  it('6. timeout -> marks window failed with timeout message', async () => {
    global.fetch = vi.fn().mockImplementation(async () => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    });

    const result = await fetchFmpIposInternal('2024-01-01', '2024-01-30', {
      timeoutMs: 50,
      retryCount: 0,
    });

    expect(result.isComplete).toBe(false);
    expect(result.windows[0].status).toBe('failed');
    expect(result.windows[0].error).toContain('timed out');
  });

  it('7. one failed window out of multiple -> returns partial results', async () => {
    // 120 days -> 2 windows
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify([{ company: 'Window 1 Corp', symbol: 'W1' }]),
        } as unknown as Response;
      }
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      } as unknown as Response;
    });

    const result = await fetchFmpIposInternal('2024-01-01', '2024-04-30', {
      retryCount: 0,
      interWindowDelayMs: 0,
    });

    expect(result.windows).toHaveLength(2);
    expect(result.windows[0].status).toBe('ok');
    expect(result.windows[1].status).toBe('failed');
    expect(result.isComplete).toBe(false);
    expect(result.ipos).toHaveLength(1);
    expect(result.ipos[0].company_name).toBe('Window 1 Corp');
  });
});
