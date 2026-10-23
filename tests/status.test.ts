import { describe, it, expect } from 'vitest';
import { deriveIpoStatus } from '../src/lib/status';

describe('deriveIpoStatus (Anti-Fabrication Rules)', () => {
  it('returns "unknown" when all dates are missing or empty', () => {
    expect(deriveIpoStatus({})).toBe('unknown');
    expect(
      deriveIpoStatus({
        open_date: null,
        close_date: null,
        listing_date: null,
        listing_price: null,
      })
    ).toBe('unknown');
  });

  it('returns "listed" if listing_price is present and > 0, even without dates', () => {
    expect(
      deriveIpoStatus({
        open_date: null,
        close_date: null,
        listing_date: null,
        listing_price: 150,
      })
    ).toBe('listed');
  });

  it('returns "upcoming" when current time is before open_date', () => {
    const nowRef = '2026-10-24T18:00:00+05:30';
    const status = deriveIpoStatus(
      {
        open_date: '2026-10-25',
        close_date: '2026-10-28',
        listing_date: '2026-11-02',
      },
      nowRef
    );
    expect(status).toBe('upcoming');
  });

  it('returns "upcoming" when only future listing_date is provided', () => {
    const nowRef = '2026-10-24T18:00:00+05:30';
    const status = deriveIpoStatus(
      {
        listing_date: '2026-11-02',
      },
      nowRef
    );
    expect(status).toBe('upcoming');
  });

  it('returns "open" during confirmed subscription window (open_date <= now <= close_date)', () => {
    const nowRef = '2026-10-25T10:00:00+05:30';
    const status = deriveIpoStatus(
      {
        open_date: '2026-10-25',
        close_date: '2026-10-28',
        listing_date: '2026-11-02',
      },
      nowRef
    );
    expect(status).toBe('open');
  });

  it('returns "open" on close_date at 16:59:59 IST (before 5 PM cutoff)', () => {
    const nowRef = '2026-10-28T16:59:59+05:30';
    const status = deriveIpoStatus(
      {
        open_date: '2026-10-25',
        close_date: '2026-10-28',
        listing_date: '2026-11-02',
      },
      nowRef
    );
    expect(status).toBe('open');
  });

  it('returns "closed" on close_date after 5 PM cutoff', () => {
    const nowRef = '2026-10-28T17:00:01+05:30';
    const status = deriveIpoStatus(
      {
        open_date: '2026-10-25',
        close_date: '2026-10-28',
        listing_date: '2026-11-02',
      },
      nowRef
    );
    expect(status).toBe('closed');
  });

  it('does NOT infer "listed" from listing date alone without price evidence', () => {
    // 2026-11-05 is past listing date 2026-11-02, but listing_price is null
    const nowRef = '2026-11-05T12:00:00+05:30';
    const status = deriveIpoStatus(
      {
        open_date: '2026-10-25',
        close_date: '2026-10-28',
        listing_date: '2026-11-02',
        listing_price: null, // missing real price evidence
      },
      nowRef
    );
    // Subscription was closed, so it stays "closed" awaiting listing confirmation, NOT fabricated "listed"
    expect(status).toBe('closed');
  });

  it('returns "listed" when listing_date is past AND listing_price is recorded', () => {
    const nowRef = '2026-11-05T12:00:00+05:30';
    const status = deriveIpoStatus(
      {
        open_date: '2026-10-25',
        close_date: '2026-10-28',
        listing_date: '2026-11-02',
        listing_price: 245.5,
      },
      nowRef
    );
    expect(status).toBe('listed');
  });

  it('does NOT infer "open" when only open_date is in the past without close_date', () => {
    const nowRef = '2026-10-26T10:00:00+05:30';
    // open_date is yesterday, but close_date is not known
    const status = deriveIpoStatus(
      {
        open_date: '2026-10-25',
        close_date: null,
      },
      nowRef
    );
    expect(status).toBe('unknown');
  });

  it('never fabricates "cancelled" from dates alone, but honors explicit provider status', () => {
    const nowRef = '2026-11-10T10:00:00+05:30';
    // Without explicit status, date passing doesn't mean cancelled
    expect(
      deriveIpoStatus({ open_date: '2026-10-01', close_date: '2026-10-04' }, nowRef)
    ).toBe('closed');

    // With explicit provider status, sets cancelled
    expect(
      deriveIpoStatus({
        status: 'cancelled',
        open_date: '2026-10-01',
      })
    ).toBe('cancelled');

    expect(
      deriveIpoStatus({
        status: 'withdrawn',
      })
    ).toBe('cancelled');
  });

  describe('Jio Platforms Limited Lifecycle & Deterministic Status Rules', () => {
    const jioIpo = {
      open_date: '2026-10-21T04:30:00.000Z', // 10:00 AM IST
      close_date: '2026-10-23T11:30:00.000Z', // 5:00 PM IST
      listing_date: '2026-10-28T04:30:00.000Z',
      listing_price: null,
    };

    it('returns "upcoming" before open (e.g. 20 Oct 2026)', () => {
      const nowRef = '2026-10-20T15:00:00+05:30';
      expect(deriveIpoStatus(jioIpo, nowRef)).toBe('upcoming');
    });

    it('returns "open" during active bidding window on 22 Oct 2026', () => {
      const nowRef = '2026-10-22T14:00:00+05:30';
      expect(deriveIpoStatus(jioIpo, nowRef)).toBe('open');
    });

    it('returns "open" on 23 Oct 2026 at 16:59:00 IST (before 5 PM cutoff)', () => {
      const nowRef = '2026-10-23T16:59:00+05:30';
      expect(deriveIpoStatus(jioIpo, nowRef)).toBe('open');
    });

    it('leaves Live Bidding and moves to "closed" on 23 Oct 2026 after 17:00:00 IST', () => {
      const nowRef = '2026-10-23T17:01:00+05:30';
      expect(deriveIpoStatus(jioIpo, nowRef)).toBe('closed');
    });

    it('never infers "listed" after listing date when listing_price is null', () => {
      // 29 Oct 2026 is after tentative listing date 28 Oct 2026, but listing_price is null
      const nowRef = '2026-10-29T10:00:00+05:30';
      expect(deriveIpoStatus(jioIpo, nowRef)).toBe('closed');
    });

    it('returns "listed" only when confirmed listing_price is recorded', () => {
      const nowRef = '2026-10-29T10:00:00+05:30';
      expect(
        deriveIpoStatus(
          {
            ...jioIpo,
            listing_price: 1180,
          },
          nowRef
        )
      ).toBe('listed');
    });
  });
});
