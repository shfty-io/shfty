import { Navbar } from '@/components/global/Navbar';
import { categoryMetadata } from '@/types/categories';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { CategoryPageContent } from './page.client';

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

// Use a type alias for the params
type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createClient();
  
  // Convert hyphens to underscores for database query
  const dbCategory = category.replace(/-/g, '_');
  
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
      user:profiles!inner(avatar_url, full_name)
    `)
    .eq('status', 'approved')
    .filter('categories', 'cs', `{${dbCategory}}`)
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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  
  const normalizedSlug = slug.toLowerCase();
  const metadata = categoryMetadata[normalizedSlug];
  
  if (!metadata) {
    notFound();
  }

  const products = await getProductsByCategory(normalizedSlug);

  return (
    <>
      <Navbar />
      <CategoryPageContent 
        title={metadata.title}
        description={metadata.description}
        products={products}
      />
    </>
  );
} 