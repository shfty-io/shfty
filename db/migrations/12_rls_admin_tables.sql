-- Migration: 12_rls_admin_tables.sql
-- Description: Set up RLS policies for admin-related tables (disputes, fraud warnings, payment reviews, etc.)

-- Disputes table policies
DO $$
BEGIN
  -- Admin can view all disputes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'disputes' 
    AND policyname = 'Admins can view all disputes'
  ) THEN
    CREATE POLICY "Admins can view all disputes"
    ON disputes FOR SELECT
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

-- Fraud warnings table policies
DO $$
BEGIN
  -- Admin can view all fraud warnings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'fraud_warnings' 
    AND policyname = 'Admins can view all fraud warnings'
  ) THEN
    CREATE POLICY "Admins can view all fraud warnings"
    ON fraud_warnings FOR SELECT
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

-- Payment reviews table policies
DO $$
BEGIN
  -- Admin can view all payment reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payment_reviews' 
    AND policyname = 'Admins can view all payment reviews'
  ) THEN
    CREATE POLICY "Admins can view all payment reviews"
    ON payment_reviews FOR SELECT
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

-- Seller external accounts table policies
DO $$
BEGIN
  -- Seller can view their own external accounts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seller_external_accounts' 
    AND policyname = 'Sellers can view their own external accounts'
  ) THEN
    CREATE POLICY "Sellers can view their own external accounts"
    ON seller_external_accounts FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM seller_accounts
        WHERE seller_accounts.user_id = auth.uid()
        AND seller_accounts.id::text = seller_external_accounts.seller_account_id
      )
    );
  END IF;
  
  -- Admin can view all seller external accounts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seller_external_accounts' 
    AND policyname = 'Admins can view all seller external accounts'
  ) THEN
    CREATE POLICY "Admins can view all seller external accounts"
    ON seller_external_accounts FOR SELECT
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

-- Seller payouts table policies
DO $$
BEGIN
  -- Seller can view their own payouts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seller_payouts' 
    AND policyname = 'Sellers can view their own payouts'
  ) THEN
    CREATE POLICY "Sellers can view their own payouts"
    ON seller_payouts FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM seller_accounts
        WHERE seller_accounts.user_id = auth.uid()
        AND seller_accounts.id::text = seller_payouts.seller_account_id
      )
    );
  END IF;
  
  -- Admin can view all seller payouts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seller_payouts' 
    AND policyname = 'Admins can view all seller payouts'
  ) THEN
    CREATE POLICY "Admins can view all seller payouts"
    ON seller_payouts FOR SELECT
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