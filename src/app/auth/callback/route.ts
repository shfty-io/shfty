import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const redirectTo = requestUrl.searchParams.get('returnTo') || '/'
  const response = NextResponse.redirect(new URL(redirectTo, request.url))
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
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
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error.message)
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
        const provider = user.app_metadata.provider
        console.log(`Attempting explicit sign in with ${provider}`)
        
        // Redirect to OAuth flow again
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent('Session creation failed, please try again')}`, request.url)
        )
      }
    }
    
    // Create/update profile if user exists
    if (user) {
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
          { onConflict: 'user_id' }
        )
      
      if (profileError) {
        console.error('Error updating profile:', profileError)
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
      console.log('No session found after profile creation, redirecting to login')
      return NextResponse.redirect(
        new URL('/auth/login?error=Failed+to+create+session', request.url)
      )
    }
    
    // Add cache control headers to prevent issues with stale session data
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=Unexpected+error+during+authentication', request.url)
    )
  }
} 