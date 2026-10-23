import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to parse .env.local without external dotenv dependency
function loadEnvLocal(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const env: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return env;
}

async function main() {
  const env = loadEnvLocal();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('STATUS: FAILED_CREDENTIALS');
    console.error('Missing required Supabase variables in .env.local:');
    if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!serviceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY (required for table insert/upsert under RLS)');
    process.exit(1);
  }

  // Use serviceKey if available for write operations (due to RLS policy "Service role write ipos"), else fallback to anonKey
  const activeKey = serviceKey || anonKey;
  const supabase = createClient(supabaseUrl, activeKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1: Check connection and report real row count of the IPO table before inserting
  console.log('Testing connection to Supabase at:', supabaseUrl);
  const { data: initialData, error: countError, count } = await supabase
    .from('ipos')
    .select('id', { count: 'exact' });

  if (countError) {
    console.error('Connection failed or table access error:', countError.message);
    process.exit(1);
  }

  const rowCountBefore = count !== null ? count : (initialData?.length || 0);
  console.log(`REAL_ROW_COUNT_BEFORE: ${rowCountBefore}`);

  // Step 2: Idempotent upsert on deterministic slug
  const slug = 'jio-platforms-limited-ipo-2026';

  const metadataNotes = JSON.stringify({
    issue_type: 'book-built, 100% fresh issue (no offer for sale)',
    anchor_bidding_date: '2026-10-19',
    face_value_inr: 10,
    fresh_issue_shares: '27 crore equity shares',
    minimum_investment_inr: 13428,
    employee_discount_per_share: 54,
    quotas: {
      qib: 'not more than 50%',
      nii: 'not less than 35%',
      retail: 'not less than 15%',
    },
    sources: [
      'https://www.businesstoday.in/markets/ipo-corner/story/jio-platforms-ipo-price-band-announced-at-rs-1065-1119-issue-size-at-rs-30213-crore-561665-2026-10-14',
      'https://groww.in/blog/jio-platforms-ipo-to-open-on-october-21-2026',
      'https://www.bajajbroking.in/blog/jio-platforms-ipo-price-band-dates-and-key-details',
    ],
    source_note: 'Collected from news/broker pages; verify against the RHP and the NSE/BSE IPO pages. Allotment and listing dates are tentative.',
    last_verified: new Date().toISOString(),
  });

  const jioRecord = {
    slug,
    company_name: 'Jio Platforms Limited',
    symbol: null, // Not declared yet
    segment: 'mainboard',
    exchange: 'both', // NSE and BSE
    open_date: '2026-10-21T04:30:00.000Z', // 10:00 AM IST
    close_date: '2026-10-23T11:30:00.000Z', // 5:00 PM IST
    allotment_date: '2026-10-26T18:29:59.000Z', // Tentative (Groww)
    refund_date: null,
    listing_date: '2026-10-28T04:30:00.000Z', // Tentative (Groww), 10:00 AM IST
    price_band_low: 1065,
    price_band_high: 1119,
    lot_size: 12,
    issue_size_cr: 30213,
    fresh_issue_cr: 30213,
    ofs_cr: 0,
    issue_price: null, // Bidding in progress, issue price not finalized
    listing_price: null, // Not listed yet
    registrar: 'KFin Technologies Limited',
    lead_managers: null,
    about: metadataNotes,
    source: 'manual-secondary',
    source_url: 'https://www.businesstoday.in/markets/ipo-corner/story/jio-platforms-ipo-price-band-announced-at-rs-1065-1119-issue-size-at-rs-30213-crore-561665-2026-10-14',
    is_demo: false,
  };

  const { data: upsertData, error: upsertError } = await supabase
    .from('ipos')
    .upsert(jioRecord, { onConflict: 'slug' })
    .select();

  if (upsertError) {
    console.error('Upsert failed:', upsertError.message);
    process.exit(1);
  }

  console.log('UPSERT_SUCCESS: Jio Platforms Limited inserted/updated.');

  // Step 3: Count rows after
  const { count: countAfter } = await supabase
    .from('ipos')
    .select('id', { count: 'exact' });

  console.log(`REAL_ROW_COUNT_AFTER: ${countAfter}`);
}

main().catch((err) => {
  console.error('Script error:', err.message);
  process.exit(1);
});
