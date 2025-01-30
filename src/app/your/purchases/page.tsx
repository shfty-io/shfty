import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, Github, Mail } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  github_repo_url: string | null
  downloadUrl?: string | null
  seller: {
    email: string | null
    full_name: string | null
  } | null
}

interface Purchase {
  id: string
  created_at: string
  user_id: string
  product: Product
}

async function getServerSideUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

async function getPurchases(userId: string): Promise<Purchase[]> {
  const supabase = createClient()
  const { data: purchases } = await supabase
    .from('purchases')
    .select(`
      *,
      product:products (
        id,
        name,
        description,
        price,
        github_repo_url,
        user_id,
        seller:profiles (
          email,
          full_name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return purchases || []
}

export default async function PurchasesPage() {
  const user = await getServerSideUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const purchases = await getPurchases(user.id)

  // Simplify the purchases mapping since we don't need to fetch download URLs
  const purchasesWithUrls = purchases.map((purchase) => {
    const product = purchase.product as Product
    return {
      ...purchase,
      product: {
        ...product,
        downloadUrl: null // Keep this to maintain type compatibility
      }
    }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>
      
      {purchasesWithUrls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven&apos;t made any purchases yet.</p>
          <Button asChild>
            <Link href="/">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {purchasesWithUrls.map((purchase) => {
            const product = purchase.product
            return (
              <div
                key={purchase.id}
                className="border rounded-lg p-6"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Price: ${product.price}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {product.github_repo_url && (
                      <Button variant="outline" asChild>
                        <a 
                          href={product.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <Github className="h-4 w-4" />
                          View Repository
                        </a>
                      </Button>
                    )}
                    {product.seller?.email && (
                      <Button variant="outline" asChild>
                        <a 
                          href={`mailto:${product.seller.email}?subject=Question about ${encodeURIComponent(product.name)}`}
                          className="inline-flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Contact {product.seller.full_name || 'Seller'}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 