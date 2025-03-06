import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// URL-safe validation regex: only allows lowercase letters, numbers, and hyphens
const BYLINE_REGEX = /^[a-z0-9-]+$/

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const byline = searchParams.get('byline')
    const currentProductId = searchParams.get('currentProductId')

    if (!byline) {
      return NextResponse.json(
        { error: "Byline parameter is required" },
        { status: 400 }
      )
    }

    // Check if byline is URL-safe
    if (!BYLINE_REGEX.test(byline)) {
      return NextResponse.json({
        available: false,
        error: "Byline can only contain lowercase letters, numbers, and hyphens"
      })
    }

    const supabase = createClient(await cookies())

    const query = supabase
      .from('products')
      .select('id')
      .eq('byline', byline)

    // If we're editing an existing product, exclude it from the check
    if (currentProductId) {
      query.neq('id', currentProductId)
    }

    const { data } = await query.maybeSingle()

    return NextResponse.json({
      available: !data,
      message: data ? "This byline is already taken" : "This byline is available"
    })
  } catch (error) {
    console.error('Error checking byline:', error)
    return NextResponse.json(
      { error: "Failed to check byline availability" },
      { status: 500 }
    )
  }
} 