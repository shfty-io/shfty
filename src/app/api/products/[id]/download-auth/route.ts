import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get product details first
    const { data: product } = await supabase
      .from('products')
      .select('price, codebase_url, github_repo_url')
      .eq('id', params.id)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // For paid products, verify purchase
    if (product.price > 0) {
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', params.id)
        .single()

      if (!purchase) {
        return NextResponse.json(
          { error: "Purchase not found" },
          { status: 404 }
        )
      }
    }

    // Return GitHub URL if available
    if (product.github_repo_url) {
      return NextResponse.json({ 
        githubRepoUrl: product.github_repo_url 
      })
    }

    // Generate download URL for codebase
    if (!product.codebase_url) {
      return NextResponse.json(
        { error: "No codebase available" },
        { status: 404 }
      )
    }

    const { data: downloadData, error: downloadError } = await supabase
      .storage
      .from('products')
      .createSignedUrl(product.codebase_url, 60 * 60) // 1 hour expiry

    if (downloadError || !downloadData?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({ downloadUrl: downloadData.signedUrl })
  } catch (error) {
    console.error('Download auth error:', error)
    return NextResponse.json(
      { error: "Failed to authorize download" },
      { status: 500 }
    )
  }
} 