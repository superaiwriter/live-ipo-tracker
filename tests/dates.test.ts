import { describe, it, expect } from 'vitest';
import {
  formatISTDate,
  formatISTDateTime,
  parseDateToIST,
  isListingThisMonthIST,
} from '../src/lib/dates';

describe('IST Date Utilities', () => {
  it('formats dates consistently in Indian Standard Time (DD MMM YYYY)', () => {
    // 2026-10-21
    const formatted = formatISTDate('2026-10-21');
    expect(formatted).toBe('21 Oct 2026');
  });

  it('handles UTC timestamps crossing IST midnight boundary', () => {
    // 2026-10-20 20:00:00 UTC is 2026-10-21 01:30:00 IST (+5:30)
    const utcIso = '2026-10-20T20:00:00Z';
    const formatted = formatISTDate(utcIso);
    expect(formatted).toBe('21 Oct 2026');
  });

  it('formats IST date-time with 12-hour AM/PM and IST suffix', () => {
    const utcIso = '2026-10-21T05:30:00Z'; // 11:00 AM IST
    const formatted = formatISTDateTime(utcIso);
    expect(formatted).toContain('21 Oct 2026');
    expect(formatted).toContain('11:00 am');
    expect(formatted).toContain('IST');
  });

  it('returns fallback string for missing dates', () => {
    expect(formatISTDate(null)).toBe('Not available');
    expect(formatISTDate(undefined)).toBe('Not available');
    expect(formatISTDate('')).toBe('Not available');
    expect(formatISTDateTime(null)).toBe('Not available');
  });

  it('correctly identifies if listing is in the current month in IST', () => {
    const ref = new Date('2026-10-15T10:00:00+05:30');
    expect(isListingThisMonthIST('2026-10-28', ref)).toBe(true);
    expect(isListingThisMonthIST('2026-11-02', ref)).toBe(false);
    expect(isListingThisMonthIST(null, ref)).toBe(false);
  });

  it('parses date-only strings with correct time-of-day offsets in IST', () => {
    // Bidding close should be 17:00:00 IST
    const closeMs = parseDateToIST('2026-10-28', 'bidding_close');
    expect(closeMs).not.toBeNull();
    const closeDate = new Date(closeMs!);
    expect(closeDate.toISOString()).toBe('2026-10-28T11:30:00.000Z'); // 17:00 IST = 11:30 UTC

    // Listing open should be 10:00:00 IST
    const listingMs = parseDateToIST('2026-11-02', 'listing_open');
    expect(listingMs).not.toBeNull();
    const listingDate = new Date(listingMs!);
    expect(listingDate.toISOString()).toBe('2026-11-02T04:30:00.000Z'); // 10:00 IST = 04:30 UTC
  });
});
