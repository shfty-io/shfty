import { Navbar } from '@/components/global/Navbar'
import { createClient } from '@/lib/server'
import { notFound, redirect } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
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
    if (!session) return null

    const supabase = createClient()
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

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
  const result = await getSessionAndProduct(searchParams.session_id || '', id)

  if (!result) {
    redirect(`/product/${id}`)
  }

  const { product } = result

  // Generate download URL for the product
  const supabase = createClient()
  const { data } = await supabase
    .storage
    .from('products')
    .createSignedUrl(product.codebase_url!, 60 * 60) // 1 hour expiry

  if (!data?.signedUrl) {
    return notFound()
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
            <Button asChild size="lg">
              <a href={data.signedUrl} download>
                Download Files
              </a>
            </Button>
            <div>
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