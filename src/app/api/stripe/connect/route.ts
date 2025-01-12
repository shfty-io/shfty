import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

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

    // Check if user already has a Stripe Connect account
    const { data: sellerAccount } = await supabase
      .from('seller_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single();

    if (sellerAccount?.stripe_account_id) {
      // Get the account link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: sellerAccount.stripe_account_id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell`,
        type: 'account_onboarding',
      });

      return NextResponse.json({ url: accountLink.url });
    }

    // Create a new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // You might want to make this dynamic based on user input
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Store the Stripe account ID in your database
    await supabase
      .from('seller_accounts')
      .insert({
        user_id: user.id,
        stripe_account_id: account.id,
        is_onboarded: false,
      });

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account" },
      { status: 500 }
    );
  }
} 