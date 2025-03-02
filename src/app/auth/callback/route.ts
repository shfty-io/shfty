import { createClient } from '@/lib/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  
  // Get the returnTo path (where to redirect after successful auth)
  const returnTo = requestUrl.searchParams.get('returnTo') || '/'
  
  // Make sure we have the code parameter
  if (!code) {
    console.error('No code provided in callback')
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('No authentication code provided')}`, origin)
    )
  }
  
  try {
    // Create Supabase client for this request, with cookies
    const supabase = createClient()
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
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
    
    // Success! Redirect to the return path
    const redirectUrl = new URL(returnTo, origin)
    
    return NextResponse.redirect(redirectUrl)
  } catch (error: any) {
    console.error('Auth callback error:', error)
    const errorMessage = error?.message || 'Unknown authentication error occurred'
    
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, origin)
    )
  }
} 