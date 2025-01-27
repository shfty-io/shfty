import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

type Context = {
  params: { id: string }
}

export async function POST(request: NextRequest, context: Context): Promise<NextResponse> {
  try {
    const supabase = createClient()
    const { id } = context.params
    
    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)  // Use destructured id
      .single()

    if (!product) {
      return new NextResponse('Product not found', { status: 404 })
    }

    // If product is free, handle direct download
    if (product.price === 0) {
      // Generate a download URL for the codebase
      const { data: downloadUrl } = await supabase
        .storage
        .from('products')
        .createSignedUrl(product.codebase_url!, 60 * 60) // 1 hour expiry

      return NextResponse.json({ downloadUrl })
    }

    // Get or create customer
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's profile for customer details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      })
      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image_urls || [],
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.id}`,
      metadata: {
        product_id: product.id,
        seller_id: product.user_id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 