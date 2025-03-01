import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { csrfProtection } from '@/lib/csrf'
import { 
  createAuthenticationError, 
  createNotFoundError, 
  createExternalServiceError,
  handleApiError
} from '@/lib/error-handler'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

type Context = {
  params: { id: string }
}

async function handleCheckout(request: NextRequest, context: Context): Promise<NextResponse> {
  try {
    const supabase = createClient()
    const { id } = await Promise.resolve(context.params)
    
    // Get request body for source information
    const requestBody = await request.json().catch(() => ({}))
    const source = requestBody.source || 'direct'
    
    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)  // Use destructured id
      .single()

    if (productError || !product) {
      return createNotFoundError('Product')
    }

    // If product is free, handle direct download
    if (product.price === 0) {
      // Generate a download URL for the codebase
      const { data: downloadUrl, error: downloadError } = await supabase
        .storage
        .from('products')
        .createSignedUrl(product.codebase_url!, 60 * 60) // 1 hour expiry

      if (downloadError) {
        return createExternalServiceError('Supabase Storage', downloadError.message)
      }

      return NextResponse.json({ downloadUrl })
    }

    // Get or create customer
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return createAuthenticationError()
    }

    // Get user's profile for customer details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      return createExternalServiceError('Supabase', 'Failed to fetch user profile')
    }

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      try {
        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id
          }
        })
        customerId = customer.id

        // Update profile with Stripe customer ID
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Failed to update profile with Stripe customer ID:', updateError)
          // Continue anyway as this is not critical
        }
      } catch (error) {
        console.error('Failed to create Stripe customer:', error)
        return createExternalServiceError('Stripe', 'Failed to create customer')
      }
    }

    try {
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
          source: source,
        },
      })

      return NextResponse.json({ url: session.url })
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      return createExternalServiceError('Stripe', 'Failed to create checkout session')
    }
  } catch (error) {
    return handleApiError(error)
  }
}

// Apply CSRF protection to the checkout handler
export const POST = csrfProtection(handleCheckout) 