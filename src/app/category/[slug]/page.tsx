import ProductList from '@/components/root/ProductList';
import { categoryMetadata } from '@/types/categories';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { Database } from '@/types/supabase';
import { ProductNavbar } from '@/components/product/ProductNavbar';

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

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      categories,
      image_urls,
      short_description,
      byline,
      status,
      created_at,
      view_count,
      purchase_count,
      trending_score,
      likes_count,
      user:users!inner(avatar_url, full_name)
    `)
    .eq('status', 'approved')
    .filter('categories', 'cs', `{${category}}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Transform the user array into a single object
  const transformedProducts = products?.map(product => ({
    ...product,
    user: product.user[0]
  })) || [];

  return transformedProducts as Product[];
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Ensure params is resolved before accessing
  const { slug } = await Promise.resolve(params);
  const normalizedSlug = slug.toLowerCase();
  const metadata = categoryMetadata[normalizedSlug];
  
  if (!metadata) {
    notFound();
  }

  const products = await getProductsByCategory(normalizedSlug);

  return (
    <>
      <ProductNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-4">
          <nav className="flex text-sm text-gray-500">
            <a href="/" className="hover:text-gray-900">Marketplace</a>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{metadata.title}</span>
          </nav>
        </div>

        {/* Category Header */}
        <div className="py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{metadata.title}</h1>
          <p className="text-xl text-gray-600">{metadata.description}</p>
        </div>
        
        {/* Product Grid */}
        <div className="py-8">
          <ProductList products={products} />
        </div>
      </div>
    </>
  );
} 