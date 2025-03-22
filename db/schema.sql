-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if feedback table exists before trying to drop its trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_feedback_timestamp_trigger ON feedback;
  END IF;
END
$$;

-- First, drop all triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all functions first
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS toggle_like(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_product_view(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_product_purchase(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_view_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS cleanup_codebases_bucket() CASCADE;
DROP FUNCTION IF EXISTS manage_codebases_bucket() CASCADE;
DROP FUNCTION IF EXISTS update_feedback_timestamp() CASCADE;
DROP FUNCTION IF EXISTS ensure_user_profile(UUID) CASCADE;
DROP FUNCTION IF EXISTS delete_user(UUID) CASCADE;

-- Drop all tables (in correct dependency order)
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS fraud_warnings CASCADE;
DROP TABLE IF EXISTS payment_reviews CASCADE;
DROP TABLE IF EXISTS seller_external_accounts CASCADE;
DROP TABLE IF EXISTS seller_payouts CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS repository_access CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS seller_accounts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS product_technology CASCADE;
DROP TYPE IF EXISTS report_reason CASCADE;
DROP TYPE IF EXISTS product_license CASCADE;

-- Product related enums
CREATE TYPE product_category AS ENUM (
  'photo_video', 'productivity', 'utilities', 'entertainment',
  'developer_tools', 'business', 'creativity', 'security',
  'lifestyle', 'education', 'communication_social', 'games',
  'finance', 'other', 'hosting', 'analytics', 'automation', 
  'cms', 'publishing', 'ecommerce', 'backend', 'database',
  'frontend_templates'
);

CREATE TYPE product_status AS ENUM ('draft', 'in_review', 'approved', 'rejected');

CREATE TYPE product_technology AS ENUM (
  'react', 'vue', 'angular', 'svelte', 'next_js', 'nuxt',
  'tailwind', 'node_js', 'python', 'java', 'php', 'ruby',
  'go', 'rust', 'postgresql', 'mysql', 'mongodb', 'supabase',
  'firebase', 'aws', 'google_cloud', 'azure', 'vercel',
  'docker', 'kubernetes', 'clerk', 'auth0', 'nextauth',
  'stripe', 'ngrok', 'graphql', 'redis', 'websocket',
  'typescript', 'javascript', 'c_sharp', 'dotnet', 'flutter',
  'react_native', 'swift', 'kotlin', 'laravel', 'django',
  'express', 'fastapi', 'spring_boot', 'prisma', 'drizzle',
  'remix', 'astro', 'solid_js', 'qwik', 'electron',
  'tauri', 'capacitor', 'pwa', 'webassembly', 'deno',
  'dart', 'symfony', 'elixir', 'phoenix', 'meteor', 'rails', 'mariadb'
);

CREATE TYPE report_reason AS ENUM ('copyright_infringement', 'other');

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

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  is_seller BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email_notifications_enabled BOOLEAN DEFAULT true
);

-- Create seller_accounts table first since products references profiles
CREATE TABLE IF NOT EXISTS seller_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT,
  github_token TEXT,
  is_onboarded BOOLEAN DEFAULT false,
  account_status TEXT DEFAULT 'pending',
  last_webhook_update TIMESTAMPTZ,
  account_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  byline TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  image_urls TEXT[],
  video_url TEXT,
  demo_url TEXT,
  github_repo_url TEXT,
  github_token TEXT,
  software_license product_license,
  categories product_category[],
  technologies product_technology[],
  status product_status DEFAULT 'draft',
  faq JSONB,
  features JSONB,
  image_positions JSONB,
  view_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  trending_score FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Create repository_access table
CREATE TABLE IF NOT EXISTS repository_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  access_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'addressed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id TEXT NOT NULL,
  charge_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  evidence_due_by TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create fraud_warnings table
CREATE TABLE IF NOT EXISTS fraud_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warning_id TEXT NOT NULL,
  charge_id TEXT NOT NULL,
  payment_intent_id TEXT,
  fraud_type TEXT,
  actionable BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_reviews table
CREATE TABLE IF NOT EXISTS payment_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seller_external_accounts table
CREATE TABLE IF NOT EXISTS seller_external_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_account_id TEXT NOT NULL,
  external_account_id TEXT NOT NULL,
  account_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seller_payouts table
CREATE TABLE IF NOT EXISTS seller_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payout_id TEXT NOT NULL,
  seller_account_id TEXT NOT NULL,
  user_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  arrival_date TIMESTAMPTZ,
  failure_code TEXT,
  failure_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    meta_data JSONB;
    user_name TEXT;
    full_name TEXT;
    avatar_url TEXT;
    email_val TEXT;
BEGIN
    -- Log the incoming data for debugging
    RAISE LOG 'New user data: raw_user_meta_data=%', NEW.raw_user_meta_data;
    
    -- Get metadata with priority on raw_user_meta_data (where GitHub info is)
    meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
    
    -- Special handling for GitHub OAuth
    IF meta_data->>'provider' = 'github' THEN
        user_name := meta_data->>'user_name';
        full_name := meta_data->>'name';
        avatar_url := meta_data->>'avatar_url';
    ELSE
        -- Extract user information with fallbacks for different auth providers
        user_name := COALESCE(
            meta_data->>'user_name',
            meta_data->>'preferred_username',
            meta_data->>'username',
            meta_data->>'nickname',
            meta_data->>'email',
            ''
        );
        
        full_name := COALESCE(
            meta_data->>'full_name',
            meta_data->>'name',
            meta_data->>'given_name' || ' ' || COALESCE(meta_data->>'family_name', ''),
            user_name,
            ''
        );
        
        avatar_url := COALESCE(
            meta_data->>'avatar_url',
            meta_data->>'picture',
            meta_data->>'avatar',
            NULL
        );
    END IF;

    email_val := COALESCE(NEW.email, '');
    
    -- Add debug logging
    RAISE LOG 'Extracted data: user_name=%, full_name=%, avatar_url=%', user_name, full_name, avatar_url;

    -- Insert the profile first as a separate transaction
    BEGIN
        INSERT INTO public.profiles (
            id, user_id, email, full_name, avatar_url, github_username, 
            is_seller, is_admin, stripe_customer_id, email_notifications_enabled
        ) VALUES (
            NEW.id, NEW.id, email_val, full_name, avatar_url, user_name,
            false, false, NULL, true
        );
    EXCEPTION WHEN unique_violation THEN
        RAISE LOG 'Profile already exists for user %', NEW.id;
        -- Profile already exists, continue
    END;
    
    -- Then create seller account
    BEGIN
        INSERT INTO public.seller_accounts (
            user_id, is_onboarded, account_status
        ) VALUES (
            NEW.id, false, 'pending'
        );
    EXCEPTION WHEN unique_violation THEN
        RAISE LOG 'Seller account already exists for user %', NEW.id;
        -- Seller account already exists, continue
    END;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %, User data: %', SQLERRM, NEW;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for handling new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamp on feedback update
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on feedback update
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS update_feedback_timestamp_trigger ON feedback;
    CREATE TRIGGER update_feedback_timestamp_trigger
      BEFORE UPDATE ON feedback
      FOR EACH ROW
      EXECUTE FUNCTION update_feedback_timestamp();
  END IF;
END
$$;

-- Function to toggle product likes
CREATE OR REPLACE FUNCTION toggle_like(_product_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    liked BOOLEAN;
BEGIN
    -- Try to delete the like
    DELETE FROM likes
    WHERE product_id = _product_id AND user_id = _user_id
    RETURNING TRUE INTO liked;
    
    -- If no row was deleted, insert the like
    IF liked IS NULL THEN
        INSERT INTO likes (product_id, user_id)
        VALUES (_product_id, _user_id);
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET view_count = view_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product purchase count
CREATE OR REPLACE FUNCTION increment_product_purchase(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET purchase_count = purchase_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count (alias for increment_product_view)
CREATE OR REPLACE FUNCTION increment_view_count(product_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM increment_product_view(product_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Functions for managing codebases bucket
CREATE OR REPLACE FUNCTION cleanup_codebases_bucket()
RETURNS VOID AS $$
BEGIN
    -- Implementation details would depend on your storage setup
    -- This is a placeholder function to match the type definition
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION manage_codebases_bucket()
RETURNS VOID AS $$
BEGIN
    -- Implementation details would depend on your storage setup
    -- This is a placeholder function to match the type definition
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a user and related data
CREATE OR REPLACE FUNCTION delete_user(input_profile_id UUID)
RETURNS VOID AS $$
BEGIN
    -- First, get the user ID from the profile
    DECLARE
        user_id UUID;
    BEGIN
        SELECT profiles.user_id INTO user_id
        FROM profiles
        WHERE profiles.id = input_profile_id;

        IF user_id IS NULL THEN
            RAISE EXCEPTION 'Profile not found with ID %', input_profile_id;
        END IF;
    END;

    -- Delete user data from various tables
    -- The cascade should handle most dependencies
    DELETE FROM profiles WHERE id = input_profile_id;
    
    -- Return success
    RETURN;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (this will appear in Supabase logs)
        RAISE LOG 'Error in delete_user: %, Profile ID: %', SQLERRM, input_profile_id;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_external_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES TABLE POLICIES
-- ============================================================
DO $$
BEGIN
  -- Public profiles are viewable by everyone
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone"
      ON profiles FOR SELECT
      USING (true);
  END IF;

  -- Users can update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END
$$;

-- ============================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- PURCHASES TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- LIKES TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- SELLER ACCOUNTS TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- REPOSITORY ACCESS TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- REPORTS TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- FEEDBACK TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- DISPUTES TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- FRAUD WARNINGS TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- PAYMENT REVIEWS TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- SELLER EXTERNAL ACCOUNTS TABLE POLICIES
-- ============================================================
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

-- ============================================================
-- SELLER PAYOUTS TABLE POLICIES
-- ============================================================
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