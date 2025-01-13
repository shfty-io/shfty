'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_urls: string[] | null
}

interface ProductListProps {
  products: Product[]
  category?: string
}

export default function ProductList({ products, category }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
        <p className="text-gray-500">Be the first to sell something amazing!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`}>
          <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
              {product.image_urls?.[0] ? (
                <Image
                  src={product.image_urls[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">${product.price}</span>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 