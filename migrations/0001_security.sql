-- Review and apply to a staging backup first. Requires existing application tables.
BEGIN;
-- Stop for human reconciliation rather than merging case-colliding accounts.
DO $$ BEGIN
  IF EXISTS (SELECT lower(btrim(email)) FROM users GROUP BY lower(btrim(email)) HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Case-insensitive duplicate emails require account reconciliation';
  END IF;
END $$;
UPDATE users SET email=lower(btrim(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_normalized_email_unique ON users(lower(btrim(email)));
CREATE TABLE IF NOT EXISTS sessions (
  token_hash varchar(64) PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS payment_events (id varchar(255) PRIMARY KEY, processed_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE mechanic_profiles ADD COLUMN IF NOT EXISTS onboarding_submitted_at timestamptz;
ALTER TABLE mechanic_profiles ADD COLUMN IF NOT EXISTS consent_version text;
ALTER TABLE mechanic_profiles ADD COLUMN IF NOT EXISTS offered_services text[];
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS earnings_credited_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checkout_session_id varchar(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checkout_started_at timestamptz;
-- Historical balances are preserved once, without marking new unpaid work on a rerun.
CREATE TABLE IF NOT EXISTS app_schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM app_schema_migrations WHERE id = '0001_security') THEN
    UPDATE bookings SET earnings_credited_at = COALESCE(completed_at, updated_at) WHERE status = 'completed' AND earnings_credited_at IS NULL;
    INSERT INTO app_schema_migrations(id) VALUES ('0001_security');
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS booking_intent_unique ON bookings(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS booking_checkout_unique ON bookings(checkout_session_id) WHERE checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS booking_mechanic_schedule_idx ON bookings(mechanic_id, scheduled_date);
CREATE INDEX IF NOT EXISTS booking_customer_idx ON bookings(customer_id);
COMMIT;
