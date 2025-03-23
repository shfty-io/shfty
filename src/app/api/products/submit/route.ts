import { createServiceClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const productData = await request.json();
    console.log('Received product data:', JSON.stringify(productData));

    const supabase = createServiceClient();
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
    if (productData.name.length > 25 || 
        productData.byline.length > 25 || 
        productData.shortDescription.length > 150) {
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

    // Check if user has completed Stripe onboarding
    const { data: sellerAccount, error: sellerError } = await supabase
      .from('seller_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    console.log('Seller account data:', JSON.stringify(sellerAccount));
    
    if (sellerError) {
      console.error('Error fetching seller account:', sellerError);
      return NextResponse.json(
        { error: "Failed to fetch seller account details" },
        { status: 500 }
      );
    }

    // Fix the onboarding status immediately if needed
    if (sellerAccount?.stripe_account_id && !sellerAccount?.is_onboarded) {
      console.log('Fixing onboarding status for user:', user.id);
      const { error: updateError } = await supabase
        .from('seller_accounts')
        .update({
          is_onboarded: true,
          account_status: 'complete'
        })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Error updating seller account:', updateError);
      } else {
        console.log('Successfully updated onboarding status');
        // Refresh seller account data
        const { data: refreshedAccount } = await supabase
          .from('seller_accounts')
          .select('is_onboarded, stripe_account_id')
          .eq('user_id', user.id)
          .single();
        
        if (refreshedAccount) {
          sellerAccount.is_onboarded = refreshedAccount.is_onboarded;
          console.log('Refreshed account data:', JSON.stringify(refreshedAccount));
        }
      }
    }

    // For paid products, ensure seller has a Stripe account
    if (productData.price > 0) {
      if (!sellerAccount?.is_onboarded || !sellerAccount?.stripe_account_id) {
        return NextResponse.json(
          { 
            error: "You must complete Stripe onboarding before submitting paid products", 
            details: {
              has_account: !!sellerAccount,
              is_onboarded: sellerAccount?.is_onboarded,
              has_stripe_id: !!sellerAccount?.stripe_account_id
            }
          },
          { status: 400 }
        );
      }
    }

    // Require GitHub token for paid products
    if (productData.price > 0 && !sellerAccount?.github_token) {
      return NextResponse.json(
        { error: "GitHub token is required for paid products. Please add a GitHub token in your seller settings." },
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

    // GitHub repository validation
    if (!productData.githubRepoUrl) {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    // Check for existing byline
    try {
      const { data: existing, error: bylineError } = await supabase
        .from('products')
        .select('id')
        .eq('byline', productData.byline)
        .single();
  
      if (bylineError && bylineError.code !== 'PGRST116') {
        console.error('Error checking byline:', bylineError);
      }
  
      if (existing) {
        return NextResponse.json(
          { error: "Byline is already taken" },
          { status: 400 }
        );
      }
    } catch (bylineCheckError) {
      console.error('Exception checking byline:', bylineCheckError);
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
      try {
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
      } catch (tokenVerifyError) {
        console.error('Error verifying GitHub token:', tokenVerifyError);
        // Continue anyway, not a blocking error
      }
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

    // Sanitize and prepare product data
    const productToInsert = {
      user_id: user.id,
      name: productData.name,
      byline: productData.byline,
      short_description: productData.shortDescription,
      description: productData.description, 
      price: productData.price,
      categories: productData.categories || [],
      technologies: productData.technologies || [],
      features: productData.features || [],
      github_repo_url: productData.githubRepoUrl,
      github_token: sellerAccount.github_token,
      software_license: productData.softwareLicense || null,
      image_urls: productData.imageUrls || [],
      image_positions: productData.imagePositions || null,
      video_url: productData.videoUrl || null,
      demo_url: productData.demoUrl || null,
      status: 'in_review',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('Attempting to insert product with data:', JSON.stringify(productToInsert));

    // Create new product with better error handling
    try {
      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert(productToInsert)
        .select()
        .single();
  
      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database insert failed: ${insertError.message} (${insertError.code})`);
      }
  
      if (!product) {
        throw new Error('No product returned after insert');
      }
      
      console.log('Product inserted successfully:', product.id);
  
      // Include visibility warning in response if applicable
      return NextResponse.json({ 
        message: "Product submitted for review successfully",
        visibilityWarning,
        product 
      });
    } catch (insertError) {
      console.error('Insert operation failed:', insertError);
      return NextResponse.json(
        { 
          error: "Failed to insert product", 
          details: insertError instanceof Error ? insertError.message : "Unknown database error"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error submitting product:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to submit product",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 