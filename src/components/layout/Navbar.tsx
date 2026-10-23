'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Flame,
  Calendar,
  CheckCircle2,
  Building2,
  Layers,
  Bookmark,
  Menu,
  X,
  ChevronDown,
  Calculator,
  CalendarDays,
  Clock,
  Sparkles,
} from 'lucide-react';

import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface DropdownItem {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavDropdown {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DropdownItem[];
}

interface NavSingle {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

type NavEntry =
  | { type: 'link'; data: NavSingle }
  | { type: 'dropdown'; data: NavDropdown };

const NAV_ENTRIES: NavEntry[] = [
  {
    type: 'link',
    data: {
      href: '/live-ipo',
      label: 'Live Bidding',
      icon: Flame,
      badge: 'Live',
    },
  },
  {
    type: 'link',
    data: {
      href: '/upcoming-ipo',
      label: 'Upcoming',
      icon: Calendar,
    },
  },
  {
    type: 'dropdown',
    data: {
      id: 'markets',
      label: 'Markets',
      icon: Building2,
      items: [
        {
          href: '/mainboard-ipo',
          label: 'Mainboard Issues',
          description: 'Premier large-cap listings on NSE & BSE',
          icon: Building2,
        },
        {
          href: '/sme-ipo',
          label: 'SME Platform',
          description: 'NSE Emerge & BSE SME growth offerings',
          icon: Layers,
        },
        {
          href: '/listed-ipo',
          label: 'Recently Listed',
          description: 'Debut listing gains & market performance',
          icon: CheckCircle2,
        },
      ],
    },
  },
  {
    type: 'dropdown',
    data: {
      id: 'schedules',
      label: 'Schedules',
      icon: CalendarDays,
      items: [
        {
          href: '/ipo-calendar',
          label: 'IPO Calendar',
          description: 'Interactive monthly timeline & key dates',
          icon: Calendar,
        },
        {
          href: '/ipo-this-week',
          label: 'IPOs This Week',
          description: 'Current bidding windows & cut-off deadlines',
          icon: Clock,
          badge: 'Active',
        },
        {
          href: '/ipo-list/2026',
          label: 'IPO List 2026',
          description: 'Complete yearly primary market directory',
          icon: CalendarDays,
        },
      ],
    },
  },
  {
    type: 'dropdown',
    data: {
      id: 'tools',
      label: 'Tools',
      icon: Layers,
      items: [
        {
          href: '/compare',
          label: 'Compare IPOs',
          description: 'Side-by-side metric & subscription comparison',
          icon: Layers,
        },
        {
          href: '/calculators',
          label: 'Calculators',
          description: 'Lot size, application cost & gain estimator',
          icon: Calculator,
        },
      ],
    },
  },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Read watchlist from localStorage
    const updateCount = () => {
      try {
        const stored = localStorage.getItem('ipo_watchlist');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            setWatchlistCount(list.length);
          }
        } else {
          setWatchlistCount(0);
        }
      } catch {
        setWatchlistCount(0);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('watchlist_updated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('watchlist_updated', updateCount);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleDropdownEnter = (id: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(id);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isDropdownActive = (dropdown: NavDropdown) => {
    return dropdown.items.some((item) => pathname === item.href);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                LiveIPOTracker
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  IN
                </span>
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-1 hidden sm:block">
                Mainboard & SME Market Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Grouped Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_ENTRIES.map((entry) => {
              if (entry.type === 'link') {
                const link = entry.data;
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-inherit' : 'text-zinc-400'}`} />
                    {link.label}
                    {link.badge && (
                      <span className="relative flex h-2 w-2 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </Link>
                );
              }

              // Dropdown Group
              const dropdown = entry.data;
              const isOpen = activeDropdown === dropdown.id;
              const hasActiveChild = isDropdownActive(dropdown);
              const DropdownIcon = dropdown.icon;

              return (
                <div
                  key={dropdown.id}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(dropdown.id)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : dropdown.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      hasActiveChild || isOpen
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <DropdownIcon className={`w-3.5 h-3.5 ${hasActiveChild ? 'text-emerald-500' : 'text-zinc-400'}`} />
                    <span>{dropdown.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-zinc-700 dark:text-zinc-200' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Floating Card */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-2 shadow-xl shadow-zinc-900/5 dark:shadow-black/40 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="space-y-0.5">
                        {dropdown.items.map((item) => {
                          const isItemActive = pathname === item.href;
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors group ${
                                isItemActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors ${
                                  isItemActive
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                                }`}
                              >
                                <ItemIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-semibold leading-tight">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right utilities: Watchlist link & Dark mode toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/watchlist"
              title={`${watchlistCount} IPOs in your local browser watchlist`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">Watchlist</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                {watchlistCount}
              </span>
            </Link>

            <ThemeToggle />

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Categorized & Accordion Style) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Section: Direct Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 block mb-1">
              Live & Upcoming
            </span>
            <Link
              href="/live-ipo"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                pathname === '/live-ipo'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-emerald-500" />
                Live Bidding
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white">
                Live
              </span>
            </Link>
            <Link
              href="/upcoming-ipo"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                pathname === '/upcoming-ipo'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                Upcoming Issues
              </div>
            </Link>
          </div>

          {/* Section: Markets */}
          <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 block mb-1">
              Markets & Categories
            </span>
            <Link
              href="/mainboard-ipo"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/mainboard-ipo'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-zinc-400" />
              Mainboard Issues (NSE & BSE)
            </Link>
            <Link
              href="/sme-ipo"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/sme-ipo'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              SME Platform (NSE Emerge & BSE SME)
            </Link>
            <Link
              href="/listed-ipo"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/listed-ipo'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Recently Listed Performance
            </Link>
          </div>

          {/* Section: Schedules */}
          <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 block mb-1">
              Schedules & Timelines
            </span>
            <Link
              href="/ipo-calendar"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/ipo-calendar'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-zinc-400" />
              IPO Calendar
            </Link>
            <Link
              href="/ipo-this-week"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/ipo-this-week'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Clock className="w-4 h-4 text-zinc-400" />
              IPOs This Week
            </Link>
            <Link
              href="/ipo-list/2026"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/ipo-list/2026'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-zinc-400" />
              IPO List 2026
            </Link>
          </div>

          {/* Section: Tools */}
          <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 block mb-1">
              Analysis Tools
            </span>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/compare'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4 text-zinc-400" />
              Compare IPOs
            </Link>
            <Link
              href="/calculators"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/calculators'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Calculator className="w-4 h-4 text-zinc-400" />
              IPO Calculators
            </Link>
          </div>

          {/* Watchlist Quick Action */}
          <div className="pt-2">
            <Link
              href="/watchlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                Saved Watchlist
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                {watchlistCount}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
