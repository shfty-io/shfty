import { createClient, createServerComponentClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import { incrementViewCount } from '@/app/actions'
import { ProductPageContent } from './page.client'

async function getProduct(byline: string) {
  const supabase = await createServerComponentClient();
  
  // Validate byline format first
  if (!byline || typeof byline !== 'string') {
    console.error('Invalid byline parameter');
    return null;
  }

  // First try to get by byline
  let query = supabase
    .from('products')
    .select(`
      *,
      github_repo_url,
      image_urls
    `)
    .eq('status', 'approved');

  // Check if the byline is a valid UUID format
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(byline);
  
  if (isUUID) {
    query = query.eq('id', byline);
  } else {
    query = query.eq('byline', byline);
  }

  const { data: product, error } = await query.single();

  if (error || !product) {
    console.error('Product fetch error:', error);
    return null;
  }

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  // Check if the user has purchased the product
  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('product_id', product.id)
      .eq('user_id', user.id)
      .single()
    
    hasPurchased = !!purchase
  }

  // Then get the seller info
  const { data: sellerData } = await supabase
    .from('profiles')
    .select('email, full_name, avatar_url')
    .eq('user_id', product.user_id)
    .single()

  return {
    ...product,
    seller: sellerData ? {
      email: sellerData.email,
      full_name: sellerData.full_name,
      avatar_url: sellerData.avatar_url
    } : null,
    hasPurchased
  }
}

// Define types for the page props
type Params = Promise<{ byline: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

export default async function ProductPage({ params }: PageProps) {
  const { byline } = await params;
  
  // Increment view count (fire and forget)
  incrementViewCount(byline).catch(console.error);

  if (!byline) {
    notFound();
  }
  
  const product = await getProduct(byline.toString());
  
  if (!product) {
    notFound();
  }

  return <ProductPageContent product={product} />;
}

export const dynamic = 'force-dynamic'; 