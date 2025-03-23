import { createServiceClient, createServerComponentClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create clients
    const supabase = await createServerComponentClient();
    const serviceClient = createServiceClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Fetch seller account status
    const { data: sellerData, error: sellerError } = await serviceClient
      .from('seller_accounts')
      .select('is_onboarded, stripe_account_id, github_token, token_status')
      .eq('user_id', user.id)
      .single();
    
    if (sellerError && sellerError.code !== 'PGRST116') {
      console.error('Error fetching seller account:', sellerError);
    }
    
    // Fetch user's products
    const { data: products, error: productsError } = await serviceClient
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        categories,
        created_at,
        updated_at,
        status,
        short_description
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Error fetching products' },
        { status: 500 }
      );
    }
    
    // Process product visibility
    const processedProducts = (products || []).map(product => {
      // Check if the product should be visible to customers
      let isVisible = true;
      let visibilityReason = '';
      
      // Free products are always visible
      if (product.price > 0 && sellerData) {
        // Paid products need valid Stripe account and GitHub token
        const hasValidStripeAccount = sellerData.is_onboarded && sellerData.stripe_account_id;
        const hasValidGitHubToken = sellerData.github_token && sellerData.token_status !== 'expired';
        
        if (!hasValidStripeAccount && !hasValidGitHubToken) {
          isVisible = false;
          visibilityReason = 'Missing both Stripe account and GitHub token';
        } else if (!hasValidStripeAccount) {
          isVisible = false;
          visibilityReason = 'Missing Stripe account';
        } else if (!hasValidGitHubToken) {
          isVisible = false;
          visibilityReason = 'Missing or expired GitHub token';
        }
      }
      
      return {
        ...product,
        is_visible: isVisible,
        visibility_reason: visibilityReason
      };
    });
    
    return NextResponse.json({ 
      products: processedProducts,
      sellerAccount: sellerData || null
    });
  } catch (error) {
    console.error('Unexpected error in listings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 