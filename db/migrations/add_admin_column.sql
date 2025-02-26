-- Add is_admin column to the profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create an index on is_admin for faster lookups
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin);

-- Only update feedback policies if the feedback table exists
DO $$
BEGIN
  -- Check if feedback table exists before trying to modify its policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedback') THEN
    -- Update existing RLS policies that reference is_admin column for feedback table
    DROP POLICY IF EXISTS admin_read_all_feedback ON feedback;
    DROP POLICY IF EXISTS admin_update_all_feedback ON feedback;

    -- Recreate admin policies for feedback table
    CREATE POLICY admin_read_all_feedback ON feedback
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );

    CREATE POLICY admin_update_all_feedback ON feedback
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;
END
$$; 