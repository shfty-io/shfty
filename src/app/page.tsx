import ProductList from '@/components/root/ProductList'
import ProductFilters from '@/components/root/ProductFilters'
import { Navbar } from '@/components/global/Navbar'
import { createClient } from '@/lib/server'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

async function getProducts() {
  const supabase = createClient()
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
      trending_score
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return products || []
}

export default async function Home() {
  const products = await getProducts()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main>
          <Navbar />
          <div className="flex-1">
            <ProductList products={products} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
