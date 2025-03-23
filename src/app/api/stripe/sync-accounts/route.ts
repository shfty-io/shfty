import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST() {
  try {
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

    // Fetch all connected accounts from Stripe
    const allAccounts: Stripe.Account[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    
    while (hasMore) {
      const accounts: Stripe.ApiList<Stripe.Account> = await stripe.accounts.list({
        limit: 100,
        starting_after: startingAfter
      });

      allAccounts.push(...accounts.data);
      hasMore = accounts.has_more;
      startingAfter = accounts.data.length > 0 ? accounts.data[accounts.data.length - 1].id : undefined;
    }
    
    // Get existing accounts from database
    const { data: existingAccounts, error: fetchError } = await serviceClient
      .from('seller_accounts')
      .select('stripe_account_id, user_id');

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch existing accounts' }, { status: 500 });
    }

    // Create a Set of existing account IDs for faster lookup
    const existingAccountIds = new Set<string>();
    const existingAccountMap = new Map<string, string>(); // Maps account ID to user ID

    existingAccounts.forEach(account => {
      existingAccountIds.add(account.stripe_account_id);
      existingAccountMap.set(account.stripe_account_id, account.user_id);
    });

    // Identify accounts to add (in Stripe but not in our database)
    const accountsToAdd = allAccounts.filter(account => !existingAccountIds.has(account.id));

    // Add missing accounts to database
    for (const account of accountsToAdd) {
      // Try to get the user ID from account metadata
      let userId = account.metadata?.user_id as string | undefined;

      // If no user ID in metadata, try to get it from the account email
      if (!userId && account.email) {
        const { data: users } = await serviceClient
          .from('profiles')
          .select('id')
          .eq('email', account.email)
          .limit(1);

        if (users && users.length > 0) {
          userId = users[0].id;
        }
      }

      // Skip accounts where we can't determine the user ID
      if (!userId) {
        continue;
      }

      // Map account status
      let onboardingStatus = 'pending';
      
      if (account.details_submitted && account.charges_enabled) {
        onboardingStatus = 'complete';
      } else if (account.details_submitted) {
        onboardingStatus = 'review';
      }

      // Insert the account into our database
      const { error: insertError } = await serviceClient
        .from('seller_accounts')
        .insert({
          user_id: userId,
          stripe_account_id: account.id,
          is_onboarded: onboardingStatus === 'complete',
          account_status: onboardingStatus,
          last_synced: new Date().toISOString()
        });

      if (insertError) {
        console.error(`Failed to insert account ${account.id}:`, insertError);
      }
    }
    
    return NextResponse.json(
      { results: [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}