import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies()
            return cookieStore.get(name)?.value
          },
          async set(name: string, value: string, options: any) {
            try {
              const cookieStore = await cookies()
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle cookie error in dev - cookies() cannot be modified in route handlers
            }
          },
          async remove(name: string, options: any) {
            try {
              const cookieStore = await cookies()
              cookieStore.delete({ name, ...options })
            } catch (error) {
              // Handle cookie error in dev - cookies() cannot be modified in route handlers
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(requestUrl.origin)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-error`)
} 