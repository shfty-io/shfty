import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  const code = requestUrl.searchParams.get('code')
  
  if (!code) {
    console.error('No code parameter found in auth callback')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const redirectTo = requestUrl.searchParams.get('returnTo') || '/'
  
  // Ensure proper URL construction using origin from the request
  const targetUrl = new URL(redirectTo, requestUrl.origin)
  
  const response = NextResponse.redirect(targetUrl)
  
  // Set cache control headers early to prevent issues
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // Set more production-friendly cookie options
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
            // Don't set SameSite=strict as it can break OAuth redirects
            sameSite: 'lax',
            secure: requestUrl.protocol === 'https:',
            // Add this to ensure cookies work in iframe contexts (if needed)
            // partitioned: false, // Only include if needed and supported
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            path: '/',
            maxAge: 0,
          })
        },
      },
    }
  )

  try {
    // Try to exchange code for session multiple times if needed (up to 2 retries)
    let sessionSuccess = false
    let retries = 0
    let error;
    
    while (!sessionSuccess && retries < 3) {
      const result = await supabase.auth.exchangeCodeForSession(code)
      error = result.error
      
      if (!error) {
        sessionSuccess = true
        break
      }
      
      console.error(`Session exchange failed on try ${retries + 1}:`, error.message)
      retries++
      
      if (retries < 3) {
        // Wait a short time before retrying
        await new Promise(r => setTimeout(r, 500))
      }
    }
    
    if (error) {
      console.error('All attempts to exchange code for session failed:', error.message)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    
    // Get current user after session exchange
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user after session exchange:', userError)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent('Failed to retrieve user details')}`, request.url)
      )
    }

    // Ensure a proper session is established
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      console.error('Session error after code exchange:', sessionError)
      
      // Try to explicitly sign in with OAuth credentials from user object
      if (user.app_metadata && user.app_metadata.provider) {
        // Redirect to OAuth flow again
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent('Session creation failed, please try again')}`, request.url)
        )
      }
    }
    
    // Create/update profile if user exists
    if (user) {
      // Track if this is a new user or existing user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      const isNewUser = !existingProfile
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            github_username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || '',
            email_notifications_enabled: true
          },
          { onConflict: 'id' }
        )
      
      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
      
      // Send welcome email only for new users
      if (isNewUser && user.email) {
        try {
          await sendWelcomeEmail({
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't block the authentication flow if email fails
        }
      }
      
      // Check/create seller account
      const { data: sellerAccount } = await supabase
        .from('seller_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!sellerAccount) {
        await supabase
          .from('seller_accounts')
          .insert({
            user_id: user.id,
            is_onboarded: false,
            account_status: 'pending'
          })
      }
    }
    
    // Verify one more time that we have a session before redirecting
    const { data: finalSession } = await supabase.auth.getSession()
    if (!finalSession.session) {
      return NextResponse.redirect(
        new URL('/auth/login?error=Failed+to+create+session', request.url)
      )
    }
    
    return response
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=Unexpected+error+during+authentication', request.url)
    )
  }
} 