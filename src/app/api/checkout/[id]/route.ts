import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { validateCsrfToken } from '@/lib/csrf'
import { 
  createNotFoundError, 
  createExternalServiceError,
  handleApiError
} from '@/lib/error-handler'
import { createClient } from '@/lib/server'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
})

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // CSRF validation
    if (!(await validateCsrfToken(request))) {
      return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract the ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const productPath = `/product/${id}`;

    // Create supabase client
    const supabase = createClient(await cookies());
    
    // Get request body for source information
    const requestBody = await request.json().catch(() => ({}))
    const source = requestBody.source || 'direct'
    
    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        seller:user_id (
          id,
          seller_accounts!inner (
            stripe_account_id
          )
        )
      `)
      .eq('id', id)
      .single()

    if (productError || !product) {
      return createNotFoundError('Product')
    }

    // Get seller's Stripe account ID - handle both array and object formats
    let sellerStripeAccountId;
    if (product.seller?.seller_accounts) {
      if (Array.isArray(product.seller.seller_accounts)) {
        // Handle array format
        sellerStripeAccountId = product.seller.seller_accounts[0]?.stripe_account_id;
      } else {
        // Handle object format
        sellerStripeAccountId = product.seller.seller_accounts.stripe_account_id;
      }
    }
    
    // If we couldn't get the seller account ID from the join, try a direct query
    if (!sellerStripeAccountId) {
      const { data: sellerAccount, error: sellerError } = await supabase
        .from('seller_accounts')
        .select('stripe_account_id')
        .eq('user_id', product.user_id)
        .single();
        
      if (!sellerError && sellerAccount?.stripe_account_id) {
        sellerStripeAccountId = sellerAccount.stripe_account_id;
      } else if (sellerError) {
        console.error('Error fetching seller account:', sellerError);
      }
    }
    
    // Check if seller account is properly set up
    let sellerSetupComplete = false;
    if (sellerStripeAccountId) {
      try {
        // Verify the account is properly set up
        const account = await stripe.accounts.retrieve(sellerStripeAccountId);
        sellerSetupComplete = account.details_submitted && account.charges_enabled;
      } catch (error) {
        console.error('Error retrieving seller Stripe account:', error);
      }
    }
    
    // If seller is not properly set up, return an error
    if (!sellerStripeAccountId || !sellerSetupComplete) {
      return NextResponse.json(
        { 
          error: "This seller hasn't completed their payment setup yet", 
          details: "The seller needs to complete their Stripe onboarding before they can receive payments."
        },
        { status: 400 }
      );
    }

    // Get user - required for both free and paid products
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      // Return a more helpful error for easier redirect after login
      return new NextResponse(
        JSON.stringify({ 
          error: 'Authentication required',
          redirectTo: `/auth/login?redirect=${encodeURIComponent(productPath)}`
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // If product is free, handle direct download
    if (product.price === 0) {
      // Get user's github username from profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('github_username')
        .eq('user_id', user.id)
        .single();
      
      // Use the github username from profile, or default to a placeholder
      const githubUsername = userProfile?.github_username || 'user-' + user.id.substring(0, 8);
      
      // Record the free purchase first
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          product_id: product.id,
          user_id: user.id,
          github_username: githubUsername, // Required field
          status: 'completed'
          // No amount or payment_method fields - they don't exist in the schema
        })

      if (purchaseError) {
        console.error('Error recording free purchase:', purchaseError)
        // Continue anyway as this isn't critical
      }
      
      // GitHub repository access is handled client-side after redirecting
      return NextResponse.json({ 
        success: true,
        redirect: `/product/${product.byline}/success`
      })
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
      // Create a checkout session with Stripe
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.name,
                description: product.description && product.description.length > 0 
                  ? `${product.name}: ${product.description.slice(0, 80)}${product.description.length > 80 ? '...' : ''}`
                  : product.name,
                images: product.image_urls && product.image_urls.length > 0 
                  ? [product.image_urls[0]] 
                  : undefined,
              },
              unit_amount: Math.round(product.price * 100), // Convert dollars to cents
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
        // Add payment_intent_data with application fee
        payment_intent_data: {
          application_fee_amount: source === 'category' 
            ? 0 
            : Math.round(product.price * 100 * (Number(process.env.TRANSACTION_FEE_PERCENTAGE) || 10) / 100),
          transfer_data: {
            destination: sellerStripeAccountId,
          },
        },
        // Customize the look and feel of the checkout page
        custom_text: {
          submit: {
            message: 'We\'ll provide access to the repository after your purchase is complete.'
          }
        },
        // Simplify the checkout experience
        billing_address_collection: 'auto',
        phone_number_collection: {
          enabled: false,
        },
        allow_promotion_codes: false,
        ui_mode: 'hosted',
        // Additional customization
        payment_method_types: ['card'],
        locale: 'en',
        submit_type: 'pay',
      });

      return NextResponse.json({ url: session.url })
    } catch (error: unknown) {
      console.error('Failed to create checkout session:', error)
      
      // Provide more specific error messages based on the error type
      if (error && typeof error === 'object' && 'type' in error && error.type === 'StripeInvalidRequestError') {
        const stripeError = error as Stripe.errors.StripeInvalidRequestError;
        const errorMessage = stripeError.message || 'Failed to create checkout session';
        
        return NextResponse.json(
          { error: errorMessage, param: stripeError.param, code: stripeError.code },
          { status: 400 }
        );
      }
      
      return createExternalServiceError('Stripe', 'Failed to create checkout session')
    }
  } catch (error) {
    return handleApiError(error)
  }
} 