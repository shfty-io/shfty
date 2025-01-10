import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
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
    
    const { productId, quantity } = await req.json()
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select()
      .eq('user_id', session.user.id)
      .eq('product_id', productId)
      .single()
    
    if (existingItem) {
      // Update quantity if item exists
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
      
      if (error) throw error
    } else {
      // Insert new item if it doesn't exist
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: session.user.id,
          product_id: productId,
          quantity
        })
      
      if (error) throw error
    }
    
    return new NextResponse('Item added to cart', { status: 200 })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 