import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    } catch {
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=Unknown error occurred`)
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
} 