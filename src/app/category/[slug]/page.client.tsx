'use client';

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
  description, 
  products 
}: CategoryPageContentProps) {
  return (
    <div className="flex-1 p-4">
      {/* Category Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600">{description}</p>
      </div>
      
      {/* Product Grid */}
      <div className="py-8">
        <ProductList products={products} />
      </div>
    </div>
  );
} 