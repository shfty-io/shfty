import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
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

    // Create Supabase client
    const supabase = createClient(await cookies());
    
    // Verify the user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
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

    // Delete the Stripe account
    try {
      await stripe.accounts.del(accountId);
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully deleted account ${accountId} from Stripe`
      });
    } catch (stripeError: unknown) {
      console.error('Stripe error deleting connected account:', stripeError);
      
      // Special case: If error indicates account doesn't exist or we don't have permission,
      // treat this as success (the account is effectively already gone from a user perspective)
      if (stripeError && typeof stripeError === 'object' && 
         (('code' in stripeError && stripeError.code === 'account_invalid') || 
          ('type' in stripeError && stripeError.type === 'StripePermissionError') ||
          ('statusCode' in stripeError && 'rawType' in stripeError && 
           stripeError.statusCode === 403 && stripeError.rawType === 'invalid_request_error'))) {
        
        return NextResponse.json({ 
          success: true, 
          message: `Account ${accountId} is already deleted or inaccessible`,
          details: "The account doesn't exist or your API key doesn't have access to it"
        });
      }
      
      return NextResponse.json(
        { 
          error: "Failed to delete Stripe account", 
          details: stripeError && typeof stripeError === 'object' && 'message' in stripeError
            ? stripeError.message
            : 'Unknown error',
          stripe_error: stripeError
        },
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