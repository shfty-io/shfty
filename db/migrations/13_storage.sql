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

      -- Create products bucket
      IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'products'
      ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('products', 'products', true, 5242880, 
          ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[]);
      END IF;

      -- Create product-videos bucket
      IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'product-videos'
      ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('product-videos', 'product-videos', true, 104857600, 
          ARRAY['video/mp4', 'video/webm', 'video/quicktime']::text[]);
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

      -- Products bucket policies
      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Products - Public select'
      ) THEN
        CREATE POLICY "Products - Public select"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'products');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Products - Auth insert'
      ) THEN
        CREATE POLICY "Products - Auth insert"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (bucket_id = 'products' AND auth.uid() = owner);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Products - Owner update'
      ) THEN
        CREATE POLICY "Products - Owner update"
          ON storage.objects FOR UPDATE
          TO authenticated
          USING (bucket_id = 'products' AND auth.uid() = owner);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Products - Owner delete'
      ) THEN
        CREATE POLICY "Products - Owner delete"
          ON storage.objects FOR DELETE
          TO authenticated
          USING (bucket_id = 'products' AND auth.uid() = owner);
      END IF;

      -- Product-videos bucket policies
      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Product-videos - Public select'
      ) THEN
        CREATE POLICY "Product-videos - Public select"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'product-videos');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Product-videos - Auth insert'
      ) THEN
        CREATE POLICY "Product-videos - Auth insert"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (bucket_id = 'product-videos' AND auth.uid() = owner);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Product-videos - Owner update'
      ) THEN
        CREATE POLICY "Product-videos - Owner update"
          ON storage.objects FOR UPDATE
          TO authenticated
          USING (bucket_id = 'product-videos' AND auth.uid() = owner);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM storage.policies WHERE name = 'Product-videos - Owner delete'
      ) THEN
        CREATE POLICY "Product-videos - Owner delete"
          ON storage.objects FOR DELETE
          TO authenticated
          USING (bucket_id = 'product-videos' AND auth.uid() = owner);
      END IF;
    ELSE
      RAISE NOTICE 'Storage policies table does not exist. Skipping policy creation.';
    END IF;
  ELSE
    RAISE NOTICE 'Storage schema does not exist. Skipping storage setup.';
  END IF;
END
$$; 