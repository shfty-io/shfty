-- Add github_token column to seller_accounts table
ALTER TABLE seller_accounts ADD COLUMN IF NOT EXISTS github_token TEXT;

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'seller_accounts_user_id_key'
    ) THEN
        ALTER TABLE seller_accounts ADD CONSTRAINT seller_accounts_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Add comment to explain the column's purpose
COMMENT ON COLUMN seller_accounts.github_token IS 'GitHub personal access token used for managing repository access for buyers'; 