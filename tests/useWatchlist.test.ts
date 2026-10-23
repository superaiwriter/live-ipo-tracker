import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import {
  getSnapshot,
  getServerSnapshot,
  EMPTY_WATCHLIST,
  WATCHLIST_STORAGE_KEY,
} from '../src/hooks/useWatchlist';

class MockStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('useWatchlist Snapshot Caching (React useSyncExternalStore Rules)', () => {
  const mockStorage = new MockStorage();

  beforeAll(() => {
    vi.stubGlobal('localStorage', mockStorage);
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mockStorage.clear();
    // Force reset cache by clearing storage and taking snapshot
    getSnapshot();
  });

  it('getServerSnapshot returns identical reference (===) across multiple calls', () => {
    const snap1 = getServerSnapshot();
    const snap2 = getServerSnapshot();
    const snap3 = getServerSnapshot();

    expect(snap1).toBe(snap2);
    expect(snap2).toBe(snap3);
    expect(snap1).toBe(EMPTY_WATCHLIST);
  });

  it('getSnapshot returns identical reference (===) when storage is empty', () => {
    const snap1 = getSnapshot();
    const snap2 = getSnapshot();

    expect(snap1).toBe(snap2);
    expect(snap1).toBe(EMPTY_WATCHLIST);
  });

  it('getSnapshot returns identical reference (===) when storage has unchanged data', () => {
    mockStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      JSON.stringify(['finnhub-tech-ipo', 'finnhub-bio-ipo'])
    );

    const snap1 = getSnapshot();
    const snap2 = getSnapshot();

    expect(snap1).toBe(snap2); // Strictly identical reference!
    expect(snap1).toEqual(['finnhub-tech-ipo', 'finnhub-bio-ipo']);
  });

  it('getSnapshot returns identical reference (===) and falls back to EMPTY_WATCHLIST when JSON is corrupted', () => {
    mockStorage.setItem(WATCHLIST_STORAGE_KEY, '{ invalid json');

    const snap1 = getSnapshot();
    const snap2 = getSnapshot();

    expect(snap1).toBe(snap2);
    expect(snap1).toBe(EMPTY_WATCHLIST);
  });

  it('getSnapshot updates reference when storage string changes, and caches the new reference', () => {
    mockStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(['ipo-1']));
    const snapA1 = getSnapshot();
    const snapA2 = getSnapshot();
    expect(snapA1).toBe(snapA2);
    expect(snapA1).toEqual(['ipo-1']);

    // Change storage string
    mockStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(['ipo-1', 'ipo-2']));
    const snapB1 = getSnapshot();
    const snapB2 = getSnapshot();

    expect(snapB1).not.toBe(snapA1); // New reference created on string change
    expect(snapB1).toBe(snapB2);     // Subsequent calls return the same new reference
    expect(snapB1).toEqual(['ipo-1', 'ipo-2']);
  });

  it('clearing storage resets snapshot back to EMPTY_WATCHLIST with identical reference', () => {
    mockStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(['ipo-1']));
    getSnapshot();

    mockStorage.removeItem(WATCHLIST_STORAGE_KEY);
    const snap1 = getSnapshot();
    const snap2 = getSnapshot();

    expect(snap1).toBe(snap2);
    expect(snap1).toBe(EMPTY_WATCHLIST);
  });
});
