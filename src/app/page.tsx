import Hero from '@/components/root/Hero'
import ProductList from '@/components/root/ProductList'
import { Navbar } from '@/components/global/Navbar'
import { createClient } from '@/lib/server'

async function getProducts() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, price, category, image_urls')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)

  return products || []
}

export default async function Home() {
  const products = await getProducts()

  return (
    <>
      <Navbar />
      <div className="flex flex-col gap-12">
        <Hero />
        <div className="container px-4 sm:px-6 lg:px-8">
          <ProductList products={products} />
        </div>
      </div>
    </>
  )
}
