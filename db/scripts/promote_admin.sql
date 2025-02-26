-- Script to promote a user to admin
-- Usage: Replace 'user_email@example.com' with the actual email of the user to promote

-- Promote by email
CREATE OR REPLACE FUNCTION promote_admin_by_email(admin_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE email = admin_email;
  
  RAISE NOTICE 'User with email % has been promoted to admin', admin_email;
END;
$$ LANGUAGE plpgsql;

-- Promote by user_id
CREATE OR REPLACE FUNCTION promote_admin_by_id(admin_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE id = admin_id;
  
  RAISE NOTICE 'User with ID % has been promoted to admin', admin_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage (uncomment and modify as needed):
-- SELECT promote_admin_by_email('admin@example.com');
-- SELECT promote_admin_by_id('00000000-0000-0000-0000-000000000000'); 