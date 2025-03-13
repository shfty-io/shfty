import ProductList from '@/components/root/ProductList'
import { Navbar } from '@/components/global/Navbar'
import { createServiceClient } from '@/lib/server'
import { AppSidebar } from "@/components/root/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MessageDisplay } from '@/components/global/MessageDisplay'
import { Database } from '@/types/supabase'

// Use the same ProductStatus type from the database schema
type ProductStatus = Database['public']['Enums']['product_status']

interface Product {
  id: string
  name: string
  description: string
  price: number
  categories: string[]
  image_urls: string[] | null
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

// Fetch products with pagination
async function getProducts(
  page: number = 1, 
  search: string = '', 
  sortBy: SortOption = 'downloaded'
): Promise<{
  products: Product[],
  pagination: PaginationMetadata
}> {
  try {
    // Use createServiceClient which doesn't rely on cookies
    const supabase = createServiceClient()
    
    if (!supabase) {
      console.error('Error fetching products: Supabase client is not initialized')
      return { 
        products: [], 
        pagination: { 
          currentPage: 1, 
          totalPages: 0, 
          totalItems: 0, 
          itemsPerPage: 21 
        } 
      }
    }
    
    console.log('Fetching products for page', page, 'with search:', search, 'and sort:', sortBy)
    
    const PAGE_SIZE = 21;
    const offset = (page - 1) * PAGE_SIZE;
    
    // First get the total count for pagination
    let countQuery = supabase
      .from('products')
      .select('id', { count: 'exact' });
      
    // Add search filter if provided
    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }
    
    const { count, error: countError } = await countQuery;
      
    if (countError) {
      console.error('Error counting products:', countError);
      return {
        products: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: PAGE_SIZE
        }
      };
    }
    
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    
    // Then fetch the actual products for the current page
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        image_urls,
        short_description,
        byline,
        created_at,
        view_count,
        purchase_count,
        trending_score,
        likes_count,
        github_repo_url,
        github_token,
        status,
        user:profiles!products_user_id_fkey (
          avatar_url,
          full_name
        )
      `);
      
    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sortBy === 'price_high') {
      query = query.order('price', { ascending: false });
    } else if (sortBy === 'price_low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'liked') {
      query = query.order('likes_count', { ascending: false });
    } else if (sortBy === 'downloaded') {
      query = query.order('purchase_count', { ascending: false });
    } else {
      // Default sorting by created_at desc
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(offset, offset + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error)
      return { 
        products: [], 
        pagination: { 
          currentPage: page, 
          totalPages, 
          totalItems, 
          itemsPerPage: PAGE_SIZE 
        } 
      }
    }

    // Log response for debugging
    console.log('Products fetched successfully:', data ? data.length : 0)
    
    // If no products are found, return an empty array
    if (!data || data.length === 0) {
      console.log('No products found for this page')
      return { 
        products: [], 
        pagination: { 
          currentPage: page, 
          totalPages, 
          totalItems, 
          itemsPerPage: PAGE_SIZE 
        } 
      }
    }

    // Transform data to match Product interface
    const transformedProducts = data.map(item => {
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
      
      // Ensure status is properly typed as ProductStatus
      const status = item.status as ProductStatus | null;
      
      // Create the transformed product
      const transformedProduct = {
        ...item,
        // Add empty categories array since it's in the Product interface but not in the DB query result
        categories: [],
        status,
        user: userData
      };
      
      return transformedProduct;
    }) as Product[];
    
    return { 
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: PAGE_SIZE
      }
    };
  } catch (err) {
    // Catch any unexpected errors
    console.error('Unexpected error fetching products:', err)
    return { 
      products: [], 
      pagination: { 
        currentPage: 1, 
        totalPages: 0, 
        totalItems: 0, 
        itemsPerPage: 21 
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
  
  // Log products
  console.log('Home component products:', products.length);
  console.log('Page info:', pagination);
  
  if (products.length > 0) {
    console.log('First product in Home component:', products[0].id);
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full">
        <AppSidebar />
        <SidebarInset className="w-full">
          <Navbar />
          <div className="flex-1 p-4">
            {message && <MessageDisplay message={message} />}
            <ProductList 
              products={products} 
              pagination={pagination} 
              currentPage={page}
              initialSearch={search}
              initialSortBy={sortBy}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
