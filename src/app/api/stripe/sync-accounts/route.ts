import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST() {
  try {
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

    // Fetch all connected accounts from Stripe
    const allAccounts: Stripe.Account[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    
    while (hasMore) {
      const params: Stripe.AccountListParams = {
        limit: 100
      };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const accounts = await stripe.accounts.list(params);
      allAccounts.push(...accounts.data);
      
      hasMore = accounts.has_more;
      if (accounts.data.length > 0) {
        startingAfter = accounts.data[accounts.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Found ${allAccounts.length} connected accounts in Stripe`);
    
    // Get all existing accounts from database
    const { data: existingAccounts, error: fetchError } = await supabase
      .from('seller_accounts')
      .select('stripe_account_id');
      
    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch existing accounts", details: fetchError.message },
        { status: 500 }
      );
    }
    
    // Create a set of existing account IDs for quick lookup
    const existingAccountIds = new Set(
      existingAccounts
        ?.map(account => account.stripe_account_id)
        .filter(id => id !== null) || []
    );
    
    console.log(`Found ${existingAccountIds.size} accounts in database`);
    
    // Accounts to add to database
    const accountsToAdd = allAccounts.filter(
      account => !existingAccountIds.has(account.id)
    );
    
    console.log(`Need to add ${accountsToAdd.length} accounts to database`);
    
    // Process each account to be added
    const results = [];
    
    for (const account of accountsToAdd) {
      const isComplete = account.details_submitted && account.charges_enabled;
      
      // Map Stripe account status to database-compatible status
      let accountStatus;
      if (isComplete) {
        accountStatus = 'complete';
      } else if (account.details_submitted) {
        accountStatus = 'pending';
      } else {
        // Handle restricted status specifically
        accountStatus = 'pending'; // Use 'pending' instead of 'restricted' as it might be a valid enum
      }
      
      console.log(`Account ${account.id} status mapping: Stripe status=${account.details_submitted ? 'details_submitted' : 'not_submitted'}/${account.charges_enabled ? 'charges_enabled' : 'charges_disabled'} → DB status=${accountStatus}`);
      
      try {
        // Get the first valid user from the profiles table
        const { data: validUsers, error: userError } = await supabase
          .from('profiles')
          .select('id, user_id')
          .limit(1);
          
        if (userError || !validUsers || validUsers.length === 0) {
          throw new Error('No valid users found in the profiles table: ' + (userError?.message || 'empty result'));
        }
        
        // Use the first valid user's user_id
        const userId = validUsers[0].user_id;
        
        console.log(`Inserting account ${account.id} with user_id ${userId}`);
        
        // Process the account
        const result = {
          stripe_account_id: account.id,
          user_id: userId,
          status: accountStatus
        };
        
        results.push(result);
        
        // Add the account to the database
        const { error: insertError } = await supabase
          .from('seller_accounts')
          .insert(result);
        
        if (insertError) {
          throw new Error('Failed to insert account into database: ' + (insertError.message || 'unknown error'));
        }
      } catch (error) {
        console.error(`Error processing account ${account.id}:`, error);
        results.push({
          stripe_account_id: account.id,
          user_id: null,
          status: 'error'
        });
      }
    }
    
    return NextResponse.json(
      { results },
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