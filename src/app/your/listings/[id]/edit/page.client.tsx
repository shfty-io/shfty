'use client';

import { ProductForm, ProductFormData } from '@/components/seller/ProductForm';

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
  software_license: string | null;
}

interface EditPageContentProps {
  product: Product;
  onSubmit: (formData: ProductFormData) => Promise<{ success?: boolean; error?: string }>;
}

export function EditPageContent({ product, onSubmit }: EditPageContentProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product - {product.name}</h1>
      <ProductForm
        onSubmit={onSubmit}
        initialData={{
          name: product.name,
          byline: product.byline,
          shortDescription: product.short_description,
          description: product.description || '',
          price: product.price,
          categories: product.categories || [],
          faq: product.faq || [],
          technologies: product.technologies || [],
          imageUrls: product.image_urls || [],
          softwareLicense: product.software_license || ''
        }}
      />
    </div>
  );
} 