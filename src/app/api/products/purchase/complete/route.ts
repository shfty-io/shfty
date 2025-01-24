import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

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
          github_token
        )
      `)
      .eq('id', productId)
      .single();

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
    if (product.githubRepoUrl && product.private) {
      // Extract owner and repo from GitHub URL
      const [owner, repo] = product.githubRepoUrl.split('/').slice(-2);
      
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
        console.error('GitHub API error:', await response.text());
        return NextResponse.json(
          { error: "Failed to grant repository access" },
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
      message: "Purchase completed. You now have access to the repository on GitHub."
    });
  } catch (error) {
    console.error('Purchase completion error:', error);
    return NextResponse.json(
      { error: "Failed to complete purchase" },
      { status: 500 }
    );
  }
} 