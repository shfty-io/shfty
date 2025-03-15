-- Migration: Rename faq column to features in products table
-- Description: This migration renames the faq JSONB column to features in the products table

-- First, add the new column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS features JSONB;

-- Copy data from faq to features
UPDATE products 
SET features = faq 
WHERE faq IS NOT NULL;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN products.features IS 'Stores product features as an array of {question: string, answer: string} objects';

-- Note: We're not dropping the old column immediately to ensure backward compatibility
-- The old column can be dropped in a future migration after all code has been updated 