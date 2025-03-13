import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from '@/lib/csrf';
import { cookies } from 'next/headers';

interface DownloadAuthResponse {
  githubRepoUrl: string | null;
  githubToken: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Log the request for debugging
    console.log('Download auth request for product:', params.id);

    // Extract the ID from the params instead of the URL
    const id = params.id;
    
    // CSRF validation - make this optional for GET requests since they're idempotent
    const csrfValidationResult = await validateCsrfToken(request);
    if (!csrfValidationResult) {
      console.log('CSRF validation failed, but continuing as GET request');
      // Continue anyway for GET requests
    }
    
    const supabase = createClient(await cookies());

    // Get the session - required for all downloads (free or paid)
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.log('No session found - auth required');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select('price, github_repo_url, github_token')
      .eq('id', id)
      .single();

    if (productError || !product) {
      console.error('Product not found error:', productError);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Debug log the product info
    console.log('Product details found:', {
      id,
      price: product.price,
      hasGithubUrl: !!product.github_repo_url
    });

    // Get user's profile to get github username if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_username')
      .eq('user_id', session.user.id)
      .single();
    
    // Use the github username from profile, or default to a placeholder
    const githubUsername = profile?.github_username || 'user-' + session.user.id.substring(0, 8);

    // Check if the user has purchased the product
    const { data: purchase } = await supabase
      .from('purchases')
      .select()
      .eq('product_id', id)
      .eq('user_id', session.user.id)
      .single();

    // For paid products, require a purchase record
    if (!purchase && product.price > 0) {
      console.log('Purchase required for paid product');
      return NextResponse.json(
        { error: "Purchase required to access this product" },
        { status: 403 }
      );
    }

    // For free products, record a purchase if there isn't one already
    if (!purchase && product.price === 0) {
      console.log('Recording free purchase for user:', session.user.id);
      // Record the free purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          product_id: id,
          user_id: session.user.id,
          github_username: githubUsername, // Required field
          status: 'completed',
          // No amount field - it doesn't exist in the schema
        });

      if (purchaseError) {
        console.error('Error recording free purchase:', purchaseError);
        // Continue anyway as this isn't critical
      }
    }

    console.log('Returning successful response with URLs');
    const response: DownloadAuthResponse = {
      githubRepoUrl: product.github_repo_url,
      githubToken: product.github_token
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