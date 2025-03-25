import { createClient, createServiceClient } from '@/lib/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const supabase = createClient(await cookies());
    const serviceClient = createServiceClient();
    
    // Parse form data to check for redirect
    const formData = await request.formData();
    const redirectUrl = formData.get('redirect')?.toString() || '/your/listings';
    
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify product ownership
    const { data: product, error: productError } = await serviceClient
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (productError || !product) {
      console.error('Product verification error:', productError);
      return NextResponse.json(
        { error: "Product not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete the product
    const { error: deleteError } = await serviceClient
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    // Redirect after successful deletion
    return redirect(redirectUrl);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 