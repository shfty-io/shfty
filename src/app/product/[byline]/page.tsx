import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PurchaseButton } from '@/components/product/PurchaseButton'
import { Database } from '@/types/supabase'
import { ImageGallery } from '@/components/product/ImageGallery'
import { ProductFAQ } from '@/components/product/ProductFAQ'
import { ProductSupport } from '@/components/product/ProductSupport'
import { RefundPolicy } from '@/components/product/RefundPolicy'
import { LikeButton } from '@/components/product/LikeButton'
import { ProductNavbar } from '@/components/product/ProductNavbar'
import { incrementViewCount } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { ProductHero } from '@/components/product/ProductHero'
import { ProductDetails } from '@/components/product/ProductDetails'

type Product = Database['public']['Tables']['products']['Row'] & {
  seller?: {
    email: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  hasPurchased: boolean
}

async function getProduct(byline: string) {
  const supabase = createClient();
  
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

export default async function ProductPage({ 
  params 
}: { 
  params: { byline: string } 
}) {
  // Add await for params resolution
  const { byline } = await Promise.resolve(params);

  if (!byline) {
    notFound();
  }
  
  const product = await getProduct(byline.toString());
  
  if (!product) {
    notFound();
  }

  // Update view count using product ID
  await incrementViewCount(product.id);

  return (
    <div className="min-h-screen bg-background">
      <ProductNavbar />
      <main>
        <div className="space-y-8">
          <ProductHero product={product} hasPurchased={product.hasPurchased} />
          <ImageGallery 
            images={product.image_urls || []} 
            productName={product.name}
          />
          <ProductDetails
            productId={product.id}
            productName={product.name}
            categories={product.categories || []}
            faq={product.faq}
          />
        </div>
      </main>
    </div>
  )
}

export const dynamic = 'force-dynamic'; 