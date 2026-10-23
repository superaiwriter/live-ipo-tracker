/**
 * Indian Standard Time (IST) utility module.
 * Indian markets operate strictly in IST (UTC+05:30).
 * All comparisons and displays must respect IST boundaries.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';
export const IST_OFFSET_MINUTES = 330; // 5 hours 30 mins
export const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

/**
 * Returns current date/time adjusted to IST components.
 */
export function getNowIST(customDate?: Date | string | number): Date {
  const base = customDate ? new Date(customDate) : new Date();
  if (isNaN(base.getTime())) {
    return new Date();
  }
  return base;
}

/**
 * Parses a date string (YYYY-MM-DD or ISO timestamp) into an IST millisecond timestamp.
 * If date only (e.g. "2026-10-21"):
 *   - timeOfDay 'start' -> 00:00:00 IST (+05:30)
 *   - timeOfDay 'bidding_close' -> 17:00:00 IST (+05:30)
 *   - timeOfDay 'listing_open' -> 10:00:00 IST (+05:30)
 *   - timeOfDay 'end' -> 23:59:59.999 IST (+05:30)
 */
export function parseDateToIST(
  dateInput: string | null | undefined,
  timeOfDay: 'start' | 'bidding_close' | 'listing_open' | 'end' = 'start'
): number | null {
  if (!dateInput) return null;

  const trimmed = dateInput.trim();
  if (!trimmed) return null;

  // Check if string is date-only (YYYY-MM-DD)
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);

  if (isDateOnly) {
    let timePart = '00:00:00.000';
    if (timeOfDay === 'bidding_close') {
      timePart = '17:00:00.000'; // 5:00 PM IST is standard bidding close
    } else if (timeOfDay === 'listing_open') {
      timePart = '10:00:00.000'; // 10:00 AM IST is standard listing trade opening
    } else if (timeOfDay === 'end') {
      timePart = '23:59:59.999';
    }

    const isoWithOffset = `${trimmed}T${timePart}+05:30`;
    const parsed = new Date(isoWithOffset).getTime();
    return isNaN(parsed) ? null : parsed;
  }

  // Otherwise standard ISO or parseable string
  const parsed = new Date(trimmed).getTime();
  return isNaN(parsed) ? null : parsed;
}

/**
 * Format date as "DD MMM YYYY" in IST. Returns "Not available" if missing or invalid.
 */
export function formatISTDate(
  dateInput: string | null | undefined,
  fallback: string = 'Not available'
): string {
  if (!dateInput) return fallback;

  const ms = typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ? parseDateToIST(dateInput, 'start')
    : new Date(dateInput).getTime();

  if (!ms || isNaN(ms)) return fallback;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms));
}

/**
 * Format date & time as "DD MMM YYYY, hh:mm A IST". Returns fallback if missing.
 */
export function formatISTDateTime(
  dateInput: string | null | undefined,
  fallback: string = 'Not available'
): string {
  if (!dateInput) return fallback;

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;

  const formatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);

  return `${formatted} IST`;
}

/**
 * Checks whether an IPO's listing date falls in the same month and year as the given reference date (in IST).
 */
export function isListingThisMonthIST(
  listingDateInput: string | null | undefined,
  referenceDateInput?: Date | string
): boolean {
  if (!listingDateInput) return false;

  const listingMs = parseDateToIST(listingDateInput, 'start');
  if (!listingMs) return false;

  const ref = referenceDateInput ? new Date(referenceDateInput) : new Date();

  const refParts = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(ref);

  const listingParts = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(new Date(listingMs));

  const refMonth = refParts.find((p) => p.type === 'month')?.value;
  const refYear = refParts.find((p) => p.type === 'year')?.value;
  const listMonth = listingParts.find((p) => p.type === 'month')?.value;
  const listYear = listingParts.find((p) => p.type === 'year')?.value;

  return refMonth === listMonth && refYear === listYear;
}
