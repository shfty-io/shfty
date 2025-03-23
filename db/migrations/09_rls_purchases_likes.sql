-- Migration: 09_rls_purchases_likes.sql
-- Description: Set up RLS policies for purchases and likes tables

-- Purchases table policies
DO $$
BEGIN
  -- Users can view their own purchases
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'purchases' 
    AND policyname = 'Users can view their own purchases'
  ) THEN
    CREATE POLICY "Users can view their own purchases"
    ON purchases FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- Users can create their own purchases
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'purchases' 
    AND policyname = 'Users can create their own purchases'
  ) THEN
    CREATE POLICY "Users can create their own purchases"
    ON purchases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Likes table policies
DO $$
BEGIN
  -- Users can view their own likes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND policyname = 'Users can view their own likes'
  ) THEN
    CREATE POLICY "Users can view their own likes"
    ON likes FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- Users can like products (create likes)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND policyname = 'Users can create likes'
  ) THEN
    CREATE POLICY "Users can create likes"
    ON likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can unlike products (delete likes)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'likes' 
    AND policyname = 'Users can delete their own likes'
  ) THEN
    CREATE POLICY "Users can delete their own likes"
    ON likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END
$$; 