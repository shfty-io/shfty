'use client';

import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductHero } from '@/components/product/ProductHero';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductNavbar } from '@/components/product/ProductNavbar';
import { Database } from '@/types/supabase';

// Use the same Product type as ProductHero
type Product = Database['public']['Tables']['products']['Row'] & {
  demo_url?: string | null;
  seller?: {
    full_name: string | null;
    avatar_url: string | null;
    email?: string | null;
  } | null;
  likes_count: number;
  updated_at: string | null;
  github_repo_url?: string | null;
  codebase_url?: string | null;
  hasPurchased: boolean;
  categories?: string[];
  technologies?: string[] | null;
  software_license?: string | null;
};

interface ProductPageContentProps {
  product: Product;
}

export function ProductPageContent({ 
  product 
}: ProductPageContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <ProductNavbar />
      <main>
        <div className="space-y-8">
          <ProductHero product={product} hasPurchased={product.hasPurchased} />
          <ImageGallery 
            images={product.image_urls || []} 
            productName={product.name}
          />
          <div className="mx-auto max-w-[1440px] px-5">
            <ProductDetails
              productId={product.id}
              productName={product.name}
              categories={product.categories || []}
              technologies={product.technologies || []}
              description={product.description}
              faq={Array.isArray(product.faq) 
                ? product.faq as Array<{ question: string; answer: string }>
                : null}
              sellerEmail={product.seller?.email || null}
              sellerFullName={product.seller?.full_name || null}
              softwareLicense={product.software_license || null}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 