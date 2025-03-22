import ProductList from '@/components/root/ProductList'
import { MessageDisplay } from '@/components/global/MessageDisplay'
import { Database } from '@/types/supabase'
import { HomeHero } from '@/components/ui/HomeHero'
import { Navbar } from '@/components/global/Navbar'

// Use the same ProductStatus type from the database schema
type ProductStatus = Database['public']['Enums']['product_status']

interface Product {
  id: string
  name: string
  description: string
  price: number
  categories: string[]
  image_urls: string[] | null
  image_positions?: Record<string, { x: number; y: number }> | null
  short_description: string
  byline: string
  created_at: string
  view_count: number
  purchase_count: number
  trending_score: number
  likes_count: number
  github_repo_url: string | null
  github_token: string | null
  status?: ProductStatus | null
  user: {
    avatar_url: string | null
    full_name: string | null
  }
}

// Pagination interface
export interface PaginationMetadata {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

// Define the type for sort options to match the ProductList component
type SortOption = 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest';

// Fetch products with pagination using the API endpoint
async function getProducts(
  page: number = 1, 
  search: string = '', 
  sortBy: SortOption = 'downloaded'
): Promise<{
  products: Product[],
  pagination: PaginationMetadata
}> {
  try {
    // Construct API URL with query parameters
    const apiUrl = new URL('/api/products', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    apiUrl.searchParams.append('page', page.toString());
    apiUrl.searchParams.append('pageSize', '20');
    
    if (search) {
      apiUrl.searchParams.append('search', search);
    }
    
    if (sortBy) {
      apiUrl.searchParams.append('sortBy', sortBy);
    }
    
    // Fetch products from API
    const response = await fetch(apiUrl.toString(), { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format data to match expected interface
    return {
      products: data.products || [],
      pagination: {
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
        itemsPerPage: 20
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty results on error
    return { 
      products: [], 
      pagination: { 
        currentPage: 1, 
        totalPages: 0, 
        totalItems: 0, 
        itemsPerPage: 20 
      } 
    }
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Wait for searchParams to resolve
  const resolvedParams = searchParams ? await searchParams : {};
  const message = resolvedParams.message as string | undefined;
  
  // Get the page from the query parameters, default to page 1
  const pageParam = resolvedParams.page as string | undefined;
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  
  // Get search and sorting parameters
  const search = resolvedParams.search as string || '';
  const sortByParam = resolvedParams.sortBy as string || 'downloaded';
  
  // Define the type for sort options to match the ProductList component
  type SortOption = 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest';
  
  // Validate that sortBy is a valid option, default to 'downloaded' if not
  const isValidSortOption = (option: string): option is SortOption => {
    return ['downloaded', 'liked', 'newest', 'price_high', 'price_low', 'oldest'].includes(option);
  };
  
  const sortBy: SortOption = isValidSortOption(sortByParam) ? sortByParam : 'downloaded';

  const { products, pagination } = await getProducts(page, search, sortBy);
  
  return (
    <>
      <Navbar />
      <div className="py-6">
        <HomeHero />
        {message && <MessageDisplay message={message} />}
        <ProductList 
          products={products} 
          pagination={pagination} 
          currentPage={page}
          initialSearch={search}
          initialSortBy={sortBy}
        />
      </div>
    </>
  )
}
