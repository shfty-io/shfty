import { Navbar } from '@/components/global/Navbar'
import { createClient } from '@/lib/server'
import { notFound, redirect } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

async function getSessionAndProduct(sessionId: string, productId: string) {
  if (!sessionId) return null

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

    return { session, product }
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}

export default async function SuccessPage({
  params: { id },
  searchParams,
}: {
  params: { id: string }
  searchParams: { session_id?: string }
}) {
  if (!searchParams.session_id) {
    redirect(`/product/${id}`)
  }

  const result = await getSessionAndProduct(searchParams.session_id, id)

  if (!result) {
    return (
      <>
        <Navbar />
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
                <Link href={`/product/${id}`}>
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

  // Generate download URL for the product
  const supabase = createClient()
  const { data, error } = await supabase
    .storage
    .from('products')
    .createSignedUrl(product.codebase_url!, 60 * 60) // 1 hour expiry

  if (error || !data?.signedUrl) {
    return (
      <>
        <Navbar />
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
      <Navbar />
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
              <a href={data.signedUrl} download className="inline-flex items-center justify-center">
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