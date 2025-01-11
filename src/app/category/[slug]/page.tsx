import ProductList from '@/components/root/ProductList';
import { categoryMetadata } from '@/types/categories';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { Database } from '@/types/supabase';
import { Navbar } from '@/components/global/Navbar';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

async function getProductsByCategory(category: string) {
  const supabase = createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = params.slug.toLowerCase();
  const metadata = categoryMetadata[slug];
  
  if (!metadata) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-4">
          <nav className="flex text-sm text-gray-500">
            <a href="/" className="hover:text-gray-900">Marketplace</a>
            <span className="mx-2">›</span>
            <a href="/templates" className="hover:text-gray-900">Templates</a>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{metadata.title}</span>
          </nav>
        </div>

        {/* Category Header */}
        <div className="py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{metadata.title}</h1>
          <p className="text-xl text-gray-600">{metadata.description}</p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex gap-4">
            <button className="text-sm font-medium text-gray-900">Trending</button>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Paid + Free</button>
          </div>
          <div className="text-sm text-gray-500">
            {products.length} Templates
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="py-8">
          <ProductList products={products} category={slug} />
        </div>
      </div>
    </>
  );
} 