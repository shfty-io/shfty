import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productData } = await request.json();

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || 
        !productData.category || !productData.imageUrls || !productData.codebaseUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has completed Stripe onboarding
    const { data: sellerAccount } = await supabase
      .from('seller_accounts')
      .select('is_onboarded')
      .eq('user_id', user.id)
      .single();

    if (!sellerAccount?.is_onboarded) {
      return NextResponse.json(
        { error: "Please complete payment setup before submitting a product" },
        { status: 400 }
      );
    }

    // Create new product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        image_urls: productData.imageUrls,
        video_url: productData.videoUrl,
        codebase_url: productData.codebaseUrl,
        status: 'in_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ 
      message: "Product submitted for review successfully",
      product 
    });
  } catch (error: any) {
    console.error('Error submitting product:', error);
    return NextResponse.json(
      { error: error.message || "Failed to submit product" },
      { status: 500 }
    );
  }
} 