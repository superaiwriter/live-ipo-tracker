/**
 * Date utilities for date range calculation and multi-window splitting.
 * All date math is performed in UTC to prevent daylight savings shifts.
 */

export interface DateWindow {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  days: number; // Inclusive count of calendar days
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Format a Date object or UTC timestamp into YYYY-MM-DD string.
 */
export function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a UTC midnight Date object.
 */
export function parseDateUTC(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) {
    throw new Error(`Invalid date format "${dateStr}". Expected YYYY-MM-DD.`);
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  const d = new Date(Date.UTC(year, month, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month ||
    d.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date "${dateStr}".`);
  }
  return d;
}

/**
 * Splits an arbitrary date range into consecutive, non-overlapping windows of at most maxWindowDays.
 * Both the range and individual windows are inclusive.
 *
 * @param fromDateStr Start date string (YYYY-MM-DD)
 * @param toDateStr End date string (YYYY-MM-DD)
 * @param maxWindowDays Maximum calendar days per window (default 90)
 * @returns Array of DateWindow
 */
export function splitDateRangeIntoWindows(
  fromDateStr: string,
  toDateStr: string,
  maxWindowDays: number = 90
): DateWindow[] {
  if (maxWindowDays < 1) {
    throw new Error(`maxWindowDays must be at least 1, received ${maxWindowDays}`);
  }

  const fromDate = parseDateUTC(fromDateStr);
  const toDate = parseDateUTC(toDateStr);

  const fromTime = fromDate.getTime();
  const toTime = toDate.getTime();

  if (fromTime > toTime) {
    throw new Error(
      `"from" date (${fromDateStr}) must be before or equal to "to" date (${toDateStr}).`
    );
  }

  const windows: DateWindow[] = [];
  let currentStart = fromTime;

  while (currentStart <= toTime) {
    // maxWindowDays inclusive: e.g. start + (maxWindowDays - 1) days
    const maxEnd = currentStart + (maxWindowDays - 1) * MS_PER_DAY;
    const currentEnd = Math.min(maxEnd, toTime);

    const windowFromStr = formatDateUTC(new Date(currentStart));
    const windowToStr = formatDateUTC(new Date(currentEnd));
    const days = Math.round((currentEnd - currentStart) / MS_PER_DAY) + 1;

    windows.push({
      from: windowFromStr,
      to: windowToStr,
      days,
    });

    // Advance to next day
    currentStart = currentEnd + MS_PER_DAY;
  }

  return windows;
}
