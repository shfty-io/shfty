import { categoryMetadata } from '@/types/categories';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@/lib/server';
import { CategoryPageContent } from './page.client';
import { Navbar } from '@/components/global/Navbar';

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

// Use a type alias for the params
type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = await createServerComponentClient();
  
  try {
    // Map from URL slug to database enum value
    // This mapping should match your database enum values
    const categoryMapping: Record<string, string> = {
      'business': 'business',
      'entertainment': 'entertainment',
      'developer-tools': 'developer_tools',
      'finance': 'finance',
      'education': 'education',
      'games': 'games',
      'graphics-design': 'graphics_design',
      'health-fitness': 'health_fitness',
      'lifestyle': 'lifestyle',
      'medical': 'medical',
      'news': 'news',
      'photo-video': 'photo_video',
      'productivity': 'productivity',
      'social-networking': 'social_networking',
      'sports': 'sports',
      'travel': 'travel',
      'utilities': 'utilities',
      'frontend-templates': 'frontend_templates',
      'weather': 'weather',
      'other': 'other'
    };
    
    // Get the database enum value for the category
    const dbCategory = categoryMapping[category] || category;
    
    // Check if we're dealing with a category that might not exist in the database
    const potentiallyInvalidCategories = ['weather']; // Add any other categories that might not exist in DB
    
    if (potentiallyInvalidCategories.includes(dbCategory)) {
      return [];
    }
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        categories,
        image_urls,
        image_positions,
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
        user:profiles!products_user_id_fkey(avatar_url, full_name)
      `)
      .eq('status', 'approved')
      .contains('categories', [dbCategory])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    if (products && products.length > 0) {
      // Continue processing
    } else {
      return [];
    }

    // Transform data to match Product interface
    const transformedProducts = products.map(item => {
      // Handle user data with proper type checking
      let userData = { avatar_url: null as string | null, full_name: null as string | null };
      
      if (item.user) {
        if (Array.isArray(item.user) && item.user.length > 0) {
          userData = {
            avatar_url: item.user[0]?.avatar_url || null,
            full_name: item.user[0]?.full_name || null
          };
        } else if (typeof item.user === 'object') {
          // Use type assertion to handle the object case
          const userObj = item.user as { avatar_url?: string | null; full_name?: string | null };
          userData = {
            avatar_url: userObj.avatar_url || null,
            full_name: userObj.full_name || null
          };
        }
      }
      
      // Create the transformed product
      const transformedProduct = {
        ...item,
        user: userData,
        image_url: item.image_urls?.[0] || null,
      };
      
      return transformedProduct;
    }) as Product[];
    
    return transformedProducts;
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    return [];
  }
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
      <div className="py-6">
        <CategoryPageContent 
          title={metadata.title}
          description={metadata.description}
          products={products}
        />
      </div>
    </>
  );
} 