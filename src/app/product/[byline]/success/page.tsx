import { createClient, createServerComponentClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { SuccessPageContent } from './page.client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
})

async function getSessionAndProduct(sessionId: string, byline: string) {
  try {
    const supabase = await createServerComponentClient()

    // 1. Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session || session.payment_status !== 'paid') {
      console.error('Invalid or unpaid session:', sessionId)
      return null
    }

    // 2. Get the product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        profiles!inner (
          id,
          github_username,
          is_seller
        )
      `)
      .eq(byline.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'id' : 'byline', byline)
      .single()

    if (productError || !product) {
      console.error('Product not found:', byline, productError)
      return null
    }

    // 3. Get the current buyer's details
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User not found:', userError)
      return null
    }

    const buyerGithubUsername = user.user_metadata?.user_name
    if (!buyerGithubUsername) {
      console.error('Buyer GitHub username not found')
      return null
    }

    // 4. Record the purchase first
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        product_id: product.id,
        status: 'completed',
        github_username: buyerGithubUsername
      })

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError)
      return null
    }

    // 5. If there's a GitHub repo, handle repository access
    if (product.github_repo_url) {
      // Check if product has GitHub token
      if (!product.github_token) {
        console.error('GitHub token not found for product:', product.id)
        return { session, product, githubAccessPending: true }
      }

      try {
        // Parse GitHub URL
        const cleanUrl = product.github_repo_url.trim().replace(/\/$/, '')
        const githubUrl = new URL(cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`)
        const parts = githubUrl.pathname.split('/').filter(Boolean)

        if (parts.length !== 2) {
          throw new Error('Invalid GitHub repository URL format')
        }

        const [owner, repo] = parts

        // Verify token permissions
        const verifyResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${product.github_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })

        if (!verifyResponse.ok) {
          console.error('Invalid GitHub token:', await verifyResponse.text())
          return { session, product, githubAccessPending: true }
        }

        // Add collaborator
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/collaborators/${buyerGithubUsername}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${product.github_token}`,
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({ permission: 'pull' })
          }
        )

        if (!response.ok) {
          console.error('GitHub API error:', {
            status: response.status,
            error: await response.text()
          })
          return { session, product, githubAccessPending: true }
        }

        // Record successful access
        await supabase
          .from('repository_access')
          .insert({
            user_id: user.id,
            product_id: product.id,
            repository_url: product.github_repo_url,
            access_key: buyerGithubUsername
          })
          .single()

      } catch (error) {
        console.error('Error granting repository access:', error)
        return { session, product, githubAccessPending: true }
      }
    }

    return { session, product, githubAccessPending: false }
  } catch (error) {
    console.error('Error in getSessionAndProduct:', error)
    return null
  }
}

// Define types for the page props
type Params = Promise<{ byline: string }>;
type SearchParams = Promise<{ session_id?: string }>;

interface SuccessPageProps {
  params: Params;
  searchParams: SearchParams;
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  // Handle params and searchParams asynchronously
  const { byline } = await params;
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    redirect(`/product/${byline}`);
  }

  // Get session and product details
  const result = await getSessionAndProduct(sessionId, byline);

  if (!result) {
    return <SuccessPageContent status="session-not-found" byline={byline} />;
  }

  const { product, githubAccessPending } = result

  // Check if product has a GitHub repo URL
  if (product.github_repo_url) {
    return (
      <SuccessPageContent 
        status={githubAccessPending ? "github-pending" : "success"}
        product={{
          id: product.id,
          name: product.name,
          github_repo_url: product.github_repo_url
        }}
        byline={byline}
      />
    );
  }

  // Generate download URL for products with codebase
  if (!product.codebase_url) {
    return <SuccessPageContent status="download-error" byline={byline} />;
  }

  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .storage
    .from('products')
    .createSignedUrl(product.codebase_url, 60 * 60) // 1 hour expiry

  if (error || !data?.signedUrl) {
    return <SuccessPageContent status="download-error" product={{ id: product.id, name: product.name }} byline={byline} />;
  }

  return (
    <SuccessPageContent 
      status="success" 
      product={{ id: product.id, name: product.name }}
      downloadUrl={data.signedUrl}
      byline={byline}
    />
  );
} 