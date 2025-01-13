import { Navbar } from '@/components/global/Navbar'
import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { PurchaseButton } from '@/components/product/PurchaseButton'
import { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']

async function getProduct(id: string) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  return product
}

export default async function ProductPage({
  params: { id },
}: {
  params: { id: string }
}) {
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
            </div>

            <div className="prose max-w-none">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {product.faq && (
              <div className="prose max-w-none">
                <h2 className="text-lg font-semibold">FAQ</h2>
                <p className="mt-2 text-gray-600">{product.faq}</p>
              </div>
            )}

            <Card className="p-6">
              <PurchaseButton productId={product.id} price={product.price} />
            </Card>
          </div>
        </div>
      </main>
    </>
  )
} 