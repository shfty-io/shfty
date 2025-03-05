import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(
  request: Request
) {
  try {
    // Extract the ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // -2 because the last part is 'video'
    
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify product ownership
    const { data: product } = await supabase
      .from('products')
      .select('video_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an MP4, WebM, or OGG video" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Video file is too large. Maximum size is 100MB" },
        { status: 400 }
      );
    }

    // If there's an existing video, delete it first
    if (product.video_url) {
      // Extract the path from the URL
      const urlPath = new URL(product.video_url).pathname;
      const pathParts = urlPath.split('/');
      const existingFileName = pathParts[pathParts.length - 1];
      
      // Check if the path contains user_id and product_id structure
      if (pathParts.includes('videos') && pathParts.length > 3) {
        // This is a path with the new structure
        const filePath = urlPath.substring(urlPath.indexOf('videos'));
        await supabase.storage
          .from('products')
          .remove([filePath]);
      } else {
        // This is a path with the old structure
        await supabase.storage
          .from('products')
          .remove([`videos/${existingFileName}`]);
      }
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    // Create a subfolder structure with user_id/product_id
    const filePath = `videos/${user.id}/${id}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: "Failed to upload video" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    // Update product with new video URL
    const { error: updateError } = await supabase
      .from('products')
      .update({ video_url: publicUrl })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 