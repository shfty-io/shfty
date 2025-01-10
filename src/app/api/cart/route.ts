import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle cookie error in dev - cookies() cannot be modified in route handlers
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              // Handle cookie error in dev - cookies() cannot be modified in route handlers
            }
          },
        },
      }
    )
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', session.user.id)
    
    if (error) {
      return new NextResponse(error.message, { status: 500 })
    }
    
    return NextResponse.json(cartItems)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 