-- Update the delete_user function to handle missing profiles more gracefully
DROP FUNCTION IF EXISTS public.delete_user(UUID);

-- Function to safely delete a user and anonymize their data
CREATE OR REPLACE FUNCTION public.delete_user(input_profile_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the function creator
AS $$
DECLARE
  profile_id UUID;
  user_auth_id UUID;
  anon_id UUID := gen_random_uuid(); -- Generate a random UUID for anonymization
  product_record RECORD;
  image_url TEXT;
BEGIN
  -- Assign the input parameter to profile_id
  profile_id := input_profile_id;
  
  -- Verify the profile exists and get the auth user ID
  SELECT user_id INTO user_auth_id FROM public.profiles WHERE id = profile_id;
  
  IF user_auth_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- 1. Delete user's likes
  DELETE FROM public.likes WHERE likes.user_id = profile_id;
  
  -- 2. Delete user's reports
  DELETE FROM public.reports WHERE reports.reporter_id = profile_id;
  
  -- 3. Delete user's purchases - must happen before profile deletion due to FK constraint
  DELETE FROM public.purchases WHERE purchases.user_id = profile_id;
  
  -- 4. Anonymize user's feedback
  UPDATE public.feedback
  SET user_id = anon_id
  WHERE feedback.user_id = profile_id;
  
  -- 5. Delete user's seller account if exists
  DELETE FROM public.seller_accounts WHERE seller_accounts.user_id = profile_id;
  
  -- 6. Delete user's repository access records
  DELETE FROM public.repository_access WHERE repository_access.user_id = profile_id;
  
  -- 7. Handle user's products and their storage objects
  -- First, log information about products that will be deleted (for potential recovery)
  CREATE TEMP TABLE deleted_products AS
  SELECT id, name, price, purchase_count, created_at, image_urls
  FROM public.products
  WHERE user_id = profile_id;
  
  -- Log the products being deleted
  RAISE LOG 'Deleting % products for user %: %', 
    (SELECT COUNT(*) FROM deleted_products),
    profile_id,
    (SELECT json_agg(row_to_json(deleted_products)) FROM deleted_products);
  
  -- Delete images from storage for each product
  FOR product_record IN SELECT * FROM deleted_products
  LOOP
    -- Delete each image in the image_urls array
    IF product_record.image_urls IS NOT NULL THEN
      FOREACH image_url IN ARRAY product_record.image_urls
      LOOP
        -- Extract the path from the URL and delete from storage
        PERFORM storage.delete_object('products', substring(image_url from 'products/(.*)'));
        RAISE LOG 'Deleted image from storage: %', image_url;
      END LOOP;
    END IF;
  END LOOP;
  
  -- Now delete the products (this will cascade to purchases, likes, etc.)
  DELETE FROM public.products WHERE user_id = profile_id;
  
  -- Drop the temporary table
  DROP TABLE IF EXISTS deleted_products;
  
  -- 8. Delete user's avatar from storage if it exists
  SELECT avatar_url INTO image_url FROM public.profiles WHERE id = profile_id;
  IF image_url IS NOT NULL AND image_url LIKE 'avatars/%' THEN
    PERFORM storage.delete_object('avatars', substring(image_url from 'avatars/(.*)'));
    RAISE LOG 'Deleted avatar from storage: %', image_url;
  END IF;
  
  -- 9. Delete the profile
  DELETE FROM public.profiles WHERE id = profile_id;
  
  -- Return success
  RETURN true;
  
  -- Any exception will cause the transaction to roll back
  -- since this function is called in a transaction
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in delete_user: %', SQLERRM;
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;

-- Add row level security policy if it doesn't exist already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can only delete themselves'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can only delete themselves"
      ON public.profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = id)';
  END IF;
END
$$;

-- Create a function to manually create a profile for a user if it doesn't exist
CREATE OR REPLACE FUNCTION public.ensure_user_profile(auth_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Check if profile already exists
  SELECT id INTO profile_id FROM public.profiles WHERE user_id = auth_user_id;
  
  -- If profile doesn't exist, create it
  IF profile_id IS NULL THEN
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
      github_username,
      email_notifications_enabled
    )
    SELECT
      auth_user_id,
      auth_user_id,
      email,
      COALESCE(raw_user_meta_data->>'name', ''),
      COALESCE(raw_user_meta_data->>'avatar_url', NULL),
      false,
      false,
      NULL,
      NOW(),
      NOW(),
      COALESCE(raw_user_meta_data->>'user_name', NULL),
      true
    FROM auth.users
    WHERE id = auth_user_id
    RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in ensure_user_profile: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID) TO authenticated; 