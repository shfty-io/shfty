'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import ProductFilters from './ProductFilters'

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
  created_at: string
  view_count: number
  purchase_count: number
  trending_score: number
}

type SortOption = 'recent' | 'popular' | 'trending';

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const [filters, setFilters] = useState<{
    sortBy: SortOption;
    priceRange: string;
  }>({
    sortBy: 'recent',
    priceRange: 'all',
  });

  // Sort products based on selected filter
  const sortedProducts = [...products].sort((a, b) => {
    switch (filters.sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'popular':
        return b.view_count - a.view_count;
      case 'trending':
        return b.trending_score - a.trending_score;
      default:
        return 0;
    }
  });

  // Filter products based on price range
  const filteredProducts = sortedProducts.filter(product => {
    if (filters.priceRange === 'all') return true;

    const [min, max] = filters.priceRange.split('-').map(Number);
    if (filters.priceRange === '100+') {
      return product.price >= 100;
    }
    return product.price >= min && product.price <= max;
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
        <p className="text-gray-500">Be the first to sell something amazing!</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <ProductFilters 
        onFilterChange={setFilters}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
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
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products match your selected filters.</p>
        </div>
      )}
    </div>
  )
} 