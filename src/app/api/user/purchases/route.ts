import { createServiceClient, createServerComponentClient } from '@/lib/server';
import { NextResponse } from 'next/server';

// Define proper types
interface Product {
  id: string;
  name: string;
  short_description: string;
  price: number;
  github_repo_url: string;
  user_id: string;
  [key: string]: string | number | boolean | null | undefined; // More specific index signature
}

interface Seller {
  id: string;
  email: string;
  full_name: string;
  [key: string]: string | number | boolean | null | undefined; // More specific index signature
}

export async function GET() {
  try {
    // First get the authenticated user using the serverComponentClient to access cookies
    const authClient = await createServerComponentClient();
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Now use service client for elevated permissions on database operations
    const supabase = createServiceClient();
    
    // First, get the user's profile to ensure we have both IDs
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    const authUserId = user.id;
    const profileId = profileData?.id;
    
    // Fetch purchases
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        id,
        created_at,
        user_id,
        product_id
      `)
      .or(`user_id.eq.${authUserId}${profileId ? `,user_id.eq.${profileId}` : ''}`)
      .order('created_at', { ascending: false });
    
    if (purchasesError) {
      console.error('Error fetching purchases:', purchasesError);
      return NextResponse.json(
        { error: 'Error fetching purchases' },
        { status: 500 }
      );
    }
    
    // If no purchases, return empty array
    if (!purchasesData || purchasesData.length === 0) {
      return NextResponse.json({ purchases: [] });
    }
    
    // Collect all product IDs
    const productIds = purchasesData.map(purchase => purchase.product_id);
    
    // Fetch all products in a single query
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        short_description,
        price,
        github_repo_url,
        user_id
      `)
      .in('id', productIds);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Error fetching product details' },
        { status: 500 }
      );
    }
    
    // Create a map of product ID to product data
    const productsMap: Record<string, Product> = (productsData || []).reduce((map: Record<string, Product>, product) => {
      map[product.id] = product;
      return map;
    }, {});
    
    // Get all seller IDs
    const sellerIds = (productsData || [])
      .map(product => product.user_id)
      .filter(Boolean);
    
    // Fetch all seller profiles in a single query
    const { data: sellersData, error: sellersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', sellerIds);
    
    if (sellersError) {
      console.error('Error fetching seller profiles:', sellersError);
    }
    
    // Create a map of seller ID to seller data
    const sellersMap: Record<string, Seller> = (sellersData || []).reduce((map: Record<string, Seller>, seller) => {
      map[seller.id] = seller;
      return map;
    }, {});
    
    // Combine purchases with product and seller data
    const purchasesWithDetails = purchasesData.map(purchase => {
      const product = productsMap[purchase.product_id] || null;
      const seller = product?.user_id ? sellersMap[product.user_id] || null : null;
      
      return {
        ...purchase,
        product: product ? {
          ...product,
          seller: seller ? {
            email: seller.email,
            full_name: seller.full_name
          } : null
        } : null
      };
    });
    
    return NextResponse.json({ purchases: purchasesWithDetails });
  } catch (error) {
    console.error('Unexpected error in purchases API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 