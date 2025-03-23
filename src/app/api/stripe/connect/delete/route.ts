import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  try {
    // Parse request body
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Create Supabase client for auth and service client for database
    const supabase = createClient(await cookies());
    const serviceClient = createServiceClient();
    
    // Verify the user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    // Call Stripe API to delete the connected account
    try {
      await stripe.accounts.del(accountId);
      
      // Update the database to mark this account as deleted
      const { error: updateError } = await serviceClient
        .from('seller_accounts')
        .update({
          account_status: 'deleted',
          is_onboarded: false,
          last_webhook_update: new Date().toISOString()
        })
        .eq('stripe_account_id', accountId);
      
      if (updateError) {
        console.error('Error updating account status in database:', updateError);
        // Continue anyway since the Stripe account was successfully deleted
      }
      
      return NextResponse.json({ success: true, message: "Connected account deleted successfully" });
    } catch (stripeError: unknown) {
      console.error('Stripe error deleting connected account:', stripeError);
      
      // Handle specific Stripe errors
      if (stripeError && typeof stripeError === 'object' && 'type' in stripeError && 
          stripeError.type === 'StripePermissionError' && 'message' in stripeError) {
        return NextResponse.json(
          { 
            error: "You don't have permission to delete this account. Use the Stripe Dashboard if this is a Standard account.",
            details: stripeError.message 
          },
          { status: 403 }
        );
      }
      
      const errorMessage = stripeError && typeof stripeError === 'object' && 'message' in stripeError 
        ? stripeError.message 
        : 'Unknown error';
      
      return NextResponse.json(
        { error: "Failed to delete connected account", details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
} 