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
  likes_count: number
  user: {
    avatar_url: string | null
    full_name: string | null
  }
}

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    tab: 'all' | 'latest' | 'popular';
    sortBy: 'downloaded' | 'liked' | 'newest';
  }>({
    tab: 'all',
    sortBy: 'downloaded'
  });

  // Filter and sort products based on selected filters and search query
  const filteredAndSortedProducts = [...products]
    .filter(product => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.short_description?.toLowerCase().includes(searchLower) ||
          product.categories.some(cat => cat.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => {
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
    })
    .filter(product => {
      switch (filters.tab) {
        case 'latest':
          // Show products from the last 30 days instead of 7
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(product.created_at) >= thirtyDaysAgo;
        case 'popular':
          // Don't filter, just show all products sorted by popularity
          return true;
        case 'all':
        default:
          return true;
      }
    });

  if (products.length === 0) {
    return (
      <div>
        <div className="pt-6">
          <div className="px-6">
            <ProductFilters 
              onFilterChange={setFilters}
              onSearch={setSearchQuery}
              counts={{ all: 0, latest: 0, popular: 0 }}
            />
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
            <p className="text-gray-500">Be the first to sell something amazing!</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate counts for each tab
  const counts = {
    all: products.length,
    latest: products.filter(p => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(p.created_at) >= thirtyDaysAgo;
    }).length,
    popular: products.length, // All products are shown in popular tab
  };

  return (
    <div>
      <div className="pt-6">
        <div className="px-6">
          <ProductFilters 
            onFilterChange={setFilters}
            onSearch={setSearchQuery}
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
                images: product.image_urls || [],
                view_count: product.view_count,
                likes_count: product.likes_count,
                user: {
                  avatar_url: product.user?.avatar_url || '/placeholder-avatar.jpg',
                  full_name: product.user?.full_name || 'Anonymous'
                }
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