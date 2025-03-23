-- Migration: 04_functions.sql
-- Description: Create all database functions

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    meta_data JSONB;
    user_name TEXT;
    full_name TEXT;
    avatar_url TEXT;
    email_val TEXT;
BEGIN
    -- Log the incoming data for debugging
    RAISE LOG 'New user data: raw_user_meta_data=%', NEW.raw_user_meta_data;
    
    -- Get metadata with priority on raw_user_meta_data (where GitHub info is)
    meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
    
    -- Special handling for GitHub OAuth
    IF meta_data->>'provider' = 'github' THEN
        user_name := meta_data->>'user_name';
        full_name := meta_data->>'name';
        avatar_url := meta_data->>'avatar_url';
    ELSE
        -- Extract user information with fallbacks for different auth providers
        user_name := COALESCE(
            meta_data->>'user_name',
            meta_data->>'preferred_username',
            meta_data->>'username',
            meta_data->>'nickname',
            meta_data->>'email',
            ''
        );
        
        full_name := COALESCE(
            meta_data->>'full_name',
            meta_data->>'name',
            meta_data->>'given_name' || ' ' || COALESCE(meta_data->>'family_name', ''),
            user_name,
            ''
        );
        
        avatar_url := COALESCE(
            meta_data->>'avatar_url',
            meta_data->>'picture',
            meta_data->>'avatar',
            NULL
        );
    END IF;

    email_val := COALESCE(NEW.email, '');
    
    -- Add debug logging
    RAISE LOG 'Extracted data: user_name=%, full_name=%, avatar_url=%', user_name, full_name, avatar_url;

    -- Insert the profile first as a separate transaction
    BEGIN
        INSERT INTO public.profiles (
            id, user_id, email, full_name, avatar_url, github_username, 
            is_admin, stripe_customer_id, email_notifications_enabled
        ) VALUES (
            NEW.id, NEW.id, email_val, full_name, avatar_url, user_name,
            false, NULL, true
        );
    EXCEPTION WHEN unique_violation THEN
        RAISE LOG 'Profile already exists for user %', NEW.id;
        -- Profile already exists, continue
    END;
    
    -- Then create seller account
    BEGIN
        INSERT INTO public.seller_accounts (
            user_id, is_onboarded, account_status
        ) VALUES (
            NEW.id, false, 'pending'
        );
    EXCEPTION WHEN unique_violation THEN
        RAISE LOG 'Seller account already exists for user %', NEW.id;
        -- Seller account already exists, continue
    END;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %, User data: %', SQLERRM, NEW;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamp on feedback update
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle product likes
CREATE OR REPLACE FUNCTION toggle_like(_product_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    liked BOOLEAN;
BEGIN
    -- Try to delete the like
    DELETE FROM likes
    WHERE product_id = _product_id AND user_id = _user_id
    RETURNING TRUE INTO liked;
    
    -- If no row was deleted, insert the like
    IF liked IS NULL THEN
        INSERT INTO likes (product_id, user_id)
        VALUES (_product_id, _user_id);
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_view(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET view_count = view_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product purchase count
CREATE OR REPLACE FUNCTION increment_product_purchase(product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET purchase_count = purchase_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product purchase count (alias for increment_product_purchase)
CREATE OR REPLACE FUNCTION increment_purchase_count(product_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Call the existing function to avoid duplicating logic
    PERFORM increment_product_purchase(product_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a user and related data
CREATE OR REPLACE FUNCTION delete_user(input_profile_id UUID)
RETURNS VOID AS $$
BEGIN
    -- First, get the user ID from the profile
    DECLARE
        user_id UUID;
    BEGIN
        SELECT profiles.user_id INTO user_id
        FROM profiles
        WHERE profiles.id = input_profile_id;

        IF user_id IS NULL THEN
            RAISE EXCEPTION 'Profile not found with ID %', input_profile_id;
        END IF;
    END;

    -- Delete user data from various tables
    -- The cascade should handle most dependencies
    DELETE FROM profiles WHERE id = input_profile_id;
    
    -- Return success
    RETURN;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (this will appear in Supabase logs)
        RAISE LOG 'Error in delete_user: %, Profile ID: %', SQLERRM, input_profile_id;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 