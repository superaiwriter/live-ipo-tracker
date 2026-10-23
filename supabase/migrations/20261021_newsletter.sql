-- LiveIPOTracker: Newsletter Subscribers Table (Double Opt-In, Rule 8 & Privacy Compliant)

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

-- Security Policies:
-- Service role has full access (for secure server actions, verification, and cron)
CREATE POLICY "Service role write newsletter" ON newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');
-- Public cannot read subscriber emails for privacy
