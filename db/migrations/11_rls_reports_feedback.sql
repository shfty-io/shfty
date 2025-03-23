-- Migration: 11_rls_reports_feedback.sql
-- Description: Set up RLS policies for reports and feedback tables

-- Reports table policies
DO $$
BEGIN
  -- Users can view their own reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reports' 
    AND policyname = 'Users can view their own reports'
  ) THEN
    CREATE POLICY "Users can view their own reports"
    ON reports FOR SELECT
    TO authenticated
    USING (reporter_id = auth.uid());
  END IF;

  -- Users can create reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reports' 
    AND policyname = 'Users can create reports'
  ) THEN
    CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);
  END IF;
  
  -- Admin can view all reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reports' 
    AND policyname = 'Admins can view all reports'
  ) THEN
    CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    TO authenticated
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

-- Feedback table policies
DO $$
BEGIN
  -- Allow users to insert their own feedback
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback' 
    AND policyname = 'insert_own_feedback'
  ) THEN
    CREATE POLICY insert_own_feedback ON feedback
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Allow users to read their own feedback
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback' 
    AND policyname = 'read_own_feedback'
  ) THEN
    CREATE POLICY read_own_feedback ON feedback
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Allow admins to read all feedback
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback' 
    AND policyname = 'admin_read_all_feedback'
  ) THEN
    CREATE POLICY admin_read_all_feedback ON feedback
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;

  -- Allow admins to update all feedback (for status changes)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feedback' 
    AND policyname = 'admin_update_all_feedback'
  ) THEN
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