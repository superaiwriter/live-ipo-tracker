'use client';

import { useSyncExternalStore, useCallback } from 'react';

export const WATCHLIST_STORAGE_KEY = 'ipo_watchlist';

// Module-level immutable empty constant - guarantees getServerSnapshot stability
export const EMPTY_WATCHLIST: readonly string[] = Object.freeze([]);

let cachedRaw: string | null = null;
let cachedParsed: readonly string[] = EMPTY_WATCHLIST;

export function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('watchlist_updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('watchlist_updated', callback);
  };
}

export function getSnapshot(): readonly string[] {
  if (typeof window === 'undefined') return EMPTY_WATCHLIST;
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    // If raw string has not changed, return previously cached reference
    if (raw === cachedRaw) {
      return cachedParsed;
    }

    cachedRaw = raw;
    if (!raw) {
      cachedParsed = EMPTY_WATCHLIST;
      return cachedParsed;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedParsed = EMPTY_WATCHLIST;
      return cachedParsed;
    }

    const validList = parsed.filter(
      (item): item is string => typeof item === 'string' && Boolean(item.trim())
    );

    cachedParsed = validList.length > 0 ? Object.freeze(validList) : EMPTY_WATCHLIST;
    return cachedParsed;
  } catch {
    cachedRaw = null;
    cachedParsed = EMPTY_WATCHLIST;
    return cachedParsed;
  }
}

export function getServerSnapshot(): readonly string[] {
  return EMPTY_WATCHLIST;
}

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('watchlist_updated'));
  }
}

function setWatchlist(list: string[]) {
  if (typeof window === 'undefined') return;
  const filtered = list.filter((id) => typeof id === 'string' && Boolean(id.trim()));
  try {
    if (filtered.length === 0) {
      localStorage.removeItem(WATCHLIST_STORAGE_KEY);
      cachedRaw = null;
      cachedParsed = EMPTY_WATCHLIST;
    } else {
      const raw = JSON.stringify(filtered);
      localStorage.setItem(WATCHLIST_STORAGE_KEY, raw);
      cachedRaw = raw;
      cachedParsed = Object.freeze([...filtered]);
    }
  } catch (err) {
    console.error('Failed to update watchlist storage:', err);
  }
  notifySubscribers();
}

export function useWatchlist() {
  const watchlist = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isSaved = useCallback(
    (ipoId: string) => watchlist.includes(ipoId),
    [watchlist]
  );

  const toggle = useCallback((ipoId: string) => {
    if (typeof window === 'undefined' || !ipoId) return;
    const current = Array.from(getSnapshot());
    const next = current.includes(ipoId)
      ? current.filter((id) => id !== ipoId)
      : [...current, ipoId];
    setWatchlist(next);
  }, []);

  const remove = useCallback((ipoId: string) => {
    if (typeof window === 'undefined' || !ipoId) return;
    const current = Array.from(getSnapshot());
    const next = current.filter((id) => id !== ipoId);
    setWatchlist(next);
  }, []);

  const clear = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    } catch {
      // ignore
    }
    cachedRaw = null;
    cachedParsed = EMPTY_WATCHLIST;
    notifySubscribers();
  }, []);

  return {
    watchlist,
    isSaved,
    toggle,
    remove,
    clear,
  };
}
