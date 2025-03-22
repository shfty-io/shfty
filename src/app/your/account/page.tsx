import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/server";
import AccountSettingsClient from "@/components/account/AccountSettingsClient";

export default async function AccountPage() {
  try {
    // Then create the Supabase client with the cookie store
    const supabase = await createServerComponentClient();
    
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      redirect("/auth/login");
    }
    
    // Fetch profile data server-side with authenticated session
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_notifications_enabled, created_at, full_name, avatar_url, id')
      .eq('id', session.user.id)
      .single();
    
    if (!profile) {
      // If no profile found, something is wrong with the user's account
      console.error('No profile found for user:', session.user.id);
      return <div>Error loading your profile. Please contact support.</div>
    }
    
    return <AccountSettingsClient user={session.user} profile={profile} />;
  } catch (error) {
    console.error('Error in account page:', error);
    return <div>Error loading your account. Please try again later.</div>
  }
} 