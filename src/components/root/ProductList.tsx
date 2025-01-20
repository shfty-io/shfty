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

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const [filters, setFilters] = useState<{
    tab: 'all' | 'latest' | 'popular';
    sortBy: 'downloaded' | 'liked' | 'newest';
  }>({
    tab: 'all',
    sortBy: 'downloaded'
  });

  // Filter and sort products based on selected filters
  const filteredAndSortedProducts = [...products].sort((a, b) => {
    switch (filters.sortBy) {
      case 'downloaded':
        return b.purchase_count - a.purchase_count;
      case 'liked':
        return b.trending_score - a.trending_score;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  }).filter(product => {
    switch (filters.tab) {
      case 'latest':
        // Show products from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(product.created_at) >= sevenDaysAgo;
      case 'popular':
        // Show products with high purchase count or trending score
        return product.purchase_count > 10 || product.trending_score > 50;
      case 'all':
      default:
        return true;
    }
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
        <p className="text-gray-500">Be the first to sell something amazing!</p>
      </div>
    );
  }

  // Calculate counts for each tab
  const counts = {
    all: products.length,
    latest: products.filter(p => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(p.created_at) >= sevenDaysAgo;
    }).length,
    popular: products.filter(p => p.purchase_count > 10 || p.trending_score > 50).length,
  };

  return (
    <div>
      <div className="border-b">
        <div className="px-6 py-4">
          <ProductFilters 
            onFilterChange={setFilters}
            counts={counts}
          />
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
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
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products match your selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 