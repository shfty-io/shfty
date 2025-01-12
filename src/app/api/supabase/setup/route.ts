import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create codebases bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const codebasesBucket = buckets?.find(bucket => bucket.name === 'codebases');

    if (!codebasesBucket) {
      const { error: createError } = await supabase.storage.createBucket('codebases', {
        public: false,
        fileSizeLimit: 104857600, // 100MB limit
        allowedMimeTypes: ['application/zip', 'application/x-zip-compressed']
      });

      if (createError) {
        throw createError;
      }

      // Create RLS policies for the bucket
      const { error: policyError } = await supabase.rpc('create_storage_policies', {
        bucket_id: 'codebases'
      });

      if (policyError) {
        console.error('Error creating policies:', policyError);
        // Continue even if policy creation fails, as the bucket is created
      }
    }

    return NextResponse.json({ message: 'Storage bucket setup complete' });
  } catch (error: any) {
    console.error('Error setting up storage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup storage' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete the bucket and all its contents
    const { error: deleteError } = await supabase.storage.deleteBucket('codebases');

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Storage bucket cleanup complete' });
  } catch (error: any) {
    console.error('Error cleaning up storage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup storage' },
      { status: 500 }
    );
  }
} 