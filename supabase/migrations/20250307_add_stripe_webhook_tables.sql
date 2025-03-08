-- Schema additions for Stripe webhook event handling

-- First, ensure stripe_account_id has a unique constraint
ALTER TABLE seller_accounts ADD CONSTRAINT unique_stripe_account_id UNIQUE (stripe_account_id);

-- External Account Tracking
CREATE TABLE IF NOT EXISTS seller_external_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_account_id TEXT NOT NULL,
  external_account_id TEXT NOT NULL,
  account_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_seller_account
    FOREIGN KEY(seller_account_id)
    REFERENCES seller_accounts(stripe_account_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS seller_external_accounts_seller_idx ON seller_external_accounts(seller_account_id);

-- Add columns to existing purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_details JSONB;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS dispute_status TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS refund_amount INTEGER;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS refund_status TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS refund_details JSONB;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS fraud_warning BOOLEAN DEFAULT FALSE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS review_status TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Dispute Tracking
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id TEXT UNIQUE NOT NULL,
  payment_intent_id TEXT NOT NULL,
  charge_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  evidence_due_by TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS disputes_payment_intent_idx ON disputes(payment_intent_id);

-- Fraud Warning Tracking
CREATE TABLE IF NOT EXISTS fraud_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warning_id TEXT UNIQUE NOT NULL,
  payment_intent_id TEXT,
  charge_id TEXT NOT NULL,
  actionable BOOLEAN,
  fraud_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fraud_warnings_payment_intent_idx ON fraud_warnings(payment_intent_id);

-- Payment Review Tracking
CREATE TABLE IF NOT EXISTS payment_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id TEXT UNIQUE NOT NULL,
  payment_intent_id TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_reviews_payment_intent_idx ON payment_reviews(payment_intent_id);

-- Seller Payout Tracking
CREATE TABLE IF NOT EXISTS seller_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_id TEXT UNIQUE NOT NULL,
  seller_account_id TEXT NOT NULL,
  user_id UUID,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  arrival_date TIMESTAMPTZ,
  failure_code TEXT,
  failure_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_seller_account
    FOREIGN KEY(seller_account_id)
    REFERENCES seller_accounts(stripe_account_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS seller_payouts_seller_account_idx ON seller_payouts(seller_account_id);
CREATE INDEX IF NOT EXISTS seller_payouts_user_idx ON seller_payouts(user_id);

-- Add additional fields to seller_accounts table
ALTER TABLE seller_accounts ADD COLUMN IF NOT EXISTS last_webhook_update TIMESTAMPTZ;
ALTER TABLE seller_accounts ADD COLUMN IF NOT EXISTS account_details JSONB; 