import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ products: [] })
  }

  const supabase = createClient(await cookies())

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, description, price, images')
    .textSearch('title', query)
    .or(`description.ilike.%${query}%`)
    .limit(20)

  if (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }

  return NextResponse.json({ products })
} 