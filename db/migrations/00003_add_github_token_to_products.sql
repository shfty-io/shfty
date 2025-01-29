-- Add github_token column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS github_token TEXT;

-- Add comment to explain the column's purpose
COMMENT ON COLUMN products.github_token IS 'GitHub personal access token used for managing repository access for this specific product';

-- Copy existing tokens from seller_accounts if available
UPDATE products p
SET github_token = sa.github_token
FROM seller_accounts sa
WHERE p.user_id = sa.user_id
AND p.github_repo_url IS NOT NULL
AND sa.github_token IS NOT NULL; 