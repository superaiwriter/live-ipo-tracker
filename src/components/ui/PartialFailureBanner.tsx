'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock, ShieldAlert } from 'lucide-react';
import { FetchIpoWindowResult } from '@/services/ipoApi';

export interface PartialFailureBannerProps {
  selectedRange?: { from: string; to: string };
  lastSuccessfulUpdate?: string;
  windows?: FetchIpoWindowResult[];
  isComplete?: boolean;
  errorMessage?: string;
}

export function PartialFailureBanner({
  selectedRange,
  lastSuccessfulUpdate,
  windows = [],
  isComplete = true,
  errorMessage,
}: PartialFailureBannerProps) {
  const [retrying, setRetrying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const failedWindows = windows.filter((w) => w.status === 'failed');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (isComplete && failedWindows.length === 0) {
    return null;
  }

  const handleRetry = async () => {
    if (cooldown > 0 || retrying) return;

    if (failedWindows.length === 0) {
      setStatusMessage('No failed windows to retry.');
      return;
    }

    setRetrying(true);
    setStatusMessage(null);

    try {
      // Retry each failed window
      let anyFailed = false;
      for (const w of failedWindows) {
        const res = await fetch('/api/fmp/retry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: w.from, to: w.to }),
        });

        if (res.status === 429) {
          const data = await res.json();
          setCooldown(data.remainingSeconds || 60);
          setStatusMessage(data.error || 'Retry rate limited to protect quota.');
          setRetrying(false);
          return;
        }

        const data = await res.json();
        if (!res.ok || !data.success) {
          anyFailed = true;
          setStatusMessage(data.error || 'Retry attempt encountered an error.');
        }
      }

      // Enforce 60s cooldown to protect quota
      setCooldown(60);

      if (!anyFailed) {
        setStatusMessage('Retry succeeded. Refreshing page...');
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) {
      setStatusMessage((err as Error).message || 'Failed to connect to retry endpoint.');
      setCooldown(30);
    } finally {
      setRetrying(false);
    }
  };

  const formattedUpdate = lastSuccessfulUpdate
    ? new Date(lastSuccessfulUpdate).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Unknown';

  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-sm text-zinc-900 dark:text-zinc-100 mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 mt-0.5 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
              Data May Be Incomplete
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {errorMessage ||
                'One or more date windows could not be refreshed from the external provider. Showing all available records.'}
            </p>

            {/* Metadata pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              {selectedRange && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Range: {selectedRange.from} to {selectedRange.to}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                Last checked: {formattedUpdate}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button with Quota Protection */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={handleRetry}
            disabled={retrying || cooldown > 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-white disabled:text-zinc-400 transition-colors shadow-sm disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying
              ? 'Retrying...'
              : cooldown > 0
              ? `Retry available in ${cooldown}s`
              : 'Retry Failed Windows'}
          </button>
        </div>
      </div>

      {/* Failed Windows Breakdown */}
      {failedWindows.length > 0 && (
        <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Failed Window Details ({failedWindows.length}):
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {failedWindows.map((fw, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs"
              >
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-zinc-300">
                    {fw.from} → {fw.to}
                  </span>
                  <p className="text-zinc-400 mt-0.5">{fw.error || 'Provider request failed'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
