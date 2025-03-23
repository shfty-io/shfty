-- Migration: 03_tables.sql
-- Description: Create all database tables

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
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
  token_status TEXT,
  token_last_verified TIMESTAMPTZ,
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
  price NUMERIC(10,2) DEFAULT 0,
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
  payment_intent TEXT,
  source TEXT,
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