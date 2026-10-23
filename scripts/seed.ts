/**
 * Local Development Seed Script (Strictly Dev-Only, Rule 2 Compliant)
 *
 * Every seeded row is explicitly marked:
 *   is_demo = true
 *   source = "Local Dev Seed (Rule 2)"
 *
 * CANNOT be run in production.
 */

import { createClient } from '@supabase/supabase-js';

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Seed script cannot be run in production environment (Rule 2).');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('---------------------------------------------------------');
  console.log('NOTICE: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.');
  console.log('To run automated TS seed:');
  console.log('1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.log('2. Alternatively, copy and execute scripts/seed-demo.sql in your Supabase SQL Editor.');
  console.log('---------------------------------------------------------');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSeed() {
  console.log('Starting local dev seed with is_demo = true...');

  // 1. Remove previous demo data
  const { error: delError } = await supabase.from('ipos').delete().eq('is_demo', true);
  if (delError) {
    console.error('Failed to clear old demo data:', delError.message);
  }

  const today = new Date();
  const formatOffsetDate = (offsetDays: number, hour: number = 10) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const demoIpos = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      slug: 'zenith-technologies-ipo',
      company_name: 'Zenith Technologies Limited',
      symbol: 'ZENITH',
      segment: 'mainboard',
      exchange: 'both',
      open_date: formatOffsetDate(-1, 10),
      close_date: formatOffsetDate(1, 17),
      allotment_date: formatOffsetDate(2, 10),
      refund_date: formatOffsetDate(3, 10),
      listing_date: formatOffsetDate(5, 10),
      price_band_low: 475,
      price_band_high: 500,
      lot_size: 30,
      issue_size_cr: 1250,
      fresh_issue_cr: 900,
      ofs_cr: 350,
      registrar: 'Link Intime India Pvt Ltd',
      lead_managers: ['Kotak Mahindra Capital', 'ICICI Securities'],
      about: 'Zenith Technologies provides enterprise cloud infrastructure and cybersecurity architectures for BFSI and healthcare sectors.',
      source: 'Local Dev Seed (Rule 2)',
      source_url: 'http://localhost:3000',
      is_demo: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      slug: 'aero-dynamics-sme-ipo',
      company_name: 'Aero Dynamics SME Limited',
      symbol: 'AERODYN',
      segment: 'sme',
      exchange: 'NSE',
      open_date: formatOffsetDate(0, 10),
      close_date: formatOffsetDate(2, 17),
      allotment_date: formatOffsetDate(3, 10),
      refund_date: formatOffsetDate(4, 10),
      listing_date: formatOffsetDate(7, 10),
      price_band_low: 115,
      price_band_high: 122,
      lot_size: 1000,
      issue_size_cr: 48.5,
      fresh_issue_cr: 48.5,
      ofs_cr: 0,
      registrar: 'Bigshare Services Pvt Ltd',
      lead_managers: ['Hem Securities Limited'],
      about: 'Manufacturer of precision-machined aerospace grade titanium components and drone propulsion frames for defence contractors.',
      source: 'Local Dev Seed (Rule 2)',
      source_url: 'http://localhost:3000',
      is_demo: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      slug: 'bharat-green-energy-ipo',
      company_name: 'Bharat Green Energy Infrastructure Ltd',
      symbol: 'BHARATGRN',
      segment: 'mainboard',
      exchange: 'both',
      open_date: formatOffsetDate(4, 10),
      close_date: formatOffsetDate(7, 17),
      allotment_date: formatOffsetDate(8, 10),
      refund_date: formatOffsetDate(9, 10),
      listing_date: formatOffsetDate(12, 10),
      price_band_low: 215,
      price_band_high: 227,
      lot_size: 65,
      issue_size_cr: 3400,
      fresh_issue_cr: 2500,
      ofs_cr: 900,
      registrar: 'KFin Technologies Limited',
      lead_managers: ['Morgan Stanley India', 'Axis Capital', 'SBI Capital Markets'],
      about: 'Independent renewable power producer focusing on utility-scale solar, wind-solar hybrid, and green hydrogen transmission corridors.',
      source: 'Local Dev Seed (Rule 2)',
      source_url: 'http://localhost:3000',
      is_demo: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      slug: 'novacare-diagnostics-ipo',
      company_name: 'NovaCare Diagnostics Limited',
      symbol: 'NOVACARE',
      segment: 'mainboard',
      exchange: 'both',
      open_date: formatOffsetDate(-4, 10),
      close_date: formatOffsetDate(-1, 17),
      allotment_date: formatOffsetDate(1, 10),
      refund_date: formatOffsetDate(2, 10),
      listing_date: formatOffsetDate(4, 10),
      price_band_low: 340,
      price_band_high: 360,
      lot_size: 40,
      issue_size_cr: 850,
      fresh_issue_cr: 400,
      ofs_cr: 450,
      issue_price: 360,
      registrar: 'MUFG Link Intime India',
      lead_managers: ['JM Financial', 'Motilal Oswal'],
      about: 'Chain of pathology and radiology diagnostic centers operating across 14 Tier-1 and Tier-2 Indian cities.',
      source: 'Local Dev Seed (Rule 2)',
      source_url: 'http://localhost:3000',
      is_demo: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      slug: 'stellar-mobility-ipo',
      company_name: 'Stellar Mobility Platforms Limited',
      symbol: 'STELLAR',
      segment: 'mainboard',
      exchange: 'both',
      open_date: formatOffsetDate(-14, 10),
      close_date: formatOffsetDate(-11, 17),
      allotment_date: formatOffsetDate(-9, 10),
      refund_date: formatOffsetDate(-8, 10),
      listing_date: formatOffsetDate(-6, 10),
      price_band_low: 180,
      price_band_high: 190,
      lot_size: 75,
      issue_size_cr: 1800,
      fresh_issue_cr: 1200,
      ofs_cr: 600,
      issue_price: 190,
      listing_price: 245,
      registrar: 'KFin Technologies Limited',
      lead_managers: ['Citigroup Global Markets India', 'Kotak Mahindra Capital'],
      about: 'EV fleet mobility infrastructure and smart charging grid networks for commercial logistics in metropolitan areas.',
      source: 'Local Dev Seed (Rule 2)',
      source_url: 'http://localhost:3000',
      is_demo: true,
    },
  ];

  const { error: insertError } = await supabase.from('ipos').insert(demoIpos);
  if (insertError) {
    console.error('Error inserting demo IPOs:', insertError);
    return;
  }

  // Insert GMP demo records
  const demoGmps = [
    {
      ipo_id: '00000000-0000-0000-0000-000000000001',
      gmp_value: 95,
      recorded_at: new Date().toISOString(),
      source: 'Market Survey (Demo)',
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000002',
      gmp_value: 32,
      recorded_at: new Date().toISOString(),
      source: 'Market Survey (Demo)',
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000003',
      gmp_value: 45,
      recorded_at: new Date().toISOString(),
      source: 'Market Survey (Demo)',
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000004',
      gmp_value: 68,
      recorded_at: new Date().toISOString(),
      source: 'Market Survey (Demo)',
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000005',
      gmp_value: 55,
      recorded_at: formatOffsetDate(-7, 10),
      source: 'Market Survey (Demo)',
    },
  ];

  await supabase.from('gmp_history').insert(demoGmps);

  // Insert Subscription demo records
  const demoSubs = [
    {
      ipo_id: '00000000-0000-0000-0000-000000000001',
      qib_x: 14.85,
      nii_x: 22.4,
      retail_x: 8.65,
      total_x: 14.3,
      recorded_at: new Date().toISOString(),
      source: 'BSE/NSE Cumulative (Demo)',
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000002',
      qib_x: 5.2,
      nii_x: 12.1,
      retail_x: 24.5,
      total_x: 16.4,
      recorded_at: new Date().toISOString(),
      source: 'NSE Emerge Cumulative (Demo)',
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000004',
      qib_x: 38.6,
      nii_x: 42.15,
      retail_x: 16.8,
      total_x: 28.9,
      recorded_at: formatOffsetDate(-1, 17),
      source: 'BSE/NSE Final (Demo)',
    },
  ];

  await supabase.from('subscription_history').insert(demoSubs);

  // Insert Financials demo records
  const demoFin = [
    {
      ipo_id: '00000000-0000-0000-0000-000000000001',
      fiscal_year: 'FY 2024',
      revenue: 485.6,
      profit: 68.4,
      net_worth: 312.5,
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000001',
      fiscal_year: 'FY 2023',
      revenue: 392.1,
      profit: 45.2,
      net_worth: 244.1,
    },
    {
      ipo_id: '00000000-0000-0000-0000-000000000002',
      fiscal_year: 'FY 2024',
      revenue: 64.2,
      profit: 8.9,
      net_worth: 42.1,
    },
  ];

  await supabase.from('financials').insert(demoFin);

  console.log('Successfully seeded demo records! Every record has is_demo = true.');
}

runSeed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
