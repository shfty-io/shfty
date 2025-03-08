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
    const { data: { user } } = await supabase.auth.getUser()
    
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
    
    return response
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=Unexpected+error+during+authentication', request.url)
    )
  }
} 