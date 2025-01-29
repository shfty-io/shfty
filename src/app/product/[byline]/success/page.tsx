import { ProductNavbar } from '@/components/product/ProductNavbar'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, AlertCircle, Github, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

async function getSessionAndProduct(sessionId: string, byline: string) {
  try {
    const supabase = createClient()

    // 1. Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session || session.payment_status !== 'paid') {
      console.error('Invalid or unpaid session:', sessionId)
      return null
    }

    // 2. Get the product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        profiles!inner (
          id,
          github_username,
          is_seller
        )
      `)
      .eq(byline.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'id' : 'byline', byline)
      .single()

    if (productError || !product) {
      console.error('Product not found:', byline, productError)
      return null
    }

    // 3. Get the current buyer's details
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User not found:', userError)
      return null
    }

    const buyerGithubUsername = user.user_metadata?.user_name
    if (!buyerGithubUsername) {
      console.error('Buyer GitHub username not found')
      return null
    }

    // 4. Record the purchase first
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        product_id: product.id,
        status: 'completed',
        github_username: buyerGithubUsername
      })

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError)
      return null
    }

    // 5. If there's a GitHub repo, handle repository access
    if (product.github_repo_url) {
      // Check if product has GitHub token
      if (!product.github_token) {
        console.error('GitHub token not found for product:', product.id)
        return { session, product, githubAccessPending: true }
      }

      try {
        // Parse GitHub URL
        const cleanUrl = product.github_repo_url.trim().replace(/\/$/, '')
        const githubUrl = new URL(cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`)
        const parts = githubUrl.pathname.split('/').filter(Boolean)

        if (parts.length !== 2) {
          throw new Error('Invalid GitHub repository URL format')
        }

        const [owner, repo] = parts

        // Verify token permissions
        const verifyResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${product.github_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })

        if (!verifyResponse.ok) {
          console.error('Invalid GitHub token:', await verifyResponse.text())
          return { session, product, githubAccessPending: true }
        }

        // Add collaborator
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/collaborators/${buyerGithubUsername}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${product.github_token}`,
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({ permission: 'pull' })
          }
        )

        if (!response.ok) {
          console.error('GitHub API error:', {
            status: response.status,
            error: await response.text()
          })
          return { session, product, githubAccessPending: true }
        }

        // Record successful access
        await supabase
          .from('repository_access')
          .insert({
            user_id: user.id,
            product_id: product.id,
            repository_url: product.github_repo_url,
            access_key: buyerGithubUsername
          })
          .single()

      } catch (error) {
        console.error('Error granting repository access:', error)
        return { session, product, githubAccessPending: true }
      }
    }

    return { session, product, githubAccessPending: false }
  } catch (error) {
    console.error('Error in getSessionAndProduct:', error)
    return null
  }
}

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: { byline: string }
  searchParams: { session_id?: string }
}) {
  // Handle params and searchParams asynchronously
  const { byline } = await Promise.resolve(params);
  const { session_id: sessionId } = await Promise.resolve(searchParams);

  if (!sessionId) {
    redirect(`/product/${byline}`);
  }

  // Get session and product details
  const result = await getSessionAndProduct(sessionId, byline);

  if (!result) {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Session Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We couldn&apos;t find your purchase session. If you believe this is an error, please contact support.
              </p>
              <Button asChild variant="outline">
                <Link href={`/product/${byline}`}>
                  Return to Product
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  const { product, githubAccessPending } = result

  // Check if product has a GitHub repo URL
  if (product.github_repo_url) {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank you for your purchase!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your purchase of {product.name} was successful.
              </p>
            </div>

            <div className="space-y-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a 
                  href={product.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  View Repository
                </a>
              </Button>
              <div className="pt-4">
                <Link 
                  href="/your/purchases" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View your purchases
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Generate download URL for products with codebase
  if (!product.codebase_url) {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Download Error
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                No codebase available for this product. Please contact support.
              </p>
              <Button asChild variant="outline">
                <Link href="/your/purchases">
                  View Your Purchases
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .storage
    .from('products')
    .createSignedUrl(product.codebase_url, 60 * 60) // 1 hour expiry

  if (error || !data?.signedUrl) {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Download Error
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We couldn&apos;t generate your download link. Please try again or contact support.
              </p>
              <Button asChild variant="outline">
                <Link href="/your/purchases">
                  View Your Purchases
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (githubAccessPending) {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Repository Access Pending
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We couldn't grant repository access. The seller needs to set up their GitHub integration.
              </p>
              <Button asChild variant="outline">
                <Link href={`/product/${byline}`}>
                  Return to Product
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <ProductNavbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank you for your purchase!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your purchase of {product.name} was successful. You can now download your files.
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={data.signedUrl} download className="inline-flex items-center justify-center gap-2">
                <Download className="h-5 w-5" />
                Download Files
              </a>
            </Button>
            <div className="pt-4">
              <Link 
                href="/your/purchases" 
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View your purchases
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 