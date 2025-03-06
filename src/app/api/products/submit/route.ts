import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productData } = await request.json();
    console.log('Received product data:', productData);

    // Validate required fields and constraints
    if (!productData.name || !productData.description || 
        typeof productData.price !== 'number' ||
        !productData.categories || !productData.byline || !productData.shortDescription) {
      return NextResponse.json(
        { 
          error: "Missing required fields: " + 
            [
              !productData.name && 'name',
              !productData.description && 'description',
              typeof productData.price !== 'number' && 'price',
              !productData.categories && 'categories',
              !productData.byline && 'byline',
              !productData.shortDescription && 'shortDescription'
            ].filter(Boolean).join(', ')
        },
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
    if (productData.price < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
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
        { error: "Complete Stripe onboarding first" },
        { status: 400 }
      );
    }

    // GitHub repository validation
    if (!productData.githubRepoUrl) {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    // Add this validation at the start of the POST handler:
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('byline', productData.byline)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Byline is already taken" },
        { status: 400 }
      );
    }

    // Add GitHub token check for repository products
    if (productData.githubRepoUrl) {
      const { data: sellerAccount } = await supabase
        .from('seller_accounts')
        .select('github_token')
        .eq('user_id', user.id)
        .single();

      if (!sellerAccount?.github_token) {
        return NextResponse.json(
          { error: "GitHub integration required for repository products" },
          { status: 400 }
        );
      }
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
        technologies: productData.technologies,
        faq: productData.faq,
        github_repo_url: productData.githubRepoUrl,
        github_token: productData.github_token,
        image_urls: productData.imageUrls,
        video_url: productData.videoUrl,
        demo_url: productData.demoUrl,
        status: 'in_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
  } catch (error) {
    console.error('Error submitting product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit product" },
      { status: 500 }
    );
  }
} 