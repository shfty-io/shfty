-- Drop the existing function first
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
  
  -- 7. Handle user's products
  -- Option: Delete products or transfer ownership to admin or mark as orphaned
  UPDATE public.products
  SET user_id = NULL, status = 'rejected'::public.product_status
  WHERE products.user_id = profile_id;
  
  -- 8. Delete the profile
  DELETE FROM public.profiles WHERE id = profile_id;
  
  -- Return success
  RETURN true;
  
  -- Any exception will cause the transaction to roll back
  -- since this function is called in a transaction
EXCEPTION
  WHEN OTHERS THEN
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