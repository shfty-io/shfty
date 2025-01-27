import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const origin = request.headers.get('origin') || request.headers.get('referer')
    if (!origin) {
      return NextResponse.json(
        { error: 'Origin header is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        shouldCreateUser: true
      }
    })

    if (error) {
      console.error('Magic Link error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to send magic link' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Check your email for the magic link to sign in',
    })
  } catch (error) {
    console.error('Unexpected error in magic link route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 500 }
    )
  }
} 