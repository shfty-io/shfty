import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

async function getServerSideUser() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user
}

async function getPurchases(userId: string) {
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
        codebase_url
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>
      
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't made any purchases yet.</p>
          <Button asChild>
            <a href="/">Browse Products</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const product = purchase.product as any
            return (
              <div
                key={purchase.id}
                className="border rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                  <DownloadButton productId={product.id} codebaseUrl={product.codebase_url} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

async function DownloadButton({ 
  productId, 
  codebaseUrl 
}: { 
  productId: string
  codebaseUrl: string 
}) {
  const supabase = createClient()
  const { data } = await supabase
    .storage
    .from('products')
    .createSignedUrl(codebaseUrl, 60 * 60) // 1 hour expiry

  if (!data?.signedUrl) {
    return (
      <Button variant="outline" disabled>
        Download unavailable
      </Button>
    )
  }

  return (
    <Button asChild variant="outline">
      <a 
        href={data.signedUrl}
        download
        className="inline-flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download
      </a>
    </Button>
  )
} 