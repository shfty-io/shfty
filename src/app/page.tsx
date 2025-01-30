import ProductList from '@/components/root/ProductList'
import { Navbar } from '@/components/global/Navbar'
import { createClient } from '@/lib/server'
import { AppSidebar } from "@/components/root/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Hero } from '@/components/ui/hero'

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
  const supabase = createClient()
  const { data, error } = await supabase
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
      profiles (
        avatar_url,
        full_name
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []).map(item => ({
    ...item,
    user: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
  })) as Product[]
}

export default async function Home() {
  const products = await getProducts()

  return (
    <>
      <Hero />
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
}
