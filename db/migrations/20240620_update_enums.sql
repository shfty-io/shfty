-- Add missing product categories
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'hosting';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'analytics';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'automation';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'cms';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'publishing';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'ecommerce';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'backend';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'database';

-- Add missing technologies
ALTER TYPE product_technology ADD VALUE IF NOT EXISTS 'dart';
ALTER TYPE product_technology ADD VALUE IF NOT EXISTS 'symfony';
ALTER TYPE product_technology ADD VALUE IF NOT EXISTS 'elixir';
ALTER TYPE product_technology ADD VALUE IF NOT EXISTS 'phoenix';
ALTER TYPE product_technology ADD VALUE IF NOT EXISTS 'meteor';
ALTER TYPE product_technology ADD VALUE IF NOT EXISTS 'rails';
ALTER TYPE product_technology ADD VALUE IF NOT EXISTS 'mariadb'; 