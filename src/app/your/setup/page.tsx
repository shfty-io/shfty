import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/server";
import SetupPageClient from "@/components/setup/SetupPageClient";

export default async function SetupPage() {
  try {
    // Then create the Supabase client with the cookie store
    const supabase = await createServerComponentClient();
    
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      redirect("/auth/login");
    }
    
    // Fetch seller account data server-side with authenticated session
    const { data: sellerAccount, error } = await supabase
        .from('seller_accounts')
      .select('stripe_account_id, is_onboarded, github_token, account_status')
      .eq('user_id', session.user.id)
        .single();
      
    if (error && error.code === 'PGRST116') {
        // No seller account found, create one
      const { data: newSellerAccount, error: createError } = await supabase
          .from('seller_accounts')
          .insert({
          user_id: session.user.id,
            is_onboarded: false,
            account_status: 'pending'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating seller account:', createError);
        // Continue with client rendering and handle there
        return <SetupPageClient user={session.user} sellerAccount={null} error="Failed to create seller account" />;
      }
      
      return <SetupPageClient user={session.user} sellerAccount={newSellerAccount} />;
    }
    
    if (error) {
      console.error('Error fetching seller account:', error);
      return <SetupPageClient user={session.user} sellerAccount={null} error="Failed to load seller account" />;
    }
    
    return <SetupPageClient user={session.user} sellerAccount={sellerAccount} />;
  } catch (error) {
    console.error('Error in setup page:', error);
    return <div>Error loading account setup. Please try again later.</div>
  }
} 