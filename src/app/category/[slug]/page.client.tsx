'use client';

import { useEffect } from 'react';
import ProductList from '@/components/root/ProductList';
import { ProductCard } from '@/components/product/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  image_urls: string[] | null;
  image_positions?: Record<string, { x: number; y: number }> | null;
  short_description: string;
  byline: string;
  created_at: string;
  view_count: number;
  purchase_count: number;
  trending_score: number;
  likes_count: number;
  github_repo_url: string | null;
  github_token: string | null;
  user: {
    avatar_url: string | null;
    full_name: string | null;
  };
}

interface CategoryPageContentProps {
  title: string;
  description: string;
  products: Product[];
}

export function CategoryPageContent({ 
  title, 
  products 
}: CategoryPageContentProps) {
  // Create default pagination metadata for category pages
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: products.length,
    itemsPerPage: products.length
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No products found</h2>
          <p className="text-muted-foreground">
            There are no products in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={{
              id: product.id,
              byline: product.byline,
              title: product.name,
              description: product.description,
              price: product.price,
              images: product.image_urls || [],
              image_positions: product.image_positions || undefined,
              view_count: product.view_count,
              likes_count: product.likes_count,
              user: {
                avatar_url: product.user.avatar_url || '',
                full_name: product.user.full_name || ''
              }
            }} />
          ))}
        </div>
      )}
    </div>
  );
} 