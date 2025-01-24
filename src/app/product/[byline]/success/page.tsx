import { ProductNavbar } from '@/components/product/ProductNavbar'
import { createClient } from '@/lib/server'
import { notFound, redirect } from 'next/navigation'
import { CheckCircle2, AlertCircle, Github, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

async function getSessionAndProduct(sessionId: string, productId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session || session.payment_status !== 'paid') return null

    const supabase = createClient()
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (!product) return null

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Record the purchase
    const { error } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        product_id: productId,
        status: 'completed',
        github_username: user.user_metadata?.user_name || ''
      })

    if (error) {
      console.error('Error recording purchase:', error)
      return null
    }

    return { session, product }
  } catch (error) {
    console.error('Error fetching session:', error)
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
  // Handle searchParams asynchronously
  const sessionId = searchParams?.session_id
  if (!sessionId) {
    redirect(`/product/${params.byline}`)
  }

  // Get session and product details
  const result = await getSessionAndProduct(sessionId, params.byline)

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
                We couldn't find your purchase session. If you believe this is an error, please contact support.
              </p>
              <Button asChild variant="outline">
                <Link href={`/product/${params.byline}`}>
                  Return to Product
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  const { product } = result

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
                We couldn't generate your download link. Please try again or contact support.
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