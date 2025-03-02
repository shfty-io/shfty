import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request
) {
  try {
    // Extract the ID and index from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 4]; // -4 because the path is /products/[id]/images/[index]/delete
    const indexStr = pathParts[pathParts.length - 2]; // -2 because the path is /products/[id]/images/[index]/delete
    
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
      .select('image_urls')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.image_urls || product.image_urls.length === 0) {
      return NextResponse.json(
        { error: "No images to delete" },
        { status: 400 }
      );
    }

    const index = parseInt(indexStr);
    if (!product.image_urls || index >= product.image_urls.length) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Remove the image from the array
    const newImageUrls = [...product.image_urls];
    newImageUrls.splice(index, 1);

    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update({ image_urls: newImageUrls })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 