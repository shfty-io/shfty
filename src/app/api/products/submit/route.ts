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

    // Validate required fields and constraints
    if (!productData.name || !productData.description || !productData.price || 
        !productData.categories || !productData.imageUrls || !productData.codebaseUrl ||
        !productData.byline || !productData.shortDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (productData.name.length > 12 || 
        productData.byline.length > 34 || 
        productData.shortDescription.length > 260) {
      return NextResponse.json(
        { error: "One or more fields exceed maximum length" },
        { status: 400 }
      );
    }

    // Validate price minimum
    if (productData.price < 10) {
      return NextResponse.json(
        { error: "Minimum price is $10" },
        { status: 400 }
      );
    }

    // Validate categories
    if (!Array.isArray(productData.categories) || 
        productData.categories.length === 0 || 
        productData.categories.length > 5) {
      return NextResponse.json(
        { error: "Please select between 1 and 5 categories" },
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
        byline: productData.byline,
        short_description: productData.shortDescription,
        description: productData.description, // This will store HTML content
        price: productData.price,
        categories: productData.categories,
        image_urls: productData.imageUrls,
        video_url: productData.videoUrl,
        codebase_url: productData.codebaseUrl,
        faq: productData.faq || null,
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