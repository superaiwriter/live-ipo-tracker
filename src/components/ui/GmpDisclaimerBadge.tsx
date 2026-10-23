import React from 'react';
import { Info } from 'lucide-react';

interface GmpDisclaimerBadgeProps {
  className?: string;
  short?: boolean;
}

export const GmpDisclaimerBadge: React.FC<GmpDisclaimerBadgeProps> = ({
  className = '',
  short = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 px-2 py-0.5 rounded ${className}`}
      title="Grey Market Premium (GMP) is unofficial, unregulated, and must never be considered an investment forecast."
    >
      <Info className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
      {short ? 'Unofficial' : 'Unofficial, not a forecast'}
    </span>
  );
};
