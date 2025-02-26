-- Simple fix script for adding is_admin column
-- Run this directly in Supabase SQL Editor

-- First, verify if column already exists to avoid errors
DO $$
BEGIN
    -- Check if is_admin column exists in profiles table
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_admin column to profiles table';
    ELSE
        RAISE NOTICE 'Column is_admin already exists in profiles table';
    END IF;
END $$;

-- Create index on is_admin for better performance
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin);

-- Set existing admin (optional - uncomment and modify as needed)
-- UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';

-- Confirm the column now exists
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
) AS is_admin_column_exists; 