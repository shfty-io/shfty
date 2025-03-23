-- Migration: 10_rls_seller_repo.sql
-- Description: Set up RLS policies for seller accounts and repository access

-- Seller accounts table policies
DO $$
BEGIN
  -- Users can view their own seller account
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seller_accounts' 
    AND policyname = 'Users can view their own seller account'
  ) THEN
    CREATE POLICY "Users can view their own seller account"
    ON seller_accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- Users can create their own seller account
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seller_accounts' 
    AND policyname = 'Users can create their own seller account'
  ) THEN
    CREATE POLICY "Users can create their own seller account"
    ON seller_accounts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own seller account
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seller_accounts' 
    AND policyname = 'Users can update their own seller account'
  ) THEN
    CREATE POLICY "Users can update their own seller account"
    ON seller_accounts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Repository access table policies
DO $$
BEGIN
  -- Users can view repositories they have access to
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'repository_access' 
    AND policyname = 'Users can view their repository access'
  ) THEN
    CREATE POLICY "Users can view their repository access"
    ON repository_access FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;

  -- Sellers can grant repository access to buyers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'repository_access' 
    AND policyname = 'Sellers can create repository access'
  ) THEN
    CREATE POLICY "Sellers can create repository access"
    ON repository_access FOR INSERT
    TO authenticated
    WITH CHECK (
      -- Check if the authenticated user is the seller of the product
      EXISTS (
        SELECT 1 FROM products p
        JOIN purchases pur ON p.id = pur.product_id
        WHERE p.user_id = auth.uid()
        AND pur.user_id = repository_access.user_id
        AND p.id = repository_access.product_id
      )
    );
  END IF;

  -- Sellers can update repository access they granted
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'repository_access' 
    AND policyname = 'Sellers can update repository access'
  ) THEN
    CREATE POLICY "Sellers can update repository access"
    ON repository_access FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM products
        WHERE products.id = repository_access.product_id
        AND products.user_id = auth.uid()
      )
    );
  END IF;
END
$$; 