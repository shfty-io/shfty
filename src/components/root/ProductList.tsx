'use client'

import { useState, useEffect } from 'react'
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
  github_repo_url?: string | null
  github_token?: string | null
  user: {
    avatar_url: string | null
    full_name: string | null
  }
}

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  // These state variables are used in the ProductFilters component
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    sortBy: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest';
  }>({
    sortBy: 'downloaded'
  });

  // Log products for debugging
  console.log('ProductList received products:', products);
  console.log('ProductList received products length:', products.length);
  
  // For debugging - log current filter state
  useEffect(() => {
    console.log('Current filters:', filters);
    console.log('Current search query:', searchQuery);
  }, [filters, searchQuery]);

  // SIMPLIFIED: Just display all products without filtering or sorting
  if (products.length === 0) {
    return (
      <div>
        <div>
          <div className="px-6">
            <ProductFilters 
              onFilterChange={setFilters}
              onSearch={setSearchQuery}
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

  return (
    <div>
      <div className="">
        <div className="px-6">
          <ProductFilters 
            onFilterChange={setFilters}
            onSearch={setSearchQuery}
          />
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => {
            // Log each product being mapped
            console.log('Mapping product to card:', product);
            
            // Create the product card props
            const productCardProps = {
              id: product.id,
              title: product.name,
              description: product.short_description || stripHtml(product.description),
              price: product.price,
              images: product.image_urls || [],
              view_count: product.view_count,
              likes_count: product.likes_count,
              byline: product.byline,
              user: {
                avatar_url: product.user?.avatar_url || '/placeholder-avatar.jpg',
                full_name: product.user?.full_name || 'Anonymous'
              }
            };
            
            // Log the props being passed to ProductCard
            console.log('ProductCard props:', productCardProps);
            
            return (
              <ProductCard
                key={product.id}
                product={productCardProps}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
} 