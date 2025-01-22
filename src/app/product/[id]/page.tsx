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
      <main className="container mx-auto px-4 py-8">
        {/* Top section with gallery and product info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ImageGallery 
            images={product.image_urls || []} 
            productName={product.name}
          />
          <div className="space-y-8">
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
            <PurchaseButton 
              productId={product.id}
              price={product.price}
            />
          </div>
        </div>

        {/* Features and Support section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features section - spans 2 columns */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Features</h2>
              <ProductFAQ faq={product.faq || []} />
            </Card>
          </div>

          {/* Support section - spans 1 column */}
          <div className="space-y-6">
            {/* Categories */}
            <Card className="p-6">
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
            </Card>

            <Card className="p-6">
              <ProductSupport 
                productId={product.id}
                productName={product.name}
                sellerEmail={product.seller?.email || null}
              />
            </Card>
            
            <Card className="p-6">
              <RefundPolicy />
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Report Template</h3>
                <p className="text-sm text-muted-foreground">
                  If you believe this template violates our terms of service, please report it.
                </p>
                <button className="text-sm text-red-600 hover:text-red-700">
                  Report this template
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 