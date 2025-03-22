import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const productData = await request.json();
    // console.log('Received product data:', productData);

    const supabase = createClient(await cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    // Validate minimum price of $4.99
    if (productData.price > 0 && productData.price < 4.99) {
      return NextResponse.json(
        { error: "Minimum price for paid products is $4.99" },
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
      .select('is_onboarded, stripe_account_id, github_token, token_status')
      .eq('user_id', user.id)
      .single();

    // For paid products, ensure seller has a Stripe account
    if (productData.price > 0) {
      if (!sellerAccount?.is_onboarded || !sellerAccount?.stripe_account_id) {
        return NextResponse.json(
          { error: "You must complete Stripe onboarding before submitting paid products" },
          { status: 400 }
        );
      }
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

    // Add GitHub token check for all products
    if (!sellerAccount?.github_token) {
      return NextResponse.json(
        { error: "GitHub integration required for all products" },
        { status: 400 }
      );
    }
    
    // Check token status if available
    if (sellerAccount.token_status === 'expired') {
      return NextResponse.json(
        { error: "Your GitHub token has expired. Please update it in your seller settings before submitting products." },
        { status: 400 }
      );
    }
    
    // Verify token works if status is unknown
    if (!sellerAccount.token_status) {
      // Verify the token has the required scopes by making a test API call
      const scopeResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${sellerAccount.github_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
      });

      if (!scopeResponse.ok) {
        // Update token status
        await supabase
          .from('seller_accounts')
          .update({
            token_status: 'expired',
            token_last_verified: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        return NextResponse.json(
          { error: "Your GitHub token appears to be invalid or expired. Please update it in your seller settings." },
          { status: 400 }
        );
      }
      
      // Token is valid, update status
      await supabase
        .from('seller_accounts')
        .update({
          token_status: 'valid',
          token_last_verified: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }

    // Prepare visibility warning if applicable
    let visibilityWarning = null;
    if (productData.price > 0) {
      const warnings = [];
      if (!sellerAccount.is_onboarded || !sellerAccount.stripe_account_id) {
        warnings.push("a connected Stripe account");
      }
      if (!sellerAccount.github_token || sellerAccount.token_status === 'expired') {
        warnings.push("a valid GitHub token");
      }
      
      if (warnings.length > 0) {
        visibilityWarning = `Note: Your product will not be visible to customers until you have ${warnings.join(' and ')}.`;
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
        features: productData.features,
        github_repo_url: productData.githubRepoUrl,
        github_token: productData.github_token,
        software_license: productData.softwareLicense,
        image_urls: productData.imageUrls,
        image_positions: productData.imagePositions || null,
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

    // Include visibility warning in response if applicable
    return NextResponse.json({ 
      message: "Product submitted for review successfully",
      visibilityWarning,
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