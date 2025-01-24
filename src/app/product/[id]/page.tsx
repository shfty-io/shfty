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
  }
  hasPurchased: boolean
}

async function getProduct(id: Promise<string> | string) {
  const resolvedId = await id
  const supabase = createClient()
  
  // First get the product
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      github_repo_url,
      image_urls
    `)
    .eq('id', resolvedId)
    .eq('status', 'approved')
    .single()

  if (error) {
    console.error('Product fetch error:', error)
    return null
  }

  if (!product) {
    console.error('Product not found or not approved:', resolvedId)
    return null
  }

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  // Check if the user has purchased the product
  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('product_id', resolvedId)
      .eq('user_id', user.id)
      .single()
    
    hasPurchased = !!purchase
  }

  // Then get the seller info
  const { data: sellerData } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('user_id', product.user_id)
    .single()

  return {
    ...product,
    seller: sellerData ? {
      email: sellerData.email,
      full_name: sellerData.full_name
    } : null,
    hasPurchased
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const id = await Promise.resolve(params.id)
  const product = await getProduct(id)
  
  if (!product) {
    notFound()
  }

  // Increment view count
  await incrementViewCount(id)

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