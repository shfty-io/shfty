-- SQL file to update the product_category enum with new categories
-- This script will drop the existing enum and recreate it with the new values

-- Start a transaction to ensure all operations succeed or fail together
BEGIN;

-- First, let's check what columns actually exist in the products table
DO $$
DECLARE
  column_exists BOOLEAN;
  r RECORD;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'categories'
  ) INTO column_exists;

  IF NOT column_exists THEN
    RAISE NOTICE 'Column "categories" does not exist in table "products"';
    -- Let's find out what columns do exist
    RAISE NOTICE 'Available columns in products table:';
    FOR r IN (
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    ) LOOP
      RAISE NOTICE '%', r.column_name;
    END LOOP;
  ELSE
    RAISE NOTICE 'Column "categories" exists in table "products"';
  END IF;
END $$;

-- Drop existing foreign key constraints, indexes or anything that depends on the enum
ALTER TABLE products 
  DROP CONSTRAINT IF EXISTS products_categories_check;

-- Drop the existing enum type
DROP TYPE IF EXISTS product_category CASCADE;

-- Create the new enum type with all categories from the sidebar
CREATE TYPE product_category AS ENUM (
  -- Work & Productivity
  'ai_notetakers', 'app_switcher', 'compliance_software', 'e_signature_apps',
  'knowledge_base_software', 'meeting_software', 'pdf_editor', 'presentation_software',
  'project_management_software', 'scheduling_software', 'search', 'spreadsheets',
  'ad_blockers', 'customer_support_tools', 'email_clients', 'note_and_writing_apps',
  'password_managers', 'screenshots_and_screen_recording_apps', 'security_software',
  'team_collaboration_software',
  
  -- Engineering & Development
  'ab_testing_tools', 'authentication_identity_tools', 'content_management_systems',
  'code_review_tools', 'command_line_tools', 'data_visualization_tools', 'git_clients',
  'issue_tracking_software', 'no_code_platforms', 'standup_bots', 'testing_qa_software',
  'vpn_client', 'ai_coding_assistants', 'automation_tools', 'code_editors',
  'data_analysis_tools', 'databases_backend_frameworks', 'headless_cms_software',
  'observability_tools', 'static_site_generators', 'unified_api', 'website_analytics',
  
  -- Design & Creative
  'design_mockups', 'digital_whiteboards', 'icon_sets', 'ui_frameworks', 'wireframing',
  'background_removal_tools', 'design_resources', 'graphic_design_tools',
  'interface_design_tools', 'photo_editing', 'user_research',
  
  -- Social & Community
  'blogging_platforms', 'dating_apps', 'microblogging_platforms', 'safety_privacy_platforms',
  'community_management', 'link_in_bio_tools', 'messaging_apps', 'newsletter_platforms',
  
  -- Marketing & Sales
  'advertising_tools', 'seo_tools', 'crm_software', 'email_marketing',
  'keyword_research_tools', 'lead_generation_software', 'sales_enablement',
  'social_media_management_tools', 'survey_form_builders', 'business_intelligence_software',
  'marketing_automation_platforms', 'social_media_scheduling_tools',
  
  -- AI
  'ai_characters', 'ai_content_detection', 'ai_generative_art', 'ai_infrastructure_tools',
  'ai_voice_agents', 'chatgpt_prompts', 'predictive_ai', 'ai_chatbots', 'ai_databases',
  'ai_metrics_evaluation', 'llms', 'text_to_speech',
  
  -- Product add-ons
  'chrome_extensions', 'figma_templates', 'slack_apps', 'wordpress_plugins',
  'figma_plugins', 'notion_templates', 'twitter_apps', 'wordpress_themes',
  
  -- Web3
  'crypto_wallets', 'defi', 'nft_creation_tools',
  
  -- Frontend Resources
  'blog', 'portfolio', 'personal', 'dashboard', 'landing_page', 'business',
  'documentation', 'ecommerce', 'boilerplates', 'ui_kits_components', 'templates_themes'
);

-- We need to alter the table to recreate the categories column
-- after we've dropped and recreated the enum type
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS categories product_category[] DEFAULT ARRAY['business']::product_category[];

-- If the column already exists, let's update it
UPDATE products
SET categories = ARRAY['business']::product_category[];

-- Commit the transaction
COMMIT; 