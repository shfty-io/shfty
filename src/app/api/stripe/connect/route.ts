import { createClient, createServiceClient } from "@/lib/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST() {
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

    // Check if user already has a Stripe Connect account
    const { data: sellerAccount } = await serviceClient
      .from('seller_accounts')
      .select('stripe_account_id, is_onboarded')
      .eq('user_id', user.id)
      .single();

    if (sellerAccount?.stripe_account_id) {
      // Check current account status
      const account = await stripe.accounts.retrieve(sellerAccount.stripe_account_id);
      
      // If account is already complete, just return the dashboard URL
      if (account.details_submitted && account.charges_enabled) {
        await serviceClient
          .from('seller_accounts')
          .update({
            is_onboarded: true,
            account_status: 'complete'
          })
          .eq('stripe_account_id', sellerAccount.stripe_account_id);

        return NextResponse.json({ 
          url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell`,
          status: 'complete'
        });
      }

      // If not complete, create new link for completion
      const accountLink = await stripe.accountLinks.create({
        account: sellerAccount.stripe_account_id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell?setup=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell?setup=complete`,
        type: 'account_onboarding',
      });

      return NextResponse.json({ url: accountLink.url });
    }

    // Create a new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      business_profile: {
        product_description: 'Digital products and software',
      },
    });

    console.log('Created Stripe account:', account.id, 'for user:', user.id);

    // Check for existing seller account first
    const { data: existingAccount, error: checkError } = await serviceClient
      .from('seller_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    let updateError;
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing seller account:', checkError);
      throw new Error('Failed to check for existing seller account');
    }
    
    // Update existing account or insert new one
    if (existingAccount) {
      // Update existing account
      const { error } = await serviceClient
        .from('seller_accounts')
        .update({
          stripe_account_id: account.id,
          is_onboarded: false,
          account_status: 'pending'
        })
        .eq('user_id', user.id);
      
      updateError = error;
    } else {
      // Insert new account
      const { error } = await serviceClient
        .from('seller_accounts')
        .insert({
          user_id: user.id,
          stripe_account_id: account.id,
          is_onboarded: false,
          account_status: 'pending'
        });
      
      updateError = error;
    }
      
    if (updateError) {
      console.error('Error updating seller account with Stripe ID:', updateError);
      throw new Error('Failed to update seller account with Stripe ID');
    }
    
    console.log('Updated seller account for user:', user.id, 'with Stripe account ID:', account.id);

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell?setup=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/your/sell?setup=complete`,
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

// Handle webhook to update onboarding status
export async function PUT(request: Request) {
  try {
    const { accountId } = await request.json();
    const supabase = createClient(await cookies());
    const serviceClient = createServiceClient();

    // Check if account ID is provided
    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Verify user is authenticated and owns this account
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify this account belongs to the user
    const { data: sellerAccount, error: sellerError } = await serviceClient
      .from('seller_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .eq('stripe_account_id', accountId)
      .single();
      
    if (sellerError || !sellerAccount) {
      return NextResponse.json(
        { error: "Invalid account ID or account doesn't belong to user" },
        { status: 403 }
      );
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(accountId);
    
    // Check if the account is fully set up
    // In production, we require both details_submitted AND charges_enabled to be true
    const isComplete = account.details_submitted && account.charges_enabled;
    
    // Update onboarding status
    const { error } = await serviceClient
      .from('seller_accounts')
      .update({
        is_onboarded: isComplete,
        account_status: isComplete ? 'complete' : 'pending'
      })
      .eq('stripe_account_id', accountId);

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return NextResponse.json({ 
      status: isComplete ? 'complete' : 'pending',
      isOnboarded: isComplete,
      accountDetails: {
        id: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled
      }
    });
  } catch (error) {
    console.error('Error updating account status:', error);
    return NextResponse.json(
      { error: "Failed to update account status", details: (error as Error).message },
      { status: 500 }
    );
  }
} 