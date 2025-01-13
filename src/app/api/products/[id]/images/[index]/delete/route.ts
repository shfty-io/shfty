import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string; index: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify product ownership and get current images
    const { data: product } = await supabase
      .from('products')
      .select('image_urls')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const index = parseInt(params.index);
    if (!product.image_urls || index >= product.image_urls.length) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Get the image URL to delete
    const imageUrl = product.image_urls[index];
    const fileName = imageUrl.split('/').pop();

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('products')
      .remove([`images/${fileName}`]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Continue anyway as we want to remove from the database
    }

    // Update product image URLs
    const newImageUrls = product.image_urls.filter((_: string, i: number) => i !== index);
    const { error: updateError } = await supabase
      .from('products')
      .update({ image_urls: newImageUrls })
      .eq('id', params.id);

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