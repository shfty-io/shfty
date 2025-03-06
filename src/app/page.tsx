import ProductList from '@/components/root/ProductList'
import { Navbar } from '@/components/global/Navbar'
import { createServiceClient } from '@/lib/server'
import { AppSidebar } from "@/components/root/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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
    
    // If no products are found, return an empty array without error
    if (!data || data.length === 0) {
      console.log('No products found in the database')
      return []
    }

    // Transform data to match Product interface
    return data.map(item => ({
      ...item,
      // Add empty categories array since it's in the Product interface but not in the DB query result
      categories: [],
      user: Array.isArray(item.user) && item.user.length > 0 
        ? { 
            avatar_url: item.user[0]?.avatar_url || null,
            full_name: item.user[0]?.full_name || null
          }
        : { avatar_url: null, full_name: null }
    })) as Product[]
  } catch (err) {
    // Catch any unexpected errors
    console.error('Unexpected error fetching products:', err)
    return []
  }
}

export default async function Home() {
  try {
    console.log('Home component rendering...')
    // Not using cache for now since it causes issues with cookies in Next.js 15
    const products = await getProducts()
    console.log('Products loaded:', products.length)
    
    return (
      <>
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full">
            <AppSidebar />
            <SidebarInset className="w-full">
              <Navbar />
              <div className="flex-1 p-4">
                <ProductList products={products} />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </>
    )
  } catch (err) {
    console.error('Error in Home component:', err)
    return <div>Error loading page. Please try again later.</div>
  }
}
