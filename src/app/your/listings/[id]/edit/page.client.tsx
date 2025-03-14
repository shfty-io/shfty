'use client';

import { ProductEditForm } from '@/components/seller/ProductEditForm';
import type { ProductFormData } from '@/components/seller/ProductEditForm';

// Define a proper type for FAQ items
interface FaqItem {
  question: string;
  answer: string;
}

interface Product {
  id: string;
  name: string;
  byline: string;
  short_description: string;
  description: string | null;
  price: number;
  categories: string[] | null;
  faq: FaqItem[] | null;
  technologies: string[] | null;
  image_urls: string[] | null;
  image_positions?: Record<string, { x: number; y: number }> | null;
  software_license: string | null;
  github_repo_url?: string | null;
  has_readme?: boolean;
  has_database_migrations?: boolean;
  video_url?: string | null;
  demo_url?: string | null;
}

interface EditPageContentProps {
  product: Product;
  onSubmit: (formData: ProductFormData) => Promise<{ success?: boolean; error?: string }>;
}

export function EditPageContent({ product, onSubmit }: EditPageContentProps) {
  // Add debugging to see what's coming from the database
  console.log("Product from database:", product);
  console.log("Demo URL from database:", product.demo_url);
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product - {product.name}</h1>
      <ProductEditForm
        onSubmit={onSubmit}
        initialData={{
          name: product.name,
          shortDescription: product.short_description,
          description: product.description || '',
          price: product.price,
          categories: product.categories || [],
          faq: product.faq || [],
          technologies: product.technologies || [],
          imageUrls: product.image_urls || [],
          imagePositions: product.image_positions || {},
          softwareLicense: product.software_license || '',
          videoUrl: product.video_url || null,
          demoUrl: product.demo_url || null
        }}
      />
    </div>
  );
} 