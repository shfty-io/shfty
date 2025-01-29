import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

interface Seller {
  github_token: string;
  github_username: string;
}

interface Product {
  id: string;
  github_repo_url: string;
  private: boolean;
  seller: Seller;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    // Get product and seller info
    const { data: product } = await supabase
      .from('products')
      .select(`
        *,
        seller:seller_id (
          github_token,
          user_metadata->>'user_name' as github_username
        )
      `)
      .eq('id', productId)
      .single() as { data: Product | null };

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get buyer's GitHub username from their session
    const { data: { session } } = await supabase.auth.getSession();
    const buyerGithubUsername = session?.user?.user_metadata?.user_name;

    if (!buyerGithubUsername) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 400 });
    }

    // If it's a private repository, add the buyer as a collaborator
    if (product.github_repo_url && product.private) {
      try {
        // Parse GitHub URL to extract owner and repo
        const githubUrl = new URL(product.github_repo_url);
        const [, owner, repo] = githubUrl.pathname.split('/').filter(Boolean);
        
        if (!owner || !repo) {
          throw new Error('Invalid GitHub repository URL format');
        }

        // Add buyer as a collaborator with read-only access
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/collaborators/${buyerGithubUsername}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${product.seller.github_token}`,
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
              permission: 'pull' // Read-only access
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error('GitHub API error:', {
            status: response.status,
            error: errorData,
            owner,
            repo,
            buyer: buyerGithubUsername
          });

          // Check if it's a token permission issue
          if (response.status === 403) {
            return NextResponse.json(
              { error: "The seller's GitHub token doesn't have permission to add collaborators. Please contact the seller." },
              { status: 403 }
            );
          }

          throw new Error(`Failed to grant repository access: ${errorData}`);
        }

        console.log(`Successfully added ${buyerGithubUsername} as collaborator to ${owner}/${repo}`);
      } catch (error) {
        console.error('Error granting repository access:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to grant repository access" },
          { status: 500 }
        );
      }
    }

    // Record the purchase
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        product_id: productId,
        github_username: buyerGithubUsername,
        status: 'completed'
      });

    if (purchaseError) throw purchaseError;

    return NextResponse.json({ 
      success: true,
      message: "Purchase completed and repository access granted. You can now access the repository on GitHub."
    });
  } catch (error) {
    console.error('Purchase completion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete purchase" },
      { status: 500 }
    );
  }
} 