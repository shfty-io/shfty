-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a GitHub-specific handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    github_data JSONB;
    github_username TEXT;
    full_name TEXT;
    avatar_url TEXT;
BEGIN
    -- Get GitHub metadata from raw_user_meta_data
    github_data := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
    
    -- Extract GitHub-specific user information
    -- GitHub typically provides username as 'user_name' or 'preferred_username'
    github_username := COALESCE(
        github_data->>'user_name',
        github_data->>'preferred_username',
        github_data->>'username',
        github_data->>'nickname',
        split_part(NEW.email, '@', 1),
        ''
    );
    
    -- GitHub provides name as 'name' or 'full_name'
    full_name := COALESCE(
        github_data->>'name',
        github_data->>'full_name',
        github_username,
        ''
    );
    
    -- GitHub provides avatar URL as 'avatar_url'
    avatar_url := COALESCE(
        github_data->>'avatar_url',
        NULL
    );

    -- Insert the new profile with GitHub data
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
        github_username,
        true
    );
    
    -- Log successful user creation
    RAISE LOG 'Successfully created profile for GitHub user: %', github_username;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the detailed error for debugging
        RAISE LOG 'Error in handle_new_user for GitHub auth: %, User data: %', SQLERRM, NEW;
        -- Still return NEW to allow the auth user to be created even if profile creation fails
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 