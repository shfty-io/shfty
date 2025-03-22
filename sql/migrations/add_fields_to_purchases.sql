-- Migration: Add payment_intent, amount_total, and source fields to purchases table
-- Description: Adds fields needed for complete purchase tracking with Stripe integration

-- Add payment_intent column (Stripe payment intent ID)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS payment_intent TEXT;

-- Add amount_total column (amount in cents)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS amount_total INTEGER;

-- Add source column (purchase attribution)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS source TEXT;

-- Add payment_details column (JSON for additional payment data)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Add review_status column (for dispute/review tracking)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS review_status TEXT;

-- Add failure_reason column (for failed payments)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Add updated_at column (for tracking updates to purchase status)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update the updated_at field automatically when a row is updated
CREATE OR REPLACE FUNCTION update_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_purchases_updated_at_trigger ON purchases;
CREATE TRIGGER update_purchases_updated_at_trigger
BEFORE UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION update_purchases_updated_at();

-- Add comment to explain the new fields
COMMENT ON TABLE purchases IS 'Records of product purchases with Stripe payment details';
COMMENT ON COLUMN purchases.payment_intent IS 'Stripe payment intent ID for linking with payment events';
COMMENT ON COLUMN purchases.amount_total IS 'Total amount charged in cents';
COMMENT ON COLUMN purchases.source IS 'Attribution source of the purchase (direct, category, etc.)';
COMMENT ON COLUMN purchases.payment_details IS 'Additional payment details as JSON';
COMMENT ON COLUMN purchases.review_status IS 'Status if payment is under review or dispute';
COMMENT ON COLUMN purchases.failure_reason IS 'Reason for payment failure if applicable'; 