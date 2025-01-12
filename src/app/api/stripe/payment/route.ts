import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, paymentMethodId } = await request.json();

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select(`
        *,
        seller:user_id (
          seller_accounts (
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

    const sellerStripeAccountId = product.seller.seller_accounts[0]?.stripe_account_id;
    if (!sellerStripeAccountId) {
      return NextResponse.json(
        { error: "Seller not properly configured" },
        { status: 400 }
      );
    }

    // Calculate amounts
    const amount = Math.round(product.price * 100); // Convert to cents
    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100));

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
      },
      metadata: {
        productId,
        buyerId: user.id,
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
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: 500 }
    );
  }
} 