import { headers, cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/server';
import { createExternalServiceError, handleApiError } from '@/lib/error-handler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const rawSignature = headersList.get('stripe-signature');

    if (!rawSignature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      rawSignature,
      webhookSecret
    );

    const supabase = createClient(await cookies());
    console.log(`Processing Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        console.log('Account updated:', account.id, account.details_submitted, account.charges_enabled);
        
        // Update seller account status
        const { error } = await supabase
          .from('seller_accounts')
          .update({
            is_onboarded: account.details_submitted && account.charges_enabled,
            account_status: (account.details_submitted && account.charges_enabled) ? 'complete' : 'pending'
          })
          .eq('stripe_account_id', account.id);

        if (error) {
          console.error('Error updating seller account:', error);
          return createExternalServiceError('Supabase', 'Failed to update seller account');
        }
        
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // Extract metadata
        const productId = session.metadata?.product_id;
        const sellerId = session.metadata?.seller_id;
        const source = session.metadata?.source || 'direct';
        
        if (!productId || !sellerId) {
          console.error('Missing metadata in checkout session:', session.id);
          return NextResponse.json(
            { error: 'Missing metadata in checkout session' },
            { status: 400 }
          );
        }
        
        // Get customer information
        const customerId = session.customer as string;
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, github_username')
          .eq('stripe_customer_id', customerId)
          .limit(1);
          
        if (profileError || !profiles || profiles.length === 0) {
          console.error('Error fetching customer profile:', profileError);
          return createExternalServiceError('Supabase', 'Failed to fetch customer profile');
        }
        
        const userId = profiles[0].user_id;
        const githubUsername = profiles[0].github_username || 'unknown';
        
        // Record the purchase
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            user_id: userId,
            product_id: productId,
            github_username: githubUsername,
            status: 'completed',
            payment_intent: session.payment_intent as string,
            amount_total: session.amount_total,
            source: source
          });
          
        if (purchaseError) {
          console.error('Error recording purchase:', purchaseError);
          return createExternalServiceError('Supabase', 'Failed to record purchase');
        }
        
        // Update product purchase count
        const { error: updateError } = await supabase.rpc('increment_purchase_count', {
          product_id: productId
        });
        
        if (updateError) {
          console.error('Error updating purchase count:', updateError);
          // Continue anyway as this is not critical
        }
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        
        // Additional payment processing logic can be added here
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
        
        // Handle failed payment
        // You might want to notify the user or update the purchase status
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return handleApiError(error);
  }
} 