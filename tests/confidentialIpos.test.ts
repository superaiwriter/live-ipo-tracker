import { describe, it, expect, vi } from 'vitest';
import { getIpoProvider } from '@/lib/providers';
import {
  mergeSupabaseAndCurated,
  getLocalIndiaIpos,
  SupabaseIpoProvider,
} from '@/lib/providers/supabase-provider';
import { IPOWithDetails } from '@/types/ipo';
import * as supabaseDb from '@/lib/db/supabase';

describe('Live Bidding (Anthropic & OpenAI)', () => {
  it('loads Anthropic and OpenAI in live open IPOs', async () => {
    const provider = getIpoProvider();
    const live = await provider.getIpos({ status: 'open' });
    const anthropic = live.find((i) => i.slug === 'anthropic-pbc-ipo');
    const openai = live.find((i) => i.slug === 'openai-ipo');

    expect(anthropic).toBeDefined();
    expect(anthropic?.company_name).toBe('Anthropic, PBC');
    expect(anthropic?.status).toBe('open');
    expect(anthropic?.sub_title).toBe('Claude AI · United States');
    expect(anthropic?.price_band_low).toBe(48);
    expect(anthropic?.last_private_valuation).toBe('$965B (Series H, May 2026)');

    expect(openai).toBeDefined();
    expect(openai?.company_name).toBe('OpenAI');
    expect(openai?.status).toBe('open');
    expect(openai?.sub_title).toBe('ChatGPT · United States');
    expect(openai?.price_band_low).toBe(65);
    expect(openai?.last_private_valuation).toBe('$852B post-money (March 2026)');
  });

  it('can fetch Anthropic by slug', async () => {
    const provider = getIpoProvider();
    const anthropic = await provider.getIpoBySlug('anthropic-pbc-ipo');
    expect(anthropic).not.toBeNull();
    expect(anthropic?.company_name).toBe('Anthropic, PBC');
  });

  it('can fetch OpenAI by slug', async () => {
    const provider = getIpoProvider();
    const openai = await provider.getIpoBySlug('openai-ipo');
    expect(openai).not.toBeNull();
    expect(openai?.company_name).toBe('OpenAI');
  });
});

describe('Curated JSON & Supabase Merge Logic', () => {
  const dummyCurated: IPOWithDetails[] = [
    {
      id: 'curated-jio',
      slug: 'jio-platforms-limited-ipo-2026',
      company_name: 'Jio Platforms (Curated JSON)',
      symbol: null,
      segment: 'mainboard',
      exchange: 'both',
      open_date: '2026-10-21T04:30:00.000Z',
      close_date: '2026-10-23T11:30:00.000Z',
      allotment_date: null,
      refund_date: null,
      listing_date: null,
      price_band_low: 1065,
      price_band_high: 1119,
      lot_size: 12,
      issue_size_cr: 30213,
      fresh_issue_cr: 30213,
      ofs_cr: 0,
      issue_price: null,
      listing_price: null,
      registrar: null,
      lead_managers: null,
      about: null,
      logo_url: null,
      drhp_url: null,
      rhp_url: null,
      source: 'curated',
      source_url: '',
      is_demo: false,
      created_at: '',
      updated_at: '',
      status: 'open',
    },
    {
      id: 'anthropic-pbc-ipo-2026',
      slug: 'anthropic-pbc-ipo',
      company_name: 'Anthropic, PBC',
      symbol: null,
      segment: 'mainboard',
      exchange: 'Not announced',
      open_date: null,
      close_date: null,
      allotment_date: null,
      refund_date: null,
      listing_date: null,
      price_band_low: null,
      price_band_high: null,
      lot_size: null,
      issue_size_cr: null,
      fresh_issue_cr: null,
      ofs_cr: null,
      issue_price: null,
      listing_price: null,
      registrar: null,
      lead_managers: null,
      about: null,
      logo_url: null,
      drhp_url: null,
      rhp_url: null,
      source: 'curated',
      source_url: '',
      is_demo: false,
      created_at: '',
      updated_at: '',
      status: 'confidentially_filed',
    },
  ];

  it('returns JSON-only records when Supabase is empty', () => {
    const sbRecords: IPOWithDetails[] = [];
    const merged = mergeSupabaseAndCurated(sbRecords, dummyCurated);

    expect(merged).toHaveLength(2);
    expect(merged.map((m) => m.slug)).toEqual([
      'jio-platforms-limited-ipo-2026',
      'anthropic-pbc-ipo',
    ]);
  });

  it('overrides JSON record with Supabase record when same slug exists', () => {
    const sbRecords: IPOWithDetails[] = [
      {
        id: 'supabase-jio-id',
        slug: 'jio-platforms-limited-ipo-2026',
        company_name: 'Jio Platforms (Supabase Authoritative Win)',
        symbol: null,
        segment: 'mainboard',
        exchange: 'both',
        open_date: '2026-10-21T04:30:00.000Z',
        close_date: '2026-10-23T11:30:00.000Z',
        allotment_date: null,
        refund_date: null,
        listing_date: null,
        price_band_low: 1065,
        price_band_high: 1119,
        lot_size: 12,
        issue_size_cr: 30213,
        fresh_issue_cr: 30213,
        ofs_cr: 0,
        issue_price: null,
        listing_price: null,
        registrar: null,
        lead_managers: null,
        about: null,
        logo_url: null,
        drhp_url: null,
        rhp_url: null,
        source: 'supabase-india',
        source_url: '',
        is_demo: false,
        created_at: '',
        updated_at: '',
        status: 'open',
      },
    ];

    const merged = mergeSupabaseAndCurated(sbRecords, dummyCurated);

    expect(merged).toHaveLength(2);
    // Jio should come from Supabase
    const jio = merged.find((m) => m.slug === 'jio-platforms-limited-ipo-2026');
    expect(jio?.company_name).toBe('Jio Platforms (Supabase Authoritative Win)');
    expect(jio?.source).toBe('supabase-india');

    // Anthropic should still be present from curated JSON
    const anthropic = merged.find((m) => m.slug === 'anthropic-pbc-ipo');
    expect(anthropic).toBeDefined();
    expect(anthropic?.company_name).toBe('Anthropic, PBC');
  });

  it('still returns JSON records when Supabase returns error or null array', () => {
    const mergedFromNull = mergeSupabaseAndCurated([] as any, dummyCurated);
    expect(mergedFromNull).toHaveLength(2);
    expect(mergedFromNull[0].slug).toBe('jio-platforms-limited-ipo-2026');
    expect(mergedFromNull[1].slug).toBe('anthropic-pbc-ipo');
  });
});

describe('SupabaseIpoProvider Resilience with Configured Supabase', () => {
  it('returns curated records when Supabase query returns empty data', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    vi.spyOn(supabaseDb, 'isSupabaseConfigured').mockReturnValue(true);
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    };

    const provider = new SupabaseIpoProvider(mockClient as any);
    const ipos = await provider.getIpos();

    // Anthropic and OpenAI from curated data/india-ipos.json must be present
    expect(ipos.some((i) => i.slug === 'anthropic-pbc-ipo')).toBe(true);
    expect(ipos.some((i) => i.slug === 'openai-ipo')).toBe(true);
  });

  it('returns curated records when Supabase query returns an error', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      }),
    });

    vi.spyOn(supabaseDb, 'isSupabaseConfigured').mockReturnValue(true);
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    };

    const provider = new SupabaseIpoProvider(mockClient as any);
    const ipos = await provider.getIpos();

    expect(ipos.some((i) => i.slug === 'anthropic-pbc-ipo')).toBe(true);
    expect(ipos.some((i) => i.slug === 'openai-ipo')).toBe(true);
  });

  it('falls back to curated JSON in getIpoBySlug when Supabase does not have the record', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Row not found' },
    });

    vi.spyOn(supabaseDb, 'isSupabaseConfigured').mockReturnValue(true);
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    };

    const provider = new SupabaseIpoProvider(mockClient as any);
    const anthropic = await provider.getIpoBySlug('anthropic-pbc-ipo');

    expect(anthropic).not.toBeNull();
    expect(anthropic?.company_name).toBe('Anthropic, PBC');
    expect(anthropic?.status).toBe('open');
  });
});

