import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

const MAX_CODEBASE_SIZE = 100 * 1024 * 1024; // 100MB

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

    // Verify product ownership
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a ZIP file" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_CODEBASE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 100MB" },
        { status: 400 }
      );
    }

    // If there's an existing codebase, delete it first
    if (product.codebase_url) {
      const existingFileName = product.codebase_url.split('/').pop();
      await supabase.storage
        .from('codebases')
        .remove([existingFileName]);
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${params.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('codebases')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: "Failed to upload codebase" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('codebases')
      .getPublicUrl(fileName);

    // Update product with new codebase URL
    const { error: updateError } = await supabase
      .from('products')
      .update({ codebase_url: publicUrl })
      .eq('id', params.id);

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

export async function DELETE(
  request: Request,
  { params: { id } }: { params: { id: string } }
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

    // Check if user owns the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.codebaseUrl) {
      const fileName = product.codebaseUrl.split('/').pop();
      if (fileName) {
        // Delete file from storage
        const { error: deleteError } = await supabase.storage
          .from('codebases')
          .remove([fileName]);

        if (deleteError) {
          return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
          );
        }
      }
    }

    // Update product to remove codebase URL
    const { error: updateError } = await supabase
      .from('products')
      .update({ codebaseUrl: null })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Codebase deleted successfully" });
  } catch (error: Error | unknown) {
    console.error('Error deleting codebase:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete codebase" },
      { status: 500 }
    );
  }
} 