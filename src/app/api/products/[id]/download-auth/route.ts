import { createClient } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from '@/lib/csrf';

interface DownloadAuthResponse {
  githubRepoUrl: string | null;
  githubToken: string | null;
  downloadUrl?: string | null;
}

export async function GET(
  request: NextRequest
) {
  try {
    // CSRF validation
    if (!(await validateCsrfToken(request))) {
      return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Extract the ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // -2 because the last part is 'download-auth'
    
    const supabase = createClient();

    // Get the session - required for all downloads (free or paid)
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select('price, github_repo_url, github_token, codebase_url')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if the user has purchased the product
    const { data: purchase } = await supabase
      .from('purchases')
      .select()
      .eq('product_id', id)
      .eq('user_id', session.user.id)
      .single();

    // For paid products, require a purchase record
    if (!purchase && product.price > 0) {
      return NextResponse.json(
        { error: "Purchase required to access this product" },
        { status: 403 }
      );
    }

    // For free products, record a purchase if there isn't one already
    if (!purchase && product.price === 0) {
      // Record the free purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          product_id: id,
          user_id: session.user.id,
          amount: 0,
          payment_method: 'free',
          status: 'completed'
        });

      if (purchaseError) {
        console.error('Error recording free purchase:', purchaseError);
        // Continue anyway as this isn't critical
      }
    }

    let downloadUrl = null;
    
    // Generate a download URL if the product has a codebase_url
    if (product.codebase_url) {
      const { data, error: downloadError } = await supabase
        .storage
        .from('products')
        .createSignedUrl(product.codebase_url, 60 * 60); // 1 hour expiry
      
      if (!downloadError && data?.signedUrl) {
        downloadUrl = data.signedUrl;
      }
    }

    const response: DownloadAuthResponse = {
      githubRepoUrl: product.github_repo_url,
      githubToken: product.github_token,
      downloadUrl: downloadUrl
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in download-auth:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 