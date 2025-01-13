import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    // Verify product ownership and get current codebase URL
    const { data: product } = await supabase
      .from('products')
      .select('codebase_url')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.codebase_url) {
      return NextResponse.json(
        { error: "No codebase to delete" },
        { status: 404 }
      );
    }

    // Delete from storage
    const fileName = product.codebase_url.split('/').pop();
    const { error: deleteError } = await supabase.storage
      .from('codebases')
      .remove([fileName]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Continue anyway as we want to remove from the database
    }

    // Update product to remove codebase URL
    const { error: updateError } = await supabase
      .from('products')
      .update({ codebase_url: null })
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