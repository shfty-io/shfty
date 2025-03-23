-- Migration: 08_rls_products.sql
-- Description: Set up RLS policies for products table

-- Products table policies
DO $$
BEGIN
  -- Drop existing policy first
  DROP POLICY IF EXISTS "Anyone can view approved products" ON products;
  
  -- Anyone can view approved products - with public access
  CREATE POLICY "Anyone can view approved products"
  ON products FOR SELECT
  USING (status = 'approved');

  -- Authenticated users can view own products in any status
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'Authenticated users can view own products'
  ) THEN
    CREATE POLICY "Authenticated users can view own products"
    ON products FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;

  -- Sellers can create their own products
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'Sellers can create their own products'
  ) THEN
    CREATE POLICY "Sellers can create their own products"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Sellers can update their own products
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'Sellers can update their own products'
  ) THEN
    CREATE POLICY "Sellers can update their own products"
    ON products FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Sellers can delete their own products
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'Sellers can delete their own products'
  ) THEN
    CREATE POLICY "Sellers can delete their own products"
    ON products FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END
$$; 