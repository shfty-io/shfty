import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${error.message}`)
      }

      // Successful authentication, redirect to home page
      return NextResponse.redirect(`${requestUrl.origin}/`)
    } catch (error) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Unknown error occurred`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=No code provided`)
} 