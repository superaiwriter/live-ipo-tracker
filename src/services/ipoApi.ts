import { cache } from 'react';
import { IPOWithDetails } from '@/types/ipo';
import { splitDateRangeIntoWindows } from '@/utils/dateUtils';
import { normaliseFmpIpo } from '@/utils/ipoNormaliser';
import { inMemoryCache } from './cacheService';

export interface FetchIpoWindowResult {
  from: string;
  to: string;
  status: 'ok' | 'failed' | 'cached';
  error?: string;
  code?: 'not_configured' | 'plan_restricted' | 'rate_limited' | 'error';
}

export interface FmpFetchResult {
  ipos: IPOWithDetails[];
  windows: FetchIpoWindowResult[];
  fetchedAt: string;
  isComplete: boolean;
  errorType?: 'not_configured' | 'plan_restricted' | 'rate_limited' | 'network_error';
  errorMessage?: string;
}

export interface FmpFetchOptions {
  bypassCache?: boolean;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  interWindowDelayMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY_MS = 300;
const DEFAULT_INTER_WINDOW_DELAY_MS = 150;
const DEFAULT_REVALIDATE_SECONDS = Number(process.env.FMP_REVALIDATE_SECONDS || 21600); // 6 hours

/**
 * Fetch a single window from FMP with timeout and retry on 429/5xx.
 * Server-side only: never logs or leaks the API key.
 */
async function fetchSingleWindow(
  from: string,
  to: string,
  apiKey: string,
  options: FmpFetchOptions
): Promise<{ ok: boolean; data?: unknown[]; error?: string; code?: FetchIpoWindowResult['code'] }> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.retryCount ?? DEFAULT_RETRY_COUNT;
  const baseDelay = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  const url = `https://financialmodelingprep.com/stable/ipos-calendar?from=${from}&to=${to}&apikey=${apiKey}`;

  let attempt = 0;
  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchOptions: RequestInit = {
        signal: controller.signal,
      };

      if (!options.bypassCache) {
        // Next.js ISR revalidation
        (fetchOptions as Record<string, unknown>).next = { revalidate: DEFAULT_REVALIDATE_SECONDS };
      } else {
        fetchOptions.cache = 'no-store';
      }

      const res = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Handle 401, 402, 403 plan restriction immediately (no retry needed)
      if (res.status === 401 || res.status === 402 || res.status === 403) {
        await res.text().catch(() => '');
        return {
          ok: false,
          code: 'plan_restricted',
          error: `FMP Plan Limitation (HTTP ${res.status}): This endpoint is restricted under your current subscription tier. An upgraded plan is required.`,
        };
      }

      // Handle 429 quota exhaustion or temporary server errors with backoff
      if (res.status === 429) {
        const text = await res.text().catch(() => '');
        if (text.toLowerCase().includes('limit reach') || text.toLowerCase().includes('upgrade your plan')) {
          return {
            ok: false,
            code: 'plan_restricted',
            error: 'FMP Daily Quota Reached: Your FMP key has reached its request limit ("Limit Reach"). Upgrade your plan at financialmodelingprep.com or wait for the daily quota reset.',
          };
        }

        if (attempt < maxRetries) {
          attempt++;
          const waitTime = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }
        return {
          ok: false,
          code: 'rate_limited',
          error: `FMP request failed with HTTP 429 after ${maxRetries + 1} attempts`,
        };
      }

      if (res.status >= 500 && res.status < 600) {
        if (attempt < maxRetries) {
          attempt++;
          const waitTime = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }
        return {
          ok: false,
          code: 'error',
          error: `FMP request failed with HTTP ${res.status} after ${maxRetries + 1} attempts`,
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          code: 'error',
          error: `FMP request failed with HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const text = await res.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Sometimes FMP sends plain text "Restricted Endpoint" even with 200 OK
        if (text.toLowerCase().includes('restricted') || text.toLowerCase().includes('upgrade your plan')) {
          return {
            ok: false,
            code: 'plan_restricted',
            error: 'FMP Plan Limitation: Response indicated restricted endpoint.',
          };
        }
        return {
          ok: false,
          code: 'error',
          error: 'Failed to parse JSON response from FMP',
        };
      }

      if (Array.isArray(parsed)) {
        return { ok: true, data: parsed };
      }

      // Check if error message object was returned
      if (typeof parsed === 'object' && parsed !== null) {
        const obj = parsed as Record<string, unknown>;
        if (obj['Error Message'] || obj['message']) {
          const msg = String(obj['Error Message'] || obj['message']);
          return {
            ok: false,
            code: msg.toLowerCase().includes('legacy') || msg.toLowerCase().includes('subscription')
              ? 'plan_restricted'
              : 'error',
            error: msg,
          };
        }
      }

      return { ok: true, data: [] };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = (err as Error)?.name === 'AbortError';

      if (attempt < maxRetries && !isAbort) {
        attempt++;
        const waitTime = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      return {
        ok: false,
        code: isAbort ? 'error' : 'error',
        error: isAbort
          ? `Request timed out after ${timeoutMs}ms`
          : (err as Error)?.message || 'Network fetch error',
      };
    }
  }

  return { ok: false, code: 'error', error: 'Max retries exceeded' };
}

/**
 * Core FMP fetch orchestrator:
 * - Splits range into max 90-day windows
 * - Fetches windows sequentially to avoid rate-limiting
 * - Returns structured status and error reporting
 */
async function fetchFmpIposInternal(
  startDate: string,
  endDate: string,
  options: FmpFetchOptions = {}
): Promise<FmpFetchResult> {
  const apiKey = process.env.FMP_API_KEY?.trim();
  const windowsConfig = splitDateRangeIntoWindows(startDate, endDate, 90);
  const nowIso = new Date().toISOString();

  // If no API key configured, return typed not_configured result
  if (!apiKey) {
    return {
      ipos: [],
      windows: windowsConfig.map((w) => ({
        from: w.from,
        to: w.to,
        status: 'failed',
        code: 'not_configured',
        error: 'FMP API key is not configured. Set FMP_API_KEY in .env.local to enable global IPO data.',
      })),
      fetchedAt: nowIso,
      isComplete: false,
      errorType: 'not_configured',
      errorMessage: 'FMP API key not configured. Global IPO data unavailable until configured.',
    };
  }

  const allIpos: IPOWithDetails[] = [];
  const windowResults: FetchIpoWindowResult[] = [];
  let isComplete = true;
  let overallErrorType: FmpFetchResult['errorType'] = undefined;
  let overallErrorMessage: string | undefined = undefined;

  for (let i = 0; i < windowsConfig.length; i++) {
    const w = windowsConfig[i];
    const cacheKey = `fmp_window_${w.from}_${w.to}`;

    // Check optional in-memory cache if not bypassing
    if (!options.bypassCache) {
      const cachedData = inMemoryCache.get<IPOWithDetails[]>(cacheKey);
      if (cachedData) {
        windowResults.push({
          from: w.from,
          to: w.to,
          status: 'cached',
        });
        allIpos.push(...cachedData);
        continue;
      }
    }

    // Add inter-window sequential delay
    if (i > 0 && (options.interWindowDelayMs ?? DEFAULT_INTER_WINDOW_DELAY_MS) > 0) {
      await new Promise((r) => setTimeout(r, options.interWindowDelayMs ?? DEFAULT_INTER_WINDOW_DELAY_MS));
    }

    const res = await fetchSingleWindow(w.from, w.to, apiKey, options);

    if (res.ok && res.data) {
      const normalisedList = (res.data as Record<string, unknown>[]).map((raw) =>
        normaliseFmpIpo(raw, 'fmp')
      );

      // Save to in-memory cache
      inMemoryCache.set(cacheKey, normalisedList, DEFAULT_REVALIDATE_SECONDS);

      windowResults.push({
        from: w.from,
        to: w.to,
        status: 'ok',
      });
      allIpos.push(...normalisedList);
    } else {
      isComplete = false;
      const errorCode = res.code || 'error';
      windowResults.push({
        from: w.from,
        to: w.to,
        status: 'failed',
        code: errorCode,
        error: res.error || 'Failed to fetch window',
      });

      if (!overallErrorType) {
        if (errorCode === 'plan_restricted') {
          overallErrorType = 'plan_restricted';
          overallErrorMessage = res.error || 'FMP subscription plan restricts global IPO calendar access.';
        } else if (errorCode === 'rate_limited') {
          overallErrorType = 'rate_limited';
          overallErrorMessage = res.error || 'FMP API rate limit reached. Please try again later.';
        } else {
          overallErrorType = 'network_error';
          overallErrorMessage = res.error || 'Network error fetching FMP IPO calendar.';
        }
      }
    }
  }

  return {
    ipos: allIpos,
    windows: windowResults,
    fetchedAt: nowIso,
    isComplete,
    errorType: overallErrorType,
    errorMessage: overallErrorMessage,
  };
}

/**
 * Public export wrapped in React cache() for per-render deduplication.
 */
export const fetchFmpIpos = cache(fetchFmpIposInternal);

/**
 * Direct unmemoized function export for testing or background jobs.
 */
export { fetchFmpIposInternal };
