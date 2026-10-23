import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbJsonLd } from '@/lib/seo';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
}) => {
  const fullItems: BreadcrumbItem[] = [
    { name: 'Home', path: '/' },
    ...items,
  ];

  const jsonLd = generateBreadcrumbJsonLd(fullItems);

  return (
    <>
      {/* Schema.org BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visible Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumbs"
        className={`flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-4 overflow-x-auto whitespace-nowrap py-1 ${className}`}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.path}>
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-xs">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors truncate max-w-[150px]"
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};
