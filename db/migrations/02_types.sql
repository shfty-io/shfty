-- Migration: 02_types.sql
-- Description: Define all custom types (ENUMs)

-- Product related enums
CREATE TYPE product_category AS ENUM (
  'ai_notetakers', 'app_switcher', 'compliance_software', 'e_signature_apps', 
  'knowledge_base_software', 'meeting_software', 'pdf_editor', 'presentation_software', 
  'project_management_software', 'scheduling_software', 'search', 'spreadsheets', 
  'ad_blockers', 'customer_support_tools', 'email_clients', 'note_and_writing_apps', 
  'password_managers', 'screenshots_and_screen_recording_apps', 'security_software', 
  'team_collaboration_software', 'ab_testing_tools', 'authentication_identity_tools', 
  'content_management_systems', 'code_review_tools', 'command_line_tools', 'data_visualization_tools', 
  'git_clients', 'issue_tracking_software', 'no_code_platforms', 'standup_bots', 
  'testing_qa_software', 'vpn_client', 'ai_coding_assistants', 'automation_tools', 
  'code_editors', 'data_analysis_tools', 'databases_backend_frameworks', 'headless_cms_software', 
  'observability_tools', 'static_site_generators', 'unified_api', 'website_analytics', 
  'design_mockups', 'digital_whiteboards', 'icon_sets', 'ui_frameworks', 'wireframing', 
  'background_removal_tools', 'design_resources', 'graphic_design_tools', 'interface_design_tools', 
  'photo_editing', 'user_research', 'blogging_platforms', 'dating_apps', 'microblogging_platforms', 
  'safety_privacy_platforms', 'community_management', 'link_in_bio_tools', 'messaging_apps', 
  'newsletter_platforms', 'advertising_tools', 'seo_tools', 'crm_software', 'email_marketing', 
  'keyword_research_tools', 'lead_generation_software', 'sales_enablement', 
  'social_media_management_tools', 'survey_form_builders', 'business_intelligence_software', 
  'marketing_automation_platforms', 'social_media_scheduling_tools', 'ai_characters', 
  'ai_content_detection', 'ai_generative_art', 'ai_infrastructure_tools', 'ai_voice_agents', 
  'chatgpt_prompts', 'predictive_ai', 'ai_chatbots', 'ai_databases', 'ai_metrics_evaluation', 
  'llms', 'text_to_speech', 'action_games', 'adventure_games', 'puzzle_games', 'strategy_games', 
  'role_playing_games', 'simulation_games', 'sports_games', 'board_games', 'card_games', 
  'educational_games', 'chrome_extensions', 'figma_templates', 'slack_apps', 'wordpress_plugins', 
  'figma_plugins', 'notion_templates', 'twitter_apps', 'wordpress_themes', 'crypto_wallets', 
  'defi', 'nft_creation_tools', 'blog', 'portfolio', 'personal', 'dashboard', 'landing_page', 
  'business', 'documentation', 'ecommerce', 'boilerplates', 'ui_kits_components', 'templates_themes'
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