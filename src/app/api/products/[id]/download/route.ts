import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function GET(
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

    // Check if user has purchased the product
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .eq('status', 'succeeded')
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "You haven't purchased this product" },
        { status: 403 }
      );
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('codebaseUrl')
      .eq('id', id)
      .single();

    if (productError || !product?.codebaseUrl) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get signed URL for download
    const { data, error: signedUrlError } = await supabase.storage
      .from('codebases')
      .createSignedUrl(
        product.codebaseUrl.split('/').pop()!, // Get filename from URL
        60 // URL expires in 60 seconds
      );

    if (signedUrlError || !data?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error: any) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: error.message || "Failed to process download" },
      { status: 500 }
    );
  }
} 