import { createClient, createServiceClient } from "@/lib/server";
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
    const serviceClient = createServiceClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, paymentMethodId, source } = await request.json();

    // Get product details
    const { data: product } = await serviceClient
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
    
    // Second try: If we still don't have a seller account ID, try looking it up directly
    if (!sellerStripeAccountId) {
      const { data: sellerAccount } = await serviceClient
        .from('seller_accounts')
        .select('stripe_account_id')
        .eq('user_id', product.user_id)
        .single();
      
      if (sellerAccount) {
        sellerStripeAccountId = sellerAccount.stripe_account_id;
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
    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100));
    const sellerAmount = amount - platformFee;

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
      } as Stripe.PaymentIntentCreateParams.TransferData,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        productId,
        buyerId: user.id,
        source: source || 'direct',
        platformFee,
        sellerAmount
      },
    });

    // Create purchase record with comprehensive tracking
    const { error: purchaseError } = await serviceClient
      .from('purchases')
      .insert({
        user_id: user.id,
        product_id: productId,
        payment_intent_id: paymentIntent.id,
        amount_total: amount,
        platform_fee: platformFee,
        seller_amount: sellerAmount,
        currency: 'usd',
        status: 'pending',
        payment_status: paymentIntent.status,
        metadata: {
          source: source || 'direct',
          payment_method: paymentIntent.payment_method,
          customer_email: user.email,
          seller_stripe_account: sellerStripeAccountId
        }
      });

    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError);
      // Continue anyway as the payment is already processed
    }

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