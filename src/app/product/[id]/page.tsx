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
import { LikeButton } from '@/components/product/LikeButton'
import { ProductNavbar } from '@/components/product/ProductNavbar'
import { incrementViewCount } from '@/app/actions'

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

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Await the params before using them
  const { id } = await Promise.resolve(params)
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  // Increment view count in the background
  await incrementViewCount(id).catch(console.error)

  return (
    <div className="min-h-screen bg-background">
      <ProductNavbar />
      <main className="container mx-auto px-4 py-8">
        {/* Top section with gallery and product info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ImageGallery 
            images={product.image_urls || []} 
            productName={product.name}
          />
          <div className="flex flex-col h-full">
            <div className="space-y-8 flex-1">
              <div className="flex items-start justify-between">
                <ProductHeader 
                  name={product.name}
                  price={product.price}
                />
                <div className="ml-4">
                  <LikeButton 
                    productId={product.id}
                    initialLikes={product.likes_count}
                  />
                </div>
              </div>
              <ProductDescription description={product.description} />
            </div>
            <div className="mt-8">
              <PurchaseButton 
                productId={product.id}
                price={product.price}
              />
            </div>
          </div>
        </div>

        {/* Features and Support section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features section - spans 2 columns */}
          <div className="lg:col-span-2">
            <ProductFAQ faq={product.faq || []} />
          </div>

          {/* Support section - spans 1 column */}
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories?.map((category: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <ProductSupport 
                productId={product.id}
                productName={product.name}
                sellerEmail={product.seller?.email || null}
              />
            </div>
            
            <div>
              <RefundPolicy />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 