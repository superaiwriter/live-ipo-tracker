-- Copy of initial migration for convenient execution in Supabase Dashboard SQL Editor
-- Run this in Supabase: Project -> SQL Editor -> New Query -> Paste & Run

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE ipo_segment AS ENUM ('mainboard', 'sme');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ipo_exchange AS ENUM ('NSE', 'BSE', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS ipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    symbol TEXT,
    segment ipo_segment NOT NULL DEFAULT 'mainboard',
    exchange ipo_exchange NOT NULL DEFAULT 'both',
    open_date TIMESTAMPTZ,
    close_date TIMESTAMPTZ,
    allotment_date TIMESTAMPTZ,
    refund_date TIMESTAMPTZ,
    listing_date TIMESTAMPTZ,
    price_band_low NUMERIC(12, 2),
    price_band_high NUMERIC(12, 2),
    lot_size INTEGER,
    issue_size_cr NUMERIC(12, 2),
    fresh_issue_cr NUMERIC(12, 2),
    ofs_cr NUMERIC(12, 2),
    issue_price NUMERIC(12, 2),
    listing_price NUMERIC(12, 2),
    registrar TEXT,
    lead_managers TEXT[],
    about TEXT,
    logo_url TEXT,
    drhp_url TEXT,
    rhp_url TEXT,
    source TEXT NOT NULL,
    source_url TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ipos_slug ON ipos (slug);
CREATE INDEX IF NOT EXISTS idx_ipos_segment ON ipos (segment);
CREATE INDEX IF NOT EXISTS idx_ipos_dates ON ipos (open_date, close_date, listing_date);
CREATE INDEX IF NOT EXISTS idx_ipos_is_demo ON ipos (is_demo);

CREATE TABLE IF NOT EXISTS gmp_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ipo_id UUID NOT NULL REFERENCES ipos(id) ON DELETE CASCADE,
    gmp_value NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gmp_ipo_time ON gmp_history (ipo_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ipo_id UUID NOT NULL REFERENCES ipos(id) ON DELETE CASCADE,
    qib_x NUMERIC(10, 2),
    nii_x NUMERIC(10, 2),
    retail_x NUMERIC(10, 2),
    total_x NUMERIC(10, 2),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sub_ipo_time ON subscription_history (ipo_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ipo_id UUID NOT NULL REFERENCES ipos(id) ON DELETE CASCADE,
    fiscal_year TEXT NOT NULL,
    revenue NUMERIC(12, 2),
    profit NUMERIC(12, 2),
    net_worth NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_financials_ipo ON financials (ipo_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ipos_updated_at ON ipos;
CREATE TRIGGER trigger_ipos_updated_at
    BEFORE UPDATE ON ipos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE ipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ipos" ON ipos FOR SELECT USING (true);
CREATE POLICY "Public read gmp_history" ON gmp_history FOR SELECT USING (true);
CREATE POLICY "Public read subscription_history" ON subscription_history FOR SELECT USING (true);
CREATE POLICY "Public read financials" ON financials FOR SELECT USING (true);

CREATE POLICY "Service role write ipos" ON ipos FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write gmp_history" ON gmp_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write subscription_history" ON subscription_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role write financials" ON financials FOR ALL USING (auth.role() = 'service_role');

-- NEWSLETTER SUBSCRIBERS TABLE
DO $$ BEGIN
    CREATE TYPE subscriber_status AS ENUM ('pending_verification', 'verified', 'unsubscribed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    status subscriber_status NOT NULL DEFAULT 'pending_verification',
    verification_token TEXT,
    consent_given_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verified_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers (status);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role write newsletter" ON newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');
