import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params)
  
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
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('price, codebase_url, github_repo_url')
      .eq('id', id)
      .single()

    console.log('Product details:', { id, product }) // Debug log

    if (!product || productError) {
      console.error('Product error:', productError)
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
        .eq('product_id', id)
        .single()

      console.log('Purchase check:', { userId: user.id, productId: id, purchase }) // Debug log

      if (!purchase) {
        return NextResponse.json(
          { error: "Purchase not found" },
          { status: 403 }
        )
      }
    }

    // Return both URLs if available
    const response: { 
      downloadUrl?: string, 
      githubRepoUrl?: string 
    } = {}

    if (product.github_repo_url) {
      response.githubRepoUrl = product.github_repo_url
    }

    if (product.codebase_url) {
      response.downloadUrl = product.codebase_url
    }

    if (!response.downloadUrl && !response.githubRepoUrl) {
      console.error('No download options available for product:', id)
      return NextResponse.json(
        { error: "No download options available" },
        { status: 404 }
      )
    }

    console.log('Sending response:', response) // Debug log
    return NextResponse.json(response)
  } catch (error) {
    console.error('Download auth error:', error)
    return NextResponse.json(
      { error: "Failed to authorize download" },
      { status: 500 }
    )
  }
} 