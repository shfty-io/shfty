import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a ZIP file" },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB" },
        { status: 400 }
      );
    }

    // Delete old codebase if exists
    if (product.codebaseUrl) {
      const oldFileName = product.codebaseUrl.split('/').pop();
      if (oldFileName) {
        await supabase.storage
          .from('codebases')
          .remove([oldFileName]);
      }
    }

    // Upload new codebase
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('codebases')
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file" },
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
      .update({ codebaseUrl: publicUrl })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Error updating codebase:', error);
    return NextResponse.json(
      { error: error.message || "Failed to update codebase" },
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
  } catch (error: any) {
    console.error('Error deleting codebase:', error);
    return NextResponse.json(
      { error: error.message || "Failed to delete codebase" },
      { status: 500 }
    );
  }
} 