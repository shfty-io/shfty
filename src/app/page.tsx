import ProductList from '@/components/root/ProductList'
import { Navbar } from '@/components/global/Navbar'
import { createServiceClient } from '@/lib/server'
import { AppSidebar } from "@/components/root/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MessageDisplay } from '@/components/global/MessageDisplay'

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
  user: {
    avatar_url: string | null
    full_name: string | null
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    // Use createServiceClient which doesn't rely on cookies
    const supabase = createServiceClient()
    
    if (!supabase) {
      console.error('Error fetching products: Supabase client is not initialized')
      return []
    }
    
    console.log('Fetching products with service client...')
    
    // Debug: Log the structure of the products table
    const { error: tableError } = await supabase
      .from('products')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('Error accessing products table:', tableError)
    }
    
    const { data, error } = await supabase
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
        user:profiles!products_user_id_fkey (
          avatar_url,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    // Log response for debugging
    console.log('Products fetched successfully:', data ? data.length : 0)
    
    // Add detailed logging of the first product
    if (data && data.length > 0) {
      console.log('First product data:', JSON.stringify(data[0], null, 2))
    }
    
    // If no products are found, return an empty array without error
    if (!data || data.length === 0) {
      console.log('No products found in the database')
      return []
    }

    // TEMPORARILY DISABLED: Filter out products that have GitHub repo URL but no valid GitHub token
    // Instead, keep all products regardless of GitHub token status
    const filteredProducts = data;
    
    // Log the number of products after filtering
    console.log('Products after filtering:', filteredProducts.length);

    // Transform data to match Product interface
    const transformedProducts = filteredProducts.map(item => {
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
      
      // Log the transformed product
      const transformedProduct = {
        ...item,
        // Add empty categories array since it's in the Product interface but not in the DB query result
        categories: [],
        user: userData
      };
      
      // Ensure all required fields are present
      const requiredFields = ['id', 'name', 'description', 'price', 'image_urls', 'short_description', 'byline', 'created_at', 'view_count', 'purchase_count', 'trending_score', 'likes_count'];
      const missingFields = requiredFields.filter(field => {
        return (transformedProduct as Partial<Product>)[field as keyof Product] === undefined;
      });
      
      if (missingFields.length > 0) {
        console.error('Product is missing required fields:', missingFields);
        console.error('Product data:', transformedProduct);
      }
      
      console.log('Transformed product:', transformedProduct);
      
      return transformedProduct;
    }) as Product[]
    
    // Log the final products array
    console.log('Final products array length:', transformedProducts.map(item => item).length);
    
    return transformedProducts;
  } catch (err) {
    // Catch any unexpected errors
    console.error('Unexpected error fetching products:', err)
    return []
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

  const products = await getProducts();
  
  // Log products before passing to ProductList
  console.log('Home component products:', products.length);
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
            <h1 className="text-3xl font-bold mb-2">Popular Products</h1>
            <p className="text-muted-foreground mb-8">
              Find top-rated tools, templates, and resources
            </p>
            <ProductList products={products} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
