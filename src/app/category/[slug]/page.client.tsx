'use client';

import { useEffect } from 'react';
import ProductList from '@/components/root/ProductList';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  image_urls: string[] | null;
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
  useEffect(() => {
    console.log('CategoryPageContent received title:', title);
    console.log('CategoryPageContent received products:', products);
    console.log('CategoryPageContent received products length:', products.length);
    if (products.length > 0) {
      products.forEach(product => {
        console.log(`CategoryPageContent product ${product.id} has categories:`, product.categories);
      });
    }
  }, [title, products]);

  return (
    <div className="flex-1 p-4">
      {/* Product Grid */}
      <div className="py-4">
        <ProductList products={products} />
      </div>
    </div>
  );
} 