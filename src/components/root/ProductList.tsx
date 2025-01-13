'use client'

import { ProductCard } from '@/components/product/ProductCard'

function stripHtml(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  categories: string[]
  image_urls: string[] | null
  short_description: string
  byline: string
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
        <ProductCard
          key={product.id}
          product={{
            id: product.id,
            title: product.name,
            description: product.short_description || stripHtml(product.description),
            price: product.price,
            images: product.image_urls || []
          }}
        />
      ))}
    </div>
  )
} 