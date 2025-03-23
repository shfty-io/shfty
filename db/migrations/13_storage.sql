-- Migration: 13_storage.sql
-- Description: Configure storage buckets and policies

-- Storage bucket configuration
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage'
  ) THEN
    -- Check if buckets already exist before creating them
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'storage' AND table_name = 'buckets'
    ) THEN
      -- Create avatars bucket
      IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'avatars'
      ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('avatars', 'avatars', false, 2097152, 
          ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']::text[]);
      END IF;
    ELSE
      RAISE NOTICE 'Storage buckets table does not exist. Skipping bucket creation.';
    END IF;

    -- Storage bucket policies
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'storage' AND table_name = 'policies'
    ) THEN
      -- Avatar policies
      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Avatars - Public select'
      ) THEN
        CREATE POLICY "Avatars - Public select"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'avatars');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Avatars - Auth insert'
      ) THEN
        CREATE POLICY "Avatars - Auth insert"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Avatars - Owner update'
      ) THEN
        CREATE POLICY "Avatars - Owner update"
          ON storage.objects FOR UPDATE
          TO authenticated
          USING (bucket_id = 'avatars' AND auth.uid() = owner);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Avatars - Owner delete'
      ) THEN
        CREATE POLICY "Avatars - Owner delete"
          ON storage.objects FOR DELETE
          TO authenticated
          USING (bucket_id = 'avatars' AND auth.uid() = owner);
      END IF;
    ELSE
      RAISE NOTICE 'Storage policies table does not exist. Skipping policy creation.';
    END IF;
  ELSE
    RAISE NOTICE 'Storage schema does not exist. Skipping storage setup.';
  END IF;
END
$$; 