-- Add category column
ALTER TABLE products 
ADD COLUMN category text,
ADD COLUMN price decimal(10,2) NOT NULL DEFAULT 0.00;

-- Create an enum type for categories to ensure data consistency
CREATE TYPE product_category AS ENUM (
  '3d', 'ai', 'agency', 'animated', 'app', 'blog', 'brand-guidelines',
  'business', 'changelog', 'documentation', 'ecommerce', 'education',
  'entertainment', 'food', 'free', 'health', 'landing-page', 'membership',
  'minimal', 'modern', 'new', 'news', 'personal', 'photography', 'podcast',
  'portfolio', 'real-estate', 'restaurant', 'resume', 'saas', 'sidebar',
  'splash', 'startup', 'tech', 'web3'
);

-- Alter the category column to use the enum type
ALTER TABLE products 
ALTER COLUMN category TYPE product_category USING category::product_category;

-- Add a validation check for price
ALTER TABLE products
ADD CONSTRAINT price_non_negative CHECK (price >= 0);

-- Add an index on category for faster queries
CREATE INDEX idx_products_category ON products(category);

-- Optional: Update existing rows with a default category if needed
-- UPDATE products SET category = 'tech' WHERE category IS NULL;

-- Add comment to describe the columns
COMMENT ON COLUMN products.category IS 'The type of template/product';
COMMENT ON COLUMN products.price IS 'The price of the product in USD'; 