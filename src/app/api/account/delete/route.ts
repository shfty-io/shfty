import { NextResponse } from "next/server";
import { createClient, createServiceClient } from '@/lib/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    // Create Supabase client
    const supabase = createClient(await cookies());
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's profile ID first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let profileId = profile?.id;

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      
      // If the profile doesn't exist, try to create it
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, attempting to create one');
        
        // Call the ensure_user_profile function to create a profile if it doesn't exist
        const { data: ensuredProfile, error: ensureError } = await supabase.rpc(
          'ensure_user_profile',
          { auth_user_id: user.id }
        );
        
        if (ensureError) {
          console.error('Error creating profile:', ensureError);
        } else if (ensuredProfile) {
          console.log('Successfully created profile:', ensuredProfile);
          profileId = ensuredProfile;
        }
      } else {
        return NextResponse.json(
          { error: "Failed to fetch user profile: " + profileError.message },
          { status: 500 }
        );
      }
    }

    // Cancel Stripe subscriptions if the profile exists and has a Stripe customer ID
    if (profile && profile.stripe_customer_id) {
      try {
        // Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2024-12-18.acacia',
        });

        // Get all active subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
        });

        // Cancel each subscription
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
          console.log(`Cancelled subscription ${subscription.id} for user ${user.id}`);
        }
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscriptions:', stripeError);
        // Continue with account deletion even if subscription cancellation fails
      }
    }

    // Only call delete_user function if we found a profile
    if (profileId) {
      // Call the database function to delete the user with the profile ID
      const { error } = await supabase.rpc('delete_user', {
        input_profile_id: profileId
      });

      if (error) {
        console.error('Error deleting user account:', error);
        return NextResponse.json(
          { error: "Failed to delete account: " + error.message },
          { status: 500 }
        );
      }
    }

    // Create a service role client to delete the auth user BEFORE signing out
    const serviceClient = createServiceClient();

    // Delete the auth user
    const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Continue anyway since the profile and data are already deleted
    }

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all devices
    });

    if (signOutError) {
      console.error('Error signing out user:', signOutError);
      // Continue anyway since the profile and data are already deleted
    }

    // Create a response to redirect to home page
    const redirectResponse = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/?message=Your+account+has+been+successfully+deleted`,
      { status: 303 }
    );
    
    // Clear all cookies to ensure the user is fully signed out and cache is cleared
    const cookieList = request.headers.get('cookie')?.split(';') || [];
    for (const cookie of cookieList) {
      const [name] = cookie.trim().split('=');
      if (name) {
        // Clear all cookies, not just specific ones, to ensure complete cache clearing
        redirectResponse.headers.append('Set-Cookie', `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
      }
    }

    // Add cache control headers to prevent caching
    redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    redirectResponse.headers.set('Pragma', 'no-cache');
    redirectResponse.headers.set('Expires', '0');

    // Return the redirect response
    return redirectResponse;
  } catch (error) {
    console.error('Unexpected error during account deletion:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 