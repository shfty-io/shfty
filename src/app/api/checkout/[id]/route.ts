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

// Helper function to clean HTML from text
function cleanHtmlFromText(html: string | null | undefined): string {
  if (!html) return '';
  
  // Remove HTML tags
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  
  // Replace HTML entities
  const withoutEntities = withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Normalize whitespace
  const normalized = withoutEntities
    .replace(/\s+/g, ' ')
    .trim();
  
  // Increase the character limit to 400 characters
  // Only add ellipsis if we're actually truncating
  const maxLength = 400;
  if (normalized.length > maxLength) {
    // Try to find a sentence or phrase break near the limit
    const breakPoint = normalized.lastIndexOf('. ', maxLength - 5);
    if (breakPoint > maxLength * 0.7) {
      // If we found a good sentence break, use that
      return normalized.substring(0, breakPoint + 1);
    }
    
    // Otherwise, look for a space to break at
    const spaceBreak = normalized.lastIndexOf(' ', maxLength - 3);
    if (spaceBreak > 0) {
      return normalized.substring(0, spaceBreak) + '...';
    }
    
    // Fallback to hard truncation
    return normalized.substring(0, maxLength - 3) + '...';
  }
  
  return normalized;
}

// Helper function to extract key points from a description
function extractKeyPoints(description: string | null | undefined): string {
  if (!description) return '';
  
  // Clean the HTML first
  const cleanedText = cleanHtmlFromText(description);
  
  // For the specific format we're seeing, try to extract the main points
  if (cleanedText.includes('GitHub Repository Marketplace')) {
    // This is likely our standard format
    const parts = cleanedText.split(/\s+Wanted to solve/i);
    if (parts.length > 1) {
      // Get the part after "Wanted to solve"
      const problemsSection = 'Wanted to solve ' + parts[1];
      // Limit to a reasonable length
      return problemsSection.length > 300 
        ? problemsSection.substring(0, 297) + '...' 
        : problemsSection;
    }
  }
  
  // Look for bullet points or numbered lists
  const bulletPoints = cleanedText.match(/[•\-*]\s+([^•\-*\n]+)/g);
  if (bulletPoints && bulletPoints.length > 0) {
    return bulletPoints.slice(0, 5).join(' ');
  }
  
  // Look for sentences with key phrases
  const keyPhrases = ['helps', 'solves', 'features', 'benefits', 'includes'];
  const sentences = cleanedText.split(/[.!?]+\s+/);
  
  const keyPointSentences = sentences.filter(sentence => 
    keyPhrases.some(phrase => sentence.toLowerCase().includes(phrase))
  );
  
  if (keyPointSentences.length > 0) {
    return keyPointSentences.slice(0, 3).join('. ') + '.';
  }
  
  // Fallback to the first few sentences
  return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '.');
}

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

    // Debug the product data
    console.log('Product data:', {
      id: product.id,
      name: product.name,
      user_id: product.user_id,
      seller: product.seller
    });

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
    console.log('Seller Stripe account ID from join:', sellerStripeAccountId);
    
    // If we couldn't get the seller account ID from the join, try a direct query
    if (!sellerStripeAccountId) {
      console.log('Trying direct query for seller account');
      const { data: sellerAccount, error: sellerError } = await supabase
        .from('seller_accounts')
        .select('stripe_account_id')
        .eq('user_id', product.user_id)
        .single();
        
      if (!sellerError && sellerAccount?.stripe_account_id) {
        sellerStripeAccountId = sellerAccount.stripe_account_id;
        console.log('Found seller account ID from direct query:', sellerStripeAccountId);
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
        console.log('Seller account status:', { 
          details_submitted: account.details_submitted, 
          charges_enabled: account.charges_enabled,
          sellerSetupComplete
        });
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
      // Record the free purchase first
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          product_id: product.id,
          user_id: user.id,
          amount: 0,
          payment_method: 'free',
          status: 'completed'
        })

      if (purchaseError) {
        console.error('Error recording free purchase:', purchaseError)
        // Continue anyway as this isn't critical
      }
      
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
      const cleanedDescription = cleanHtmlFromText(product.description) || 'Access to GitHub repository';
      const keyPoints = extractKeyPoints(product.description);
      
      // Use the key points if available, otherwise fall back to the cleaned description
      const finalDescription = keyPoints || cleanedDescription;
      console.log('Final description for checkout:', finalDescription);
      
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.name ? product.name.trim() : 'GitHub Repository',
                description: finalDescription,
                images: product.image_urls && product.image_urls.length > 0 
                  ? [product.image_urls[0]] 
                  : undefined,
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
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);

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