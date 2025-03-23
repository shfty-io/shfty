import { redirect } from "next/navigation";
import { createServerComponentClient, createServiceClient } from "@/lib/server";
import SetupPageClient from "@/components/setup/SetupPageClient";

export default async function SetupPage() {
  try {
    // Create the Supabase client with the cookie store for auth
    const supabase = await createServerComponentClient();
    
    // Check session with secure method
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      redirect("/auth/login");
    }
    
    // Use service client for database operations
    const serviceClient = createServiceClient();
    
    // Fetch seller account data using service role client
    const { data: sellerAccount, error } = await serviceClient
      .from('seller_accounts')
      .select('stripe_account_id, is_onboarded, github_token, account_status')
      .eq('user_id', user.id)
      .single();
      
    if (error && error.code === 'PGRST116') {
      // No seller account found, create one with service role client
      const { data: newSellerAccount, error: createError } = await serviceClient
        .from('seller_accounts')
        .insert({
          user_id: user.id,
          is_onboarded: false,
          account_status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating seller account:', createError);
        // Continue with client rendering and handle there
        return <SetupPageClient user={user} sellerAccount={null} error="Failed to create seller account" />;
      }
      
      return <SetupPageClient user={user} sellerAccount={newSellerAccount} />;
    }
    
    if (error) {
      console.error('Error fetching seller account:', error);
      return <SetupPageClient user={user} sellerAccount={null} error="Failed to load seller account" />;
    }
    
    return <SetupPageClient user={user} sellerAccount={sellerAccount} />;
  } catch (error) {
    console.error('Error in setup page:', error);
    return <div>Error loading account setup. Please try again later.</div>
  }
} 