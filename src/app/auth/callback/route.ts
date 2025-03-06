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
    returnTo,
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  })
  
  // Make sure we have the code parameter
  if (!code) {
    console.error('No code provided in callback. URL params:', Object.fromEntries(requestUrl.searchParams.entries()))
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('No authentication code provided')}`, origin)
    )
  }
  
  // Create a response early so we can use it for cookies
  const response = NextResponse.redirect(new URL(returnTo, origin))
  
  try {
    // Create Supabase client using the native createServerClient
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookie = request.cookies.get(name)
            console.log(`Getting cookie ${name}:`, cookie ? 'found' : 'not found')
            return cookie?.value
          },
          set(name, value, options) {
            console.log(`Setting cookie ${name}`)
            // Set the cookie on both the request and response
            response.cookies.set({
              name, 
              value,
              ...options
            })
          },
          remove(name, options) {
            console.log(`Removing cookie ${name}`)
            // Remove the cookie from both the request and response
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
    
    console.log('Exchanging code for session...')
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
    
    console.log('Session exchange successful, redirecting to:', returnTo)
    // Success! Return the response with cookies already set
    return response
  } catch (error: unknown) {
    console.error('Auth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error occurred'
    
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, origin)
    )
  }
} 