import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  
  // Get the returnTo path (where to redirect after successful auth)
  const returnTo = requestUrl.searchParams.get('returnTo') || '/'
  
  // Log all parameters for debugging
  console.log('Auth callback params:', {
    code: code ? 'present' : 'missing',
    returnTo
  })
  
  // Make sure we have the code parameter
  if (!code) {
    console.error('No code provided in callback')
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('No authentication code provided')}`, origin)
    )
  }
  
  // Create a response early so we can use it for cookies
  const response = NextResponse.redirect(new URL(returnTo, origin))
  
  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  try {
    // Create Supabase client using the native createServerClient
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookie = request.cookies.get(name)
            return cookie?.value
          },
          set(name, value, options) {
            // Set the cookie on the response
            response.cookies.set({
              name, 
              value,
              ...options
            })
          },
          remove(name, options) {
            // Remove the cookie from the response
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0
            })
          }
        }
      }
    )
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Session exchange error:', error)
      
      let errorMessage = 'Authentication failed'
      
      // Handle known error types
      if (error.message.includes('code verifier')) {
        errorMessage = 'Authentication verification failed - Please try again'
      } else if (error.status === 401) {
        errorMessage = 'Invalid authentication credentials'
      } else if (error.message) {
        errorMessage = `Auth error: ${error.message}`
      }
      
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, origin)
      )
    }
    
    // Get the user to ensure profile creation
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      // If no profile exists, create one
      if (profileError?.code === 'PGRST116' || !profile) {
        console.log('Creating profile for user:', user.id);
        
        // Create profile
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            is_seller: false,
            is_admin: false,
            github_username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || '',
            email_notifications_enabled: true
          });
          
        if (insertProfileError) {
          console.error('Profile creation failed:', insertProfileError);
        } else {
          console.log('Profile created successfully');
          
          // Create seller account
          const { error: insertSellerError } = await supabase
            .from('seller_accounts')
            .insert({
              user_id: user.id,
              is_onboarded: false,
              account_status: 'pending'
            });
            
          if (insertSellerError) {
            console.error('Seller account creation failed:', insertSellerError);
          } else {
            console.log('Seller account created successfully');
          }
        }
      } else {
        // Check if seller account exists
        const { data: sellerAccount, error: sellerError } = await supabase
          .from('seller_accounts')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (sellerError?.code === 'PGRST116' || !sellerAccount) {
          console.log('Creating seller account for existing profile');
          
          const { error: createSellerError } = await supabase
            .from('seller_accounts')
            .insert({
              user_id: user.id,
              is_onboarded: false,
              account_status: 'pending'
            });
            
          if (createSellerError) {
            console.error('Seller account creation failed:', createSellerError);
          }
        }
      }
    }
    
    // Return the response with cookies already set
    return response
  } catch (error: unknown) {
    console.error('Auth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error occurred'
    
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, origin)
    )
  }
} 