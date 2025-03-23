import { redirect } from "next/navigation";
import { createServerComponentClient, createServiceClient } from "@/lib/server";
import AccountSettingsClient from "@/components/account/AccountSettingsClient";

export default async function AccountPage() {
  try {
    // Create the Supabase client with the cookie store for auth
    const supabase = await createServerComponentClient();
    
    // Check session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      redirect("/auth/login");
    }
    
    // Use service client for database operations
    const serviceClient = createServiceClient();
    
    // Fetch profile data using service role client
    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('email_notifications_enabled, created_at, full_name, avatar_url, id, user_id')
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .single();
    
    if (error || !profile) {
      // If no profile found, something is wrong with the user's account
      console.error('No profile found for user:', user.id);
      console.error('Error details:', error);
      return <div>Error loading your profile. Please contact support.</div>
    }
    
    return <AccountSettingsClient user={user} profile={profile} />;
  } catch (error) {
    console.error('Error in account page:', error);
    return <div>Error loading your account. Please try again later.</div>
  }
} 