import { createClient } from "@/lib/client";
import { NextResponse } from "next/server";

interface DownloadAuthResponse {
  githubRepoUrl: string | null;
  githubToken: string | null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const supabase = createClient();

    // Get the session
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
      .select('price, github_repo_url, github_token')
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

    if (!purchase && product.price > 0) {
      return NextResponse.json(
        { error: "Purchase required to access this product" },
        { status: 403 }
      );
    }

    const response: DownloadAuthResponse = {
      githubRepoUrl: product.github_repo_url,
      githubToken: product.github_token,
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