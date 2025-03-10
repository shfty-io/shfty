import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const PLATFORM_FEE_PERCENTAGE = Number(process.env.TRANSACTION_FEE_PERCENTAGE) || 10;

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, paymentMethodId, source } = await request.json();

    // Get product details
    const { data: product } = await supabase
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
      .eq('id', productId)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
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

    if (!sellerStripeAccountId) {
      return NextResponse.json(
        { error: "Seller not properly configured" },
        { status: 400 }
      );
    }

    // Calculate amounts
    const amount = Math.round(product.price * 100); // Convert to cents
    
    // Skip platform fee if purchase is from a category page
    const platformFee = source === 'category' ? 0 : Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100));

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
        transfer_group: `ORDER_${productId}`,
        transfer_schedule: {
          delay_days: 7,
          interval: 'daily'
        }
      } as Stripe.PaymentIntentCreateParams.TransferData,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        productId,
        buyerId: user.id,
        source: source || 'direct',
      },
    });

    // Create order record
    await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: productId,
        amount,
        platform_fee: platformFee,
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
      });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payment' },
      { status: 500 }
    );
  }
} 