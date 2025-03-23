import { createClient, createServiceClient } from "@/lib/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function DELETE() {
  try {
    const supabase = createClient(await cookies());
    const serviceClient = createServiceClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the seller account
    const { data: sellerAccount } = await serviceClient
      .from('seller_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!sellerAccount?.stripe_account_id) {
      return NextResponse.json({ error: "No Stripe account found" }, { status: 404 });
    }

    try {
      // Ensure the Stripe account ID is sanitized to prevent path traversal issues
      const accountId = sellerAccount.stripe_account_id.trim();
      
      // Validate that the account ID only contains alphanumeric characters and allowed special chars
      if (/^acct_[a-zA-Z0-9]+$/.test(accountId)) {
        // Permanently delete the account from Stripe
        await stripe.accounts.del(accountId);
      } else {
        throw new Error("Invalid Stripe account ID format");
      }
    } catch (stripeError) {
      console.error('Error deleting Stripe account:', stripeError);
      return NextResponse.json(
        { error: "Failed to delete Stripe account", details: stripeError instanceof Error ? stripeError.message : "Unknown error" },
        { status: 500 }
      );
    }

    // Update the database
    await serviceClient
      .from('seller_accounts')
      .update({
        stripe_account_id: null,
        is_onboarded: false,
        account_status: 'pending'
      })
      .eq('user_id', user.id);

    return NextResponse.json({ 
      success: true,
      message: "Your Stripe account has been permanently deleted from Stripe" 
    });
  } catch (error) {
    console.error('Error deleting Stripe account:', error);
    return NextResponse.json(
      { error: "Failed to delete Stripe account" },
      { status: 500 }
    );
  }
} 