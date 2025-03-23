-- Grant permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- Add RLS bypass policies for service_role on all tables
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Service role bypass RLS for %1$s" ON %1$s;
            CREATE POLICY "Service role bypass RLS for %1$s" 
            ON %1$s FOR ALL 
            TO service_role 
            USING (true) 
            WITH CHECK (true);
        ', table_name);
    END LOOP;
END
$$;

-- Explicitly create policies for key tables to ensure they exist
DO $$
BEGIN
    -- For profiles table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Service role bypass RLS for profiles'
    ) THEN
        CREATE POLICY "Service role bypass RLS for profiles" ON profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    -- For products table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Service role bypass RLS for products'
    ) THEN
        CREATE POLICY "Service role bypass RLS for products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    -- For purchases table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'purchases' 
        AND policyname = 'Service role bypass RLS for purchases'
    ) THEN
        CREATE POLICY "Service role bypass RLS for purchases" ON purchases FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    -- For likes table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'likes' 
        AND policyname = 'Service role bypass RLS for likes'
    ) THEN
        CREATE POLICY "Service role bypass RLS for likes" ON likes FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    -- For seller_accounts table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'seller_accounts' 
        AND policyname = 'Service role bypass RLS for seller_accounts'
    ) THEN
        CREATE POLICY "Service role bypass RLS for seller_accounts" ON seller_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    -- For repository_access table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'repository_access' 
        AND policyname = 'Service role bypass RLS for repository_access'
    ) THEN
        CREATE POLICY "Service role bypass RLS for repository_access" ON repository_access FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END
$$;
