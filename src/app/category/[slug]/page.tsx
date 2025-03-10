import { Navbar } from '@/components/global/Navbar';
import { categoryMetadata } from '@/types/categories';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/lib/server';
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
  github_repo_url: string | null;
  github_token: string | null;
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
  const supabase = await createServerComponentClient();
  
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
      github_repo_url,
      github_token,
      user:profiles!inner(avatar_url, full_name)
    `)
    .eq('status', 'approved')
    .filter('categories', 'cs', `{${dbCategory}}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Filter out products that have GitHub repo URL but no valid GitHub token
  const filteredProducts = products?.filter(product => {
    // If product has a GitHub repo URL, it must also have a GitHub token
    if (product.github_repo_url) {
      return !!product.github_token;
    }
    // Keep products without GitHub repo URLs (they might use direct download)
    return true;
  }) || [];

  // Transform the user array into a single object
  const transformedProducts = filteredProducts.map(product => ({
    ...product,
    user: product.user[0]
  }));

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