import { Navbar } from '@/components/global/Navbar'
import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { PurchaseButton } from '@/components/product/PurchaseButton'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Mail, Flag } from 'lucide-react'

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
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.image_urls?.[0] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.image_urls.slice(1).map((url: string, i: number) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={url}
                      alt={`${product.name} ${i + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`}
              </p>
              {/* Categories */}
              {product.category && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <h2 className="text-lg font-semibold">Description</h2>
              <div 
                className="mt-2 text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />
            </div>

            {product.faq && (
              <div className="prose max-w-none">
                <h2 className="text-lg font-semibold">FAQ</h2>
                <div 
                  className="mt-2 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.faq }}
                />
              </div>
            )}

            <Card className="p-6">
              <PurchaseButton productId={product.id} price={product.price} />
            </Card>

            {/* Support Section */}
            <div className="border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold">Support</h2>
              
              {/* Contact Seller */}
              {product.seller?.email && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <a href={`mailto:${product.seller.email}`} className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Seller
                    </a>
                  </Button>
                </div>
              )}
              
              {/* Report Button */}
              <div className="flex items-center gap-2">
                <Button variant="outline" className="text-red-600 hover:text-red-700" asChild>
                  <a href={`mailto:support@yourplatform.com?subject=Report Product: ${product.name}&body=Product ID: ${product.id}`} className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Report this product
                  </a>
                </Button>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">Refund Policy</h2>
              <p className="text-sm text-gray-600">
                All products are purchased directly from their respective creators. 
                Please review the seller&apos;s refund policy before making any purchase. 
                For any refund requests, please contact the seller directly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 