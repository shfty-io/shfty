-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS product_technology CASCADE;
DROP TYPE IF EXISTS report_reason CASCADE;

-- Product related enums
CREATE TYPE product_category AS ENUM (
  'business', 'entertainment', 'developer_tools', 'finance',
  'education', 'games', 'graphics_design', 'health_fitness',
  'lifestyle', 'medical', 'news', 'photo_video',
  'productivity', 'social_networking', 'sports', 'travel',
  'utilities', 'weather', 'other'
);

CREATE TYPE product_status AS ENUM ('draft', 'in_review', 'approved', 'rejected');

CREATE TYPE product_technology AS ENUM (
  'react', 'vue', 'angular', 'svelte', 'next_js', 'nuxt',
  'tailwind', 'node_js', 'python', 'java', 'php', 'ruby',
  'go', 'rust', 'postgresql', 'mysql', 'mongodb', 'supabase',
  'firebase', 'aws', 'google_cloud', 'azure', 'vercel',
  'docker', 'kubernetes', 'clerk', 'auth0', 'nextauth',
  'stripe', 'ngrok', 'graphql', 'redis', 'websocket'
);

CREATE TYPE report_reason AS ENUM ('copyright_infringement', 'other');

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
  categories product_category[],
  technologies product_technology[],
  status product_status DEFAULT 'draft',
  faq JSONB,
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

-- Create seller_accounts table
CREATE TABLE IF NOT EXISTS seller_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT,
  github_token TEXT,
  is_onboarded BOOLEAN DEFAULT false,
  account_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);

-- Enable RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback table
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

-- Function to update timestamp on feedback update
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on feedback update
CREATE TRIGGER update_feedback_timestamp_trigger
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_timestamp();

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        user_id,
        email,
        full_name,
        avatar_url,
        is_seller,
        is_admin,
        stripe_customer_id,
        created_at,
        updated_at,
        github_username
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        false,
        false,
        NULL,
        NOW(),
        NOW(),
        COALESCE(NEW.raw_user_meta_data->>'user_name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for handling new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- More RLS policies can be added here for other tables 