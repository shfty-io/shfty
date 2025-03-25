-- Migration: 04_add_purchases.sql
-- Description: Add purchases table with improved payment tracking

-- Drop existing purchases table if it exists
DROP TABLE IF EXISTS purchases CASCADE;

-- Create purchases table with improved structure
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  payment_intent_id TEXT UNIQUE,
  amount_total INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  seller_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  refund_status TEXT,
  dispute_status TEXT,
  review_status TEXT,
  metadata JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_product_id_idx ON purchases(product_id);
CREATE INDEX IF NOT EXISTS purchases_payment_intent_id_idx ON purchases(payment_intent_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);
CREATE INDEX IF NOT EXISTS purchases_payment_status_idx ON purchases(payment_status);

-- Add comment to explain the table's purpose
COMMENT ON TABLE purchases IS 'Tracks all marketplace purchases with comprehensive payment states and amounts';

-- Add comments on key columns
COMMENT ON COLUMN purchases.payment_intent_id IS 'Stripe payment intent ID for cross-referencing';
COMMENT ON COLUMN purchases.platform_fee IS 'Amount collected by the platform (in cents)';
COMMENT ON COLUMN purchases.seller_amount IS 'Amount transferred to seller after platform fee (in cents)';
COMMENT ON COLUMN purchases.status IS 'Overall purchase status';
COMMENT ON COLUMN purchases.payment_status IS 'Stripe payment status';
COMMENT ON COLUMN purchases.metadata IS 'Additional purchase details including source, payment method, etc'; 