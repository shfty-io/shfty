-- Migration: Add image_positions column to products table
-- Description: This migration adds a JSONB column to store image position data for product images

-- Add image_positions JSONB column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_positions JSONB;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN products.image_positions IS 'Stores focal point positions for product images as {imageUrl: {x: number, y: number}}';

-- Update the Database Type definition in TypeScript (manual step)
-- Add 'image_positions?: Json | null' to the Row, Insert, and Update types in src/types/supabase.ts 