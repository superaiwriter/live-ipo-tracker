'use client';

import React, { useSyncExternalStore, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

const emptySubscribe = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('theme_changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('theme_changed', callback);
  };
}

function getThemeSnapshot(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

const getThemeServerSnapshot = () => false;

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const isMounted = useSyncExternalStore(emptySubscribe, getMountedClient, getMountedServer);
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  const toggleTheme = useCallback(() => {
    const nextDark = !document.documentElement.classList.contains('dark');
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('theme_changed'));
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-200 shadow-xs active:scale-95 cursor-pointer ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400 -rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
};
