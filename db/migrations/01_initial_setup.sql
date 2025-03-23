-- Migration: 01_initial_setup.sql
-- Description: Set up extensions and clean up existing objects

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