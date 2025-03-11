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
      'weather': 'weather',
      'other': 'other'
    };
    
    // Get the database enum value for the category
    const dbCategory = categoryMapping[category] || category;
    
    console.log(`Searching for products with category: ${dbCategory}`);
    
    // Check if we're dealing with a category that might not exist in the database
    const potentiallyInvalidCategories = ['weather']; // Add any other categories that might not exist in DB
    
    if (potentiallyInvalidCategories.includes(dbCategory)) {
      console.log(`Category ${dbCategory} might not exist in the database schema. Returning empty results.`);
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

    console.log(`Found ${products?.length || 0} products for category ${dbCategory}`);
    
    if (products && products.length > 0) {
      console.log('First product data:', JSON.stringify(products[0], null, 2));
      products.forEach(product => {
        console.log(`Product ${product.id} has categories: ${JSON.stringify(product.categories)}`);
      });
    } else {
      console.log('No products found for this category');
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
        user: userData
      };
      
      console.log('Transformed product:', transformedProduct);
      return transformedProduct;
    }) as Product[];
    
    console.log(`Final transformed products: ${transformedProducts.length}`);
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
  
  console.log(`CategoryPage: Found ${products.length} products for ${normalizedSlug}`);
  if (products.length > 0) {
    console.log('CategoryPage: Product IDs:', products.map(p => p.id));
  }

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