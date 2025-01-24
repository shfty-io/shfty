import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check purchase status
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', params.id)
      .single();

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('codebase_url, github_repo_url')
      .eq('id', params.id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Return GitHub URL if available
    if (product.github_repo_url) {
      return NextResponse.json({ 
        githubRepoUrl: product.github_repo_url 
      });
    }

    // Existing ZIP file handling
    if (!product.codebase_url) {
      return NextResponse.json(
        { error: "No codebase available" },
        { status: 404 }
      );
    }

    // Generate signed URL for ZIP
    const { data, error } = await supabase.storage
      .from('codebases')
      .createSignedUrl(
        product.codebase_url.split('/').pop()!,
        60 * 5 // 5 minute expiry
      );

    return NextResponse.json({ downloadUrl: data?.signedUrl });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 