import { createClient, createServiceClient } from "@/lib/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // We no longer delete the Stripe account, just disconnect it
    // by removing the reference from our database

    // Update the database to disconnect
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
      message: "Your Stripe account has been disconnected. The account still exists in Stripe and can be reconnected." 
    });
  } catch (error) {
    console.error('Error disconnecting Stripe account:', error);
    return NextResponse.json(
      { error: "Failed to disconnect Stripe account" },
      { status: 500 }
    );
  }
} 