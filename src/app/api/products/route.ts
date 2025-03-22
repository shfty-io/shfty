import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/server';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

type ProductStatus = Database['public']['Enums']['product_status'];

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters
    const params = request.nextUrl.searchParams;
    const page = parseInt(params.get('page') || '1', 10);
    const pageSize = parseInt(params.get('pageSize') || '10', 10);
    const search = params.get('search') || '';
    const sortBy = params.get('sortBy') || 'created_at';
    
    // console.log('API request with params:', { page, pageSize, search, sortBy });
    
    // Validate parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
    }
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 50) {
      return NextResponse.json({ error: 'Invalid pageSize parameter (must be between 1-50)' }, { status: 400 });
    }
    
    const supabase = createServiceClient();
    if (!supabase) {
      console.error('API error: Supabase client initialization failed');
      return NextResponse.json({ error: 'Database client initialization failed' }, { status: 500 });
    }
    
    // First, fetch all approved products with price and seller account info
    let productsQuery = supabase
      .from('products')
      .select(`
        id, 
        price,
        user_id,
        status
      `)
      .eq('status', 'approved');
      
    // Add search filter if provided
    if (search) {
      productsQuery = productsQuery.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }
    
    const { data: productsData, error: productsError } = await productsQuery;
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Now fetch seller accounts for all products that have a user_id
    const userIds = productsData
      .filter(product => product.price > 0) // Only need seller accounts for paid products
      .map(product => product.user_id);
    
    let sellerAccountsData: { 
      user_id: string; 
      is_onboarded: boolean; 
      stripe_account_id: string | null;
      github_token: string | null;
      token_status: string | null;
    }[] = [];
    
    if (userIds.length > 0) {
      const { data: accounts, error: accountsError } = await supabase
        .from('seller_accounts')
        .select('user_id, is_onboarded, stripe_account_id, github_token, token_status')
        .in('user_id', userIds);
      
      if (accountsError) {
        console.error('Error fetching seller accounts:', accountsError);
        return NextResponse.json({ error: 'Failed to fetch seller accounts' }, { status: 500 });
      }
      
      sellerAccountsData = accounts || [];
    }
    
    // Create a map of user_id to seller account for easy lookup
    const sellerAccountMap: Record<string, typeof sellerAccountsData[0]> = sellerAccountsData.reduce((acc, account) => {
      acc[account.user_id] = account;
      return acc;
    }, {} as Record<string, typeof sellerAccountsData[0]>);
    
    // Filter products based on seller account status
    const filteredProductIds = productsData.filter(product => {
      // Free products are always visible
      if (product.price === 0) return true;
      
      // For paid products, ensure seller has a valid Stripe account and GitHub token
      const sellerAccount = sellerAccountMap[product.user_id];
      
      if (!sellerAccount) return false;
      
      // Check for valid Stripe account
      const hasValidStripeAccount = sellerAccount.is_onboarded && sellerAccount.stripe_account_id;
      
      // Check for valid GitHub token
      const hasValidGitHubToken = sellerAccount.github_token && sellerAccount.token_status !== 'expired';
      
      // Product is visible only if seller has both valid Stripe account and GitHub token
      return hasValidStripeAccount && hasValidGitHubToken;
    }).map(product => product.id);
    
    // Get total count of filtered products
    const filteredCount = filteredProductIds.length;
    
    // Fetch detailed product data for the filtered IDs
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_urls,
        short_description,
        byline,
        created_at,
        view_count,
        purchase_count,
        trending_score,
        likes_count,
        github_repo_url,
        github_token,
        status,
        software_license,
        categories,
        user:profiles!products_user_id_fkey (
          avatar_url,
          full_name
        )
      `)
      .in('id', filteredProductIds);
    
    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sortBy === 'price_high') {
      query = query.order('price', { ascending: false });
    } else if (sortBy === 'price_low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'liked') {
      query = query.order('likes_count', { ascending: false });
    } else if (sortBy === 'downloaded') {
      query = query.order('purchase_count', { ascending: false });
    } else {
      // Default sorting by created_at desc
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (page !== -1) {
      const startIndex = (page - 1) * pageSize;
      query = query.range(startIndex, startIndex + pageSize - 1);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching filtered products:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Format the response data
    const products = (data || []).map((product: Record<string, unknown>) => {
      // Handle user data with proper type checking
      let userData = { avatar_url: null as string | null, full_name: null as string | null };
      
      if (product.user) {
        if (Array.isArray(product.user) && product.user.length > 0) {
          userData = {
            avatar_url: product.user[0]?.avatar_url || null,
            full_name: product.user[0]?.full_name || null
          };
        } else if (typeof product.user === 'object') {
          const userObj = product.user as { avatar_url?: string | null; full_name?: string | null };
          userData = {
            avatar_url: userObj.avatar_url || null,
            full_name: userObj.full_name || null
          };
        }
      }
      
      // Ensure status is properly typed
      const status = product.status as ProductStatus | null;
      
      // Ensure categories is an array
      const categories = Array.isArray(product.categories) ? product.categories : [];
      
      return {
        ...product,
        categories,
        status,
        user: userData
      };
    });
    
    // Calculate total pages
    const totalPages = page === -1 
      ? 1 
      : Math.ceil(filteredCount / pageSize);
    
    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: filteredCount
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in product API:', error);
    // Return a more detailed error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 