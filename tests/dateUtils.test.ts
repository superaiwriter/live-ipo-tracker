import { describe, it, expect } from 'vitest';
import {
  splitDateRangeIntoWindows,
  parseDateUTC,
} from '../src/utils/dateUtils';

describe('Date-Window Splitter (splitDateRangeIntoWindows)', () => {
  it('throws an error if from > to', () => {
    expect(() => splitDateRangeIntoWindows('2026-06-01', '2026-05-01')).toThrow(
      /"from" date .* must be before or equal to "to" date/
    );
  });

  it('throws an error for invalid date formats or invalid calendar dates', () => {
    expect(() => splitDateRangeIntoWindows('invalid-date', '2026-05-01')).toThrow();
    expect(() => splitDateRangeIntoWindows('2026-02-30', '2026-03-01')).toThrow();
  });

  it('handles same-day range (inclusive 1 day)', () => {
    const windows = splitDateRangeIntoWindows('2026-03-15', '2026-03-15');
    expect(windows).toHaveLength(1);
    expect(windows[0]).toEqual({
      from: '2026-03-15',
      to: '2026-03-15',
      days: 1,
    });
  });

  it('handles ranges strictly shorter than 90 days as a single window', () => {
    const windows = splitDateRangeIntoWindows('2026-01-01', '2026-01-31');
    expect(windows).toHaveLength(1);
    expect(windows[0]).toEqual({
      from: '2026-01-01',
      to: '2026-01-31',
      days: 31,
    });
  });

  it('handles exact 90-day window', () => {
    // 2026 is non-leap year: Jan (31) + Feb (28) + Mar (31) = 90 days
    const windows = splitDateRangeIntoWindows('2026-01-01', '2026-03-31');
    expect(windows).toHaveLength(1);
    expect(windows[0]).toEqual({
      from: '2026-01-01',
      to: '2026-03-31',
      days: 90,
    });
  });

  it('splits a 91-day range into two consecutive windows (90 days + 1 day)', () => {
    const windows = splitDateRangeIntoWindows('2026-01-01', '2026-04-01');
    expect(windows).toHaveLength(2);
    expect(windows[0]).toEqual({
      from: '2026-01-01',
      to: '2026-03-31',
      days: 90,
    });
    expect(windows[1]).toEqual({
      from: '2026-04-01',
      to: '2026-04-01',
      days: 1,
    });
  });

  it('handles leap-year boundaries correctly (2024 has Feb 29)', () => {
    // 2024 is a leap year: Jan (31) + Feb (29) + Mar 1-30 (30) = 90 days
    const windows = splitDateRangeIntoWindows('2024-01-01', '2024-03-31');
    expect(windows).toHaveLength(2);
    expect(windows[0]).toEqual({
      from: '2024-01-01',
      to: '2024-03-30',
      days: 90,
    });
    expect(windows[1]).toEqual({
      from: '2024-03-31',
      to: '2024-03-31',
      days: 1,
    });
  });

  it('handles year transitions across multi-year queries (e.g. 2 years = ~731 days)', () => {
    const windows = splitDateRangeIntoWindows('2025-01-01', '2026-12-31');
    // Ensure every window is <= 90 days
    for (const w of windows) {
      expect(w.days).toBeLessThanOrEqual(90);
      expect(w.days).toBeGreaterThanOrEqual(1);
    }

    // Verify consecutive and non-overlapping
    for (let i = 0; i < windows.length - 1; i++) {
      const currentEnd = parseDateUTC(windows[i].to).getTime();
      const nextStart = parseDateUTC(windows[i + 1].from).getTime();
      expect(nextStart - currentEnd).toBe(24 * 60 * 60 * 1000); // exactly 1 day gap
    }

    // Verify overall start and end
    expect(windows[0].from).toBe('2025-01-01');
    expect(windows[windows.length - 1].to).toBe('2026-12-31');

    // Total days: 365 in 2025 + 365 in 2026 = 730 days
    const totalDays = windows.reduce((sum, w) => sum + w.days, 0);
    expect(totalDays).toBe(730);
  });
});
