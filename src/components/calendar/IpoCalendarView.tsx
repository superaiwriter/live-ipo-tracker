'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { IPOWithDetails } from '@/types/ipo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { formatISTDate } from '@/lib/dates';
import {
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';

interface IpoCalendarViewProps {
  ipos: IPOWithDetails[];
}

interface CalendarEvent {
  ipo: IPOWithDetails;
  type: 'open' | 'close' | 'allotment' | 'listing';
  dateStr: string; // YYYY-MM-DD
  label: string;
  badgeClass: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const IpoCalendarView: React.FC<IpoCalendarViewProps> = ({ ipos }) => {
  // Current viewed month & year (defaults to current date in IST or first IPO date)
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date();
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0 - 11

  // Month navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter IPOs by segment & status
  const filteredIpos = useMemo(() => {
    return ipos.filter((ipo) => {
      if (selectedSegment !== 'all' && ipo.segment !== selectedSegment) return false;
      if (selectedStatus !== 'all' && ipo.status !== selectedStatus) return false;
      return true;
    });
  }, [ipos, selectedSegment, selectedStatus]);

  // Extract events mapped to YYYY-MM-DD in IST
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    const addEvent = (
      ipo: IPOWithDetails,
      dateInput: string | null | undefined,
      type: 'open' | 'close' | 'allotment' | 'listing',
      label: string,
      badgeClass: string
    ) => {
      if (!dateInput) return;
      // Extract YYYY-MM-DD
      const dateStr = dateInput.substring(0, 10);
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push({ ipo, type, dateStr, label, badgeClass });
    };

    filteredIpos.forEach((ipo) => {
      addEvent(ipo, ipo.open_date, 'open', 'Opens', 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30');
      addEvent(ipo, ipo.close_date, 'close', 'Closes', 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30');
      addEvent(ipo, ipo.allotment_date, 'allotment', 'Allotment', 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30');
      addEvent(ipo, ipo.listing_date, 'listing', 'Listing', 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30');
    });

    return map;
  }, [filteredIpos]);

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const monthStr = String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0');
      const yearStr = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateKey = `${yearStr}-${monthStr}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        dateKey,
        isCurrentMonth: false,
        events: eventsByDate.get(dateKey) || [],
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${String(day).padStart(2, '0')}`;
      days.push({
        dayNum: day,
        dateKey,
        isCurrentMonth: true,
        events: eventsByDate.get(dateKey) || [],
      });
    }

    // Trailing days to fill 35 or 42 grid cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const monthStr = String(currentMonth === 11 ? 1 : currentMonth + 2).padStart(2, '0');
      const yearStr = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateKey = `${yearStr}-${monthStr}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNum: i,
        dateKey,
        isCurrentMonth: false,
        events: eventsByDate.get(dateKey) || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, eventsByDate]);

  // List view events for current month
  const monthListEvents = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const list: CalendarEvent[] = [];

    eventsByDate.forEach((events, dateKey) => {
      if (dateKey.startsWith(prefix)) {
        list.push(...events);
      }
    });

    return list.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [eventsByDate, currentYear, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Top Header: Month controls and View toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>

          <button
            onClick={resetToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750"
          >
            Today
          </button>
        </div>

        {/* Filters and View Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segment Filter */}
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
          >
            <option value="all">All Segments</option>
            <option value="mainboard">Mainboard</option>
            <option value="sme">SME Platforms</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="open">Live / Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
            <option value="listed">Listed</option>
          </select>

          {/* Grid vs List View Toggle */}
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-850">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Chronological List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EVENT LEGEND */}
      <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap px-1">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Legend:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Issue Opens
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Issue Closes (17:00 IST)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Allotment Out
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Exchange Listing
        </span>
      </div>

      {/* VIEW 1: MONTH GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-zinc-200 dark:divide-zinc-800">
            {calendarDays.map((cell, idx) => (
              <div
                key={idx}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth
                    ? 'bg-white dark:bg-zinc-900/60'
                    : 'bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      cell.isCurrentMonth
                        ? 'text-zinc-800 dark:text-zinc-200'
                        : 'text-zinc-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>
                  {cell.events.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                      {cell.events.length}
                    </span>
                  )}
                </div>

                {/* Day's Events */}
                <div className="space-y-1 my-1 overflow-y-auto max-h-[100px]">
                  {cell.events.map((evt, eIdx) => (
                    <Link
                      key={eIdx}
                      href={`/ipo/${evt.ipo.slug}`}
                      className={`block px-1.5 py-0.5 rounded text-[10px] font-medium border truncate transition-opacity hover:opacity-85 ${evt.badgeClass}`}
                      title={`${evt.ipo.company_name} - ${evt.label}`}
                    >
                      <strong>{evt.label}:</strong> {evt.ipo.symbol || evt.ipo.company_name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: CHRONOLOGICAL LIST VIEW */}
      {viewMode === 'list' && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
          {monthListEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No scheduled events recorded for {MONTH_NAMES[currentMonth]} {currentYear}.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-3">
              {monthListEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-24 font-mono font-semibold text-zinc-500">
                      {formatISTDate(evt.dateStr)}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${evt.badgeClass}`}
                    >
                      {evt.label}
                    </span>
                    <div>
                      <Link
                        href={`/ipo/${evt.ipo.slug}`}
                        className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 transition-colors"
                      >
                        {evt.ipo.company_name}
                      </Link>
                      <span className="text-zinc-400 ml-2 font-mono text-[11px]">
                        ({evt.ipo.segment.toUpperCase()} • {evt.ipo.exchange})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {evt.ipo.is_demo && <DemoBadge />}
                    <StatusBadge status={evt.ipo.status} />
                    <Link
                      href={`/ipo/${evt.ipo.slug}`}
                      className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
