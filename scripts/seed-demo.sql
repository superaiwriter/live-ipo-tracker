-- LiveIPOTracker Dev-Only Seed Script (SQL version for Supabase SQL Editor)
-- ALL ROWS ARE STRICTLY MARKED: is_demo = TRUE
-- Compliant with Rule 2: "every seeded row must be marked is_demo = true and show a 'Demo data' badge."

-- Clean up any previous demo data
DELETE FROM ipos WHERE is_demo = TRUE;

-- 1. Insert Demo IPOs
INSERT INTO ipos (
    id, slug, company_name, symbol, segment, exchange,
    open_date, close_date, allotment_date, refund_date, listing_date,
    price_band_low, price_band_high, lot_size, issue_size_cr, fresh_issue_cr, ofs_cr,
    issue_price, listing_price, registrar, lead_managers, about, logo_url, drhp_url, rhp_url,
    source, source_url, is_demo, created_at, updated_at
) VALUES
-- Mainboard: LIVE / OPEN IPO
(
    '00000000-0000-0000-0000-000000000001',
    'zenith-technologies-ipo',
    'Zenith Technologies Limited',
    'ZENITH',
    'mainboard',
    'both',
    (CURRENT_DATE - INTERVAL '1 day')::timestamptz + INTERVAL '10 hours',
    (CURRENT_DATE + INTERVAL '1 day')::timestamptz + INTERVAL '17 hours',
    (CURRENT_DATE + INTERVAL '2 days')::timestamptz,
    (CURRENT_DATE + INTERVAL '3 days')::timestamptz,
    (CURRENT_DATE + INTERVAL '5 days')::timestamptz + INTERVAL '10 hours',
    475.00, 500.00, 30, 1250.00, 900.00, 350.00,
    NULL, NULL,
    'Link Intime India Pvt Ltd',
    ARRAY['Kotak Mahindra Capital', 'ICICI Securities'],
    'Zenith Technologies provides enterprise cloud infrastructure and cybersecurity architectures for BFSI and healthcare sectors.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop',
    'https://www.sebi.gov.in',
    'https://www.bseindia.com',
    'Local Dev Seed (Rule 2)',
    'http://localhost:3000',
    TRUE,
    NOW(), NOW()
),
-- SME: LIVE / OPEN IPO
(
    '00000000-0000-0000-0000-000000000002',
    'aero-dynamics-sme-ipo',
    'Aero Dynamics SME Limited',
    'AERODYN',
    'sme',
    'NSE',
    (CURRENT_DATE)::timestamptz + INTERVAL '10 hours',
    (CURRENT_DATE + INTERVAL '2 days')::timestamptz + INTERVAL '17 hours',
    (CURRENT_DATE + INTERVAL '3 days')::timestamptz,
    (CURRENT_DATE + INTERVAL '4 days')::timestamptz,
    (CURRENT_DATE + INTERVAL '7 days')::timestamptz + INTERVAL '10 hours',
    115.00, 122.00, 1000, 48.50, 48.50, 0.00,
    NULL, NULL,
    'Bigshare Services Pvt Ltd',
    ARRAY['Hem Securities Limited'],
    'Manufacturer of precision-machined aerospace grade titanium components and drone propulsion frames for defence contractors.',
    'https://images.unsplash.com/photo-1517976487507-598e09641215?w=128&h=128&fit=crop',
    'https://www.sebi.gov.in',
    'https://www.nseindia.com',
    'Local Dev Seed (Rule 2)',
    'http://localhost:3000',
    TRUE,
    NOW(), NOW()
),
-- Mainboard: UPCOMING IPO
(
    '00000000-0000-0000-0000-000000000003',
    'bharat-green-energy-ipo',
    'Bharat Green Energy Infrastructure Ltd',
    'BHARATGRN',
    'mainboard',
    'both',
    (CURRENT_DATE + INTERVAL '4 days')::timestamptz + INTERVAL '10 hours',
    (CURRENT_DATE + INTERVAL '7 days')::timestamptz + INTERVAL '17 hours',
    (CURRENT_DATE + INTERVAL '8 days')::timestamptz,
    (CURRENT_DATE + INTERVAL '9 days')::timestamptz,
    (CURRENT_DATE + INTERVAL '12 days')::timestamptz + INTERVAL '10 hours',
    215.00, 227.00, 65, 3400.00, 2500.00, 900.00,
    NULL, NULL,
    'KFin Technologies Limited',
    ARRAY['Morgan Stanley India', 'Axis Capital', 'SBI Capital Markets'],
    'Independent renewable power producer focusing on utility-scale solar, wind-solar hybrid, and green hydrogen transmission corridors.',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=128&h=128&fit=crop',
    'https://www.sebi.gov.in',
    'https://www.bseindia.com',
    'Local Dev Seed (Rule 2)',
    'http://localhost:3000',
    TRUE,
    NOW(), NOW()
),
-- Mainboard: RECENTLY CLOSED / ALLOTMENT STAGE
(
    '00000000-0000-0000-0000-000000000004',
    'novacare-diagnostics-ipo',
    'NovaCare Diagnostics Limited',
    'NOVACARE',
    'mainboard',
    'both',
    (CURRENT_DATE - INTERVAL '4 days')::timestamptz + INTERVAL '10 hours',
    (CURRENT_DATE - INTERVAL '1 day')::timestamptz + INTERVAL '17 hours',
    (CURRENT_DATE + INTERVAL '1 day')::timestamptz,
    (CURRENT_DATE + INTERVAL '2 days')::timestamptz,
    (CURRENT_DATE + INTERVAL '4 days')::timestamptz + INTERVAL '10 hours',
    340.00, 360.00, 40, 850.00, 400.00, 450.00,
    360.00, NULL,
    'MUFG Link Intime India',
    ARRAY['JM Financial', 'Motilal Oswal'],
    'Chain of pathology and radiology diagnostic centers operating across 14 Tier-1 and Tier-2 Indian cities.',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=128&h=128&fit=crop',
    'https://www.sebi.gov.in',
    'https://www.bseindia.com',
    'Local Dev Seed (Rule 2)',
    'http://localhost:3000',
    TRUE,
    NOW(), NOW()
),
-- Mainboard: RECENTLY LISTED
(
    '00000000-0000-0000-0000-000000000005',
    'stellar-mobility-ipo',
    'Stellar Mobility Platforms Limited',
    'STELLAR',
    'mainboard',
    'both',
    (CURRENT_DATE - INTERVAL '14 days')::timestamptz + INTERVAL '10 hours',
    (CURRENT_DATE - INTERVAL '11 days')::timestamptz + INTERVAL '17 hours',
    (CURRENT_DATE - INTERVAL '9 days')::timestamptz,
    (CURRENT_DATE - INTERVAL '8 days')::timestamptz,
    (CURRENT_DATE - INTERVAL '6 days')::timestamptz + INTERVAL '10 hours',
    180.00, 190.00, 75, 1800.00, 1200.00, 600.00,
    190.00, 245.00,
    'KFin Technologies Limited',
    ARRAY['Citigroup Global Markets India', 'Kotak Mahindra Capital'],
    'EV fleet mobility infrastructure and smart charging grid networks for commercial logistics in metropolitan areas.',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=128&h=128&fit=crop',
    'https://www.sebi.gov.in',
    'https://www.nseindia.com',
    'Local Dev Seed (Rule 2)',
    'http://localhost:3000',
    TRUE,
    NOW(), NOW()
);

-- 2. Insert GMP History (Unofficial time-series, Rule 4)
INSERT INTO gmp_history (ipo_id, gmp_value, recorded_at, source) VALUES
('00000000-0000-0000-0000-000000000001', 95.00, NOW() - INTERVAL '3 hours', 'Market Survey (Demo)'),
('00000000-0000-0000-0000-000000000001', 90.00, NOW() - INTERVAL '1 day', 'Market Survey (Demo)'),
('00000000-0000-0000-0000-000000000001', 82.00, NOW() - INTERVAL '2 days', 'Market Survey (Demo)'),

('00000000-0000-0000-0000-000000000002', 32.00, NOW() - INTERVAL '2 hours', 'Market Survey (Demo)'),
('00000000-0000-0000-0000-000000000002', 28.00, NOW() - INTERVAL '1 day', 'Market Survey (Demo)'),

('00000000-0000-0000-0000-000000000003', 45.00, NOW() - INTERVAL '5 hours', 'Market Survey (Demo)'),

('00000000-0000-0000-0000-000000000004', 68.00, NOW() - INTERVAL '1 day', 'Market Survey (Demo)'),
('00000000-0000-0000-0000-000000000004', 62.00, NOW() - INTERVAL '2 days', 'Market Survey (Demo)'),

('00000000-0000-0000-0000-000000000005', 55.00, NOW() - INTERVAL '7 days', 'Market Survey (Demo)');

-- 3. Insert Subscription History
INSERT INTO subscription_history (ipo_id, qib_x, nii_x, retail_x, total_x, recorded_at, source) VALUES
('00000000-0000-0000-0000-000000000001', 14.85, 22.40, 8.65, 14.30, NOW() - INTERVAL '1 hour', 'BSE/NSE Cumulative (Demo)'),
('00000000-0000-0000-0000-000000000002', 5.20, 12.10, 24.50, 16.40, NOW() - INTERVAL '2 hours', 'NSE Emerge Cumulative (Demo)'),
('00000000-0000-0000-0000-000000000004', 38.60, 42.15, 16.80, 28.90, NOW() - INTERVAL '1 day', 'BSE/NSE Final (Demo)');

-- 4. Insert Financials
INSERT INTO financials (ipo_id, fiscal_year, revenue, profit, net_worth) VALUES
('00000000-0000-0000-0000-000000000001', 'FY 2024', 485.60, 68.40, 312.50),
('00000000-0000-0000-0000-000000000001', 'FY 2023', 392.10, 45.20, 244.10),
('00000000-0000-0000-0000-000000000001', 'FY 2022', 280.50, 31.80, 198.90),

('00000000-0000-0000-0000-000000000002', 'FY 2024', 64.20, 8.90, 42.10),
('00000000-0000-0000-0000-000000000002', 'FY 2023', 48.70, 5.40, 33.20),

('00000000-0000-0000-0000-000000000004', 'FY 2024', 320.40, 41.20, 210.80),
('00000000-0000-0000-0000-000000000005', 'FY 2024', 890.10, 112.50, 650.00);
