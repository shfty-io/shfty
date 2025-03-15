-- Create avatars bucket for user profile pictures
BEGIN;

-- Check if the bucket already exists
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    -- Create the avatars bucket
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (
      'avatars',
      'avatars',
      TRUE,
      FALSE,
      2097152, -- 2MB limit
      '{image/png,image/jpeg,image/gif,image/webp}'
    );

    -- Set RLS policies for the bucket
    
    -- Allow users to upload their own avatars
    CREATE POLICY "Users can upload their own avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'avatars' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );
    
    -- Allow public read access to all avatars
    CREATE POLICY "Anyone can view avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');
  END IF;
END $$;

COMMIT; 