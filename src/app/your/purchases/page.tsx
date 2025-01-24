import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, Github } from 'lucide-react'

async function getServerSideUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
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
        codebase_url,
        github_repo_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return purchases || []
}

async function getDownloadUrl(codebaseUrl: string) {
  const supabase = createClient()
  try {
    // Extract just the filename from the URL
    const filePath = codebaseUrl.split('/').pop();
    
    if (!filePath) {
      console.error('Invalid codebase URL format:', codebaseUrl)
      return null
    }

    const { data, error } = await supabase
      .storage
      .from('codebases')
      .createSignedUrl(filePath, 60 * 60)

    if (error) {
      console.error('Supabase storage error:', {
        message: error.message,
        url: codebaseUrl,
        extractedPath: filePath
      })
      throw error
    }
    return data.signedUrl
  } catch (error) {
    console.error('Full error generating download URL:', JSON.stringify(error, null, 2))
    return null
  }
}

export default async function PurchasesPage() {
  const user = await getServerSideUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const purchases = await getPurchases(user.id)

  // Pre-fetch download URLs
  const purchasesWithUrls = await Promise.all(
    purchases.map(async (purchase) => {
      const product = purchase.product as any
      let downloadUrl = null
      
      if (product.codebase_url) {
        downloadUrl = await getDownloadUrl(product.codebase_url)
      }
      
      return {
        ...purchase,
        product: {
          ...product,
          downloadUrl
        }
      }
    })
  )

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Your Purchases</h1>
      
      {purchasesWithUrls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't made any purchases yet.</p>
          <Button asChild>
            <a href="/">Browse Products</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {purchasesWithUrls.map((purchase) => {
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
                  <div className="flex gap-2">
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
                    {product.downloadUrl ? (
                      <Button asChild variant="outline">
                        <a 
                          href={product.downloadUrl}
                          download
                          className="inline-flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Files
                        </a>
                      </Button>
                    ) : product.codebase_url ? (
                      <Button variant="outline" disabled>
                        Error generating download
                      </Button>
                    ) : null}
                    {!product.github_repo_url && !product.codebase_url && (
                      <Button variant="outline" disabled>
                        Download unavailable
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