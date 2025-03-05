import { NextResponse } from "next/server";
import { createMiddlewareClient } from '@/lib/server';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

export async function POST(request: Request) {
  // Create a response object that we'll modify and return
  const response = new Response();
  
  try {
    // Create Supabase client with the request cookies for authentication
    const supabase = createMiddlewareClient(request, response);
    
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
      const { data, error } = await supabase.rpc('delete_user', {
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

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all devices
    });

    if (signOutError) {
      console.error('Error signing out user:', signOutError);
      // Continue anyway since the profile and data are already deleted
    }

    // Clear all cookies to ensure the user is fully signed out
    const cookies = request.headers.get('cookie')?.split(';') || [];
    for (const cookie of cookies) {
      const [name] = cookie.trim().split('=');
      if (name && (name.includes('supabase') || name.includes('auth') || name.includes('session'))) {
        response.headers.append('Set-Cookie', `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
      }
    }

    // Create a service role client to delete the auth user
    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            // Get the cookie from the request headers
            const cookies = request.headers.get('cookie') || '';
            const cookie = cookies
              .split(';')
              .find(c => c.trim().startsWith(`${name}=`));
            
            if (!cookie) return '';
            const value = cookie.split('=')[1];
            return decodeURIComponent(value);
          },
          set(name: string, value: string, options: any) {
            // Not needed for this operation
          },
          remove(name: string, options: any) {
            // Not needed for this operation
          }
        }
      }
    );

    // Delete the auth user
    const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Continue anyway since the profile and data are already deleted
    }

    // Redirect to the login page instead of returning JSON
    return NextResponse.redirect(
      new URL('/auth/login?message=Your+account+has+been+successfully+deleted', request.url),
      { headers: response.headers }
    );
  } catch (error) {
    console.error('Unexpected error during account deletion:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 