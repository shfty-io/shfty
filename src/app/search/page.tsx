import { createClient } from '@/lib/server'
import { ProductCard } from '@/components/product/ProductCard'
interface SearchPageProps {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q

  if (!query) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        <p>Please enter a search term to find products.</p>
      </div>
    )
  }

  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, price, images')
    .textSearch('title', query)
    .or(`description.ilike.%${query}%`)
    .limit(20)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{query}"
      </h1>
      
      {!products || products.length === 0 ? (
        <p>No products found for "{query}"</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
} 