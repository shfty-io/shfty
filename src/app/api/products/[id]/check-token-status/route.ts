import { createClient } from '@/lib/server';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const supabase = createClient(await cookies());

    // First, get the product and check if it uses GitHub
    const { data: product } = await supabase
      .from('products')
      .select('id, user_id, github_repo_url')
      .eq('id', id)
      .single();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If the product doesn't use GitHub, no need to check token status
    if (!product.github_repo_url) {
      return NextResponse.json({ status: 'not_applicable' });
    }

    // Get the seller's token status
    const { data: sellerAccount } = await supabase
      .from('seller_accounts')
      .select('github_token, token_status, token_last_verified')
      .eq('user_id', product.user_id)
      .single();

    if (!sellerAccount || !sellerAccount.github_token) {
      return NextResponse.json({ status: 'missing' });
    }

    // If we already know the token status, return it
    if (sellerAccount.token_status) {
      return NextResponse.json({ status: sellerAccount.token_status });
    }

    // If we don't know the token status yet, check it now
    const scopeResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${sellerAccount.github_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    const isValid = scopeResponse.ok;
    const tokenStatus = isValid ? 'valid' : 'expired';

    // Update the token status in the database
    await supabase
      .from('seller_accounts')
      .update({
        token_status: tokenStatus,
        token_last_verified: new Date().toISOString()
      })
      .eq('user_id', product.user_id);

    return NextResponse.json({ status: tokenStatus });
  } catch (error) {
    console.error('Error checking token status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check token status' },
      { status: 500 }
    );
  }
} 