import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/server';
import { Database } from '@/types/supabase';

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
    
    // First, get the total count for pagination
    let countQuery = supabase
      .from('products')
      .select('id', { count: 'exact' });
      
    // Add search filter if provided
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error counting products:', countError);
      return NextResponse.json({ error: 'Failed to count products' }, { status: 500 });
    }
    
    // Create query for fetching products
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
        user:profiles!products_user_id_fkey (
          avatar_url,
          full_name
        ),
        categories!products_categories(id, name)
      `, { count: 'exact' });
    
    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }
    
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
    
    // If paging is enabled, apply pagination parameters
    if (page !== -1) {
      const startIndex = (page - 1) * pageSize;
      // console.log('Executing Supabase query with pagination');
      query = query
        .range(startIndex, startIndex + pageSize - 1);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Format the response data
    const products = (data || []).map((product: Record<string, unknown>) => {
      // Extract the categories
      const categories = product.categories || [];
      
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
      : Math.ceil((count || 0) / pageSize);
    
    // console.log('Returning products:', products.length);
    // console.log('Pagination info:', { currentPage: page, totalPages, totalItems: count });
    
    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count
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