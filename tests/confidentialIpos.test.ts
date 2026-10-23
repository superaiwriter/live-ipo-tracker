import { describe, it, expect } from 'vitest';
import { getIpoProvider } from '@/lib/providers';

describe('Confidential Filings (Anthropic & OpenAI)', () => {
  it('loads Anthropic and OpenAI in upcoming IPOs', async () => {
    const provider = getIpoProvider();
    const upcoming = await provider.getIpos({ status: 'upcoming' });
    const anthropic = upcoming.find((i) => i.slug === 'anthropic-pbc-ipo');
    const openai = upcoming.find((i) => i.slug === 'openai-ipo');

    expect(anthropic).toBeDefined();
    expect(anthropic?.company_name).toBe('Anthropic, PBC');
    expect(anthropic?.status).toBe('confidentially_filed');
    expect(anthropic?.sub_title).toBe('Claude AI · United States');
    expect(anthropic?.price_band_low).toBeNull();
    expect(anthropic?.last_private_valuation).toBe('$965B (Series H, May 2026)');
    expect(anthropic?.reported_note).toContain('Reuters (22 Oct 2026)');
    expect(anthropic?.footer_disclaimer).toContain('Confidential filing ka matlab IPO confirm hona nahi hai');

    expect(openai).toBeDefined();
    expect(openai?.company_name).toBe('OpenAI');
    expect(openai?.status).toBe('confidentially_filed');
    expect(openai?.sub_title).toBe('ChatGPT · United States');
    expect(openai?.last_private_valuation).toBe('$852B post-money (March 2026)');
    expect(openai?.price_band_low).toBeNull();
  });

  it('can fetch Anthropic by slug', async () => {
    const provider = getIpoProvider();
    const anthropic = await provider.getIpoBySlug('anthropic-pbc-ipo');
    expect(anthropic).not.toBeNull();
    expect(anthropic?.company_name).toBe('Anthropic, PBC');
  });
});
