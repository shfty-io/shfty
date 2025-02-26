-- Master fix script - Run this directly in Supabase SQL Editor
-- This script combines both fixes in the correct order

-- Begin transaction
BEGIN;

-- PART 1: Fix profiles.is_admin column
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

-- PART 2: Fix feedback table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedback') THEN
        -- Create feedback table if it doesn't exist
        CREATE TABLE feedback (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'addressed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created feedback table';
    ELSE
        RAISE NOTICE 'Feedback table already exists';
    END IF;
END $$;

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Remove existing policies if they exist to avoid errors
DROP POLICY IF EXISTS insert_own_feedback ON feedback;
DROP POLICY IF EXISTS read_own_feedback ON feedback;
DROP POLICY IF EXISTS admin_read_all_feedback ON feedback;
DROP POLICY IF EXISTS admin_update_all_feedback ON feedback;
DROP POLICY IF EXISTS service_role_manage_all_feedback ON feedback;

-- Create policies
-- Allow users to insert their own feedback
CREATE POLICY insert_own_feedback ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own feedback
CREATE POLICY read_own_feedback ON feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to read all feedback
CREATE POLICY admin_read_all_feedback ON feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow admins to update all feedback (for status changes)
CREATE POLICY admin_update_all_feedback ON feedback
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow service role to manage all feedback
CREATE POLICY service_role_manage_all_feedback ON feedback
  USING (true)
  WITH CHECK (true);

-- Create or replace timestamp update function
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid errors
DROP TRIGGER IF EXISTS update_feedback_timestamp_trigger ON feedback;

-- Create trigger for updating timestamp
CREATE TRIGGER update_feedback_timestamp_trigger
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_timestamp();

-- PART 3: Verification
-- Verify column and table existence
SELECT 
  (SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'is_admin'
  )) AS is_admin_column_exists,
  (SELECT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public' 
      AND tablename = 'feedback'
  )) AS feedback_table_exists;

-- Commit transaction
COMMIT; 