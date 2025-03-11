-- Migration: Add software_license column to products table
-- Description: Adds a new column to store software license information for products

-- Create product_license enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_type 
        WHERE typname = 'product_license'
    ) THEN
        CREATE TYPE product_license AS ENUM (
            'MIT',
            'GPL-3.0',
            'Apache-2.0',
            'BSD-3-Clause',
            'BSD-2-Clause',
            'LGPL-3.0',
            'MPL-2.0',
            'AGPL-3.0',
            'Unlicense',
            'Proprietary',
            'CC0-1.0',
            'CC-BY-4.0',
            'CC-BY-SA-4.0',
            'Other'
        );
        RAISE NOTICE 'Created product_license enum type';
    ELSE
        RAISE NOTICE 'product_license enum type already exists';
    END IF;
END $$;

-- Verify the products table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
    ) THEN
        RAISE EXCEPTION 'Table products does not exist';
    END IF;
END $$;

-- Check if the column already exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'software_license'
    ) THEN
        RAISE NOTICE 'Column software_license already exists in products table';
    ELSE
        -- Add the software_license column
        ALTER TABLE products ADD COLUMN software_license product_license;
        RAISE NOTICE 'Added software_license column to products table';
    END IF;
END $$; 