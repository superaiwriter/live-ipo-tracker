import { MergedIpoProvider } from './merged-provider';

let activeProvider: MergedIpoProvider | null = null;

export function getIpoProvider(): MergedIpoProvider {
  if (!activeProvider) {
    activeProvider = new MergedIpoProvider();
  }
  return activeProvider;
}

export * from './types';
export * from './supabase-provider';
export * from './fmp-provider';
export * from './finnhub-provider';
export * from './merged-provider';
