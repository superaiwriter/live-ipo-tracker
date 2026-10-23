import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const isDemo =
    process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_DATA === 'true';

  if (!isDemo) return null;

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 text-amber-600 dark:text-amber-400 py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 text-center sticky top-0 z-50 backdrop-blur-md">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        DEMO DATA ACTIVE — Running in local development test mode with simulated records (ENABLE_DEMO_DATA=true).
        Production live metrics are not active.
      </span>
    </div>
  );
};
