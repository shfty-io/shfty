import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { PurchaseButton } from '@/components/product/PurchaseButton'
import { Database } from '@/types/supabase'
import { ImageGallery } from '@/components/product/ImageGallery'
import { ProductHeader } from '@/components/product/ProductHeader'
import { ProductDescription } from '@/components/product/ProductDescription'
import { ProductFAQ } from '@/components/product/ProductFAQ'
import { ProductSupport } from '@/components/product/ProductSupport'
import { RefundPolicy } from '@/components/product/RefundPolicy'

type Product = Database['public']['Tables']['products']['Row'] & {
  seller?: {
    email: string | null
    full_name: string | null
  }
}

async function getProduct(id: string) {
  const supabase = createClient()
  
  // First get the product
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (error) {
    console.error('Product fetch error:', error)
    return null
  }

  if (!product) {
    console.error('Product not found or not approved:', id)
    return null
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
    } : null
  }
}

type PageProps = {
  params: Promise<{ id: string }> | { id: string }
}

export default async function ProductPage(props: PageProps) {
  const { id } = await props.params;
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <ImageGallery 
          images={product.image_urls || []} 
          productName={product.name}
          videoUrl={product.video_url}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <ProductHeader 
            name={product.name}
            price={product.price}
            categories={product.categories}
          />

          <ProductDescription description={product.description} />

          <ProductFAQ faq={product.faq} />

          <Card className="p-6">
            <PurchaseButton productId={product.id} price={product.price} />
          </Card>

          <ProductSupport 
            productId={product.id}
            productName={product.name}
            sellerEmail={product.seller?.email || null}
          />

          <RefundPolicy />
        </div>
      </div>
    </main>
  )
} 