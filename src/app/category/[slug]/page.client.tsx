'use client';

import ProductList from '@/components/root/ProductList';

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

export function CategoryPageContent({ title, description, products }: CategoryPageContentProps) {
  // Create default pagination metadata for category pages
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: products.length,
    itemsPerPage: products.length
  };

  return (
    <div className="flex-1 p-4">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      
      {/* Product Grid */}
      <div className="py-4">
        <ProductList 
          products={products} 
          pagination={pagination}
          currentPage={1}
          initialSearch=""
          initialSortBy="newest"
        />
      </div>
    </div>
  );
} 