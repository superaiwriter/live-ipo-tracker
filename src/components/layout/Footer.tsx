import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      {/* MANDATORY LEGAL SEBI DISCLAIMER BANNER (Rule 9) */}
      <div className="bg-zinc-900 border-b border-zinc-800/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm font-medium text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300">Mandatory Regulatory Notice:</strong> Not SEBI
            registered. Information is for educational purposes only and is not investment advice.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        {/* Balanced 5-Column Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-10">
          {/* Col 1 & 2: About Platform */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                LiveIPOTracker
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                India Market Engine
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Real-time, disciplined tracking of Mainboard and SME initial public offerings on the
              National Stock Exchange (NSE) and Bombay Stock Exchange (BSE). Designed with strict data
              integrity standards.
            </p>
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-start gap-2.5 max-w-sm text-[11px] text-zinc-400 leading-relaxed">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Grey Market Premium (GMP) is strictly unofficial survey data and never a listing forecast.
              </span>
            </div>
          </div>

          {/* Col 3: Market Discovery */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3.5">
              Market Discovery
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/live-ipo" className="hover:text-emerald-400 transition-colors">
                  Live / Bidding Open
                </Link>
              </li>
              <li>
                <Link href="/upcoming-ipo" className="hover:text-emerald-400 transition-colors">
                  Upcoming Pipeline
                </Link>
              </li>
              <li>
                <Link href="/ipo-calendar" className="hover:text-emerald-400 transition-colors">
                  IPO Calendar
                </Link>
              </li>
              <li>
                <Link href="/ipo-this-week" className="hover:text-emerald-400 transition-colors">
                  IPOs This Week
                </Link>
              </li>
              <li>
                <Link href="/ipo-list/2026" className="hover:text-emerald-400 transition-colors">
                  IPO List 2026
                </Link>
              </li>
              <li>
                <Link href="/mainboard-ipo" className="hover:text-emerald-400 transition-colors">
                  Mainboard Issues
                </Link>
              </li>
              <li>
                <Link href="/sme-ipo" className="hover:text-emerald-400 transition-colors">
                  SME Platform Issues
                </Link>
              </li>
              <li>
                <Link href="/listed-ipo" className="hover:text-emerald-400 transition-colors">
                  Recently Listed
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Education & Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3.5">
              Education & Tools
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/ipo-guide" className="hover:text-emerald-400 transition-colors">
                  Beginner&apos;s IPO Guide
                </Link>
              </li>
              <li>
                <Link href="/ipo-glossary" className="hover:text-emerald-400 transition-colors">
                  A–Z IPO Glossary
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-emerald-400 transition-colors">
                  Compare IPOs
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-emerald-400 transition-colors">
                  IPO Calculators
                </Link>
              </li>
              <li>
                <Link href="/how-we-calculate" className="hover:text-emerald-400 transition-colors">
                  How We Calculate
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Governance & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3.5">
              Governance & Legal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-emerald-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-emerald-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">
                  Regulatory Risk Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="hover:text-emerald-400 transition-colors">
                  Editorial Sourcing Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About LiveIPOTracker
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact & Errata Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Clean, Balanced Bottom Copyright Bar */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="order-1 md:order-1">© 2026 LiveIPOTracker. All rights reserved.</p>

          <div className="order-3 md:order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
            <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/cookie-policy" className="hover:text-emerald-400 transition-colors">
              Cookie Policy
            </Link>
            <span>•</span>
            <Link href="/terms-and-conditions" className="hover:text-emerald-400 transition-colors">
              Terms & Condition
            </Link>
            <span>•</span>
            <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">
              Disclaimer
            </Link>
          </div>

          <p className="order-2 md:order-3 text-center md:text-right text-[11px] text-zinc-500">
            Operates in Indian Standard Time (IST, UTC+05:30).
          </p>
        </div>
      </div>
    </footer>
  );
};
