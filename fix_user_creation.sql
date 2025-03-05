-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create an improved handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    meta_data JSONB;
    user_name TEXT;
    full_name TEXT;
    avatar_url TEXT;
BEGIN
    -- Get metadata from either raw_user_meta_data or raw_app_meta_data
    meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB) || COALESCE(NEW.raw_app_meta_data, '{}'::JSONB);
    
    -- Extract user information with fallbacks for different auth providers
    -- GitHub typically uses 'user_name', 'name', Google uses 'name', 'picture', etc.
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
        meta_data->>'given_name' || ' ' || meta_data->>'family_name',
        user_name,
        ''
    );
    
    avatar_url := COALESCE(
        meta_data->>'avatar_url',
        meta_data->>'picture',
        meta_data->>'avatar',
        NULL
    );

    -- Insert the new profile with extracted data
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
    ) VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.email, ''),
        full_name,
        avatar_url,
        false,
        false,
        NULL,
        NOW(),
        NOW(),
        user_name,
        true
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (this will appear in Supabase logs)
        RAISE LOG 'Error in handle_new_user: %, User data: %', SQLERRM, NEW;
        -- Still return NEW to allow the auth user to be created even if profile creation fails
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 