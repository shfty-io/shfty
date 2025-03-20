import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token is required" },
        { status: 400 }
      );
    }

    // Verify the token has the required scopes by making a test API call
    const scopeResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    if (!scopeResponse.ok) {
      return NextResponse.json(
        { error: "Invalid GitHub token" },
        { status: 400 }
      );
    }

    // Check if the token has the required scopes
    const scopes = scopeResponse.headers.get('x-oauth-scopes')?.split(',').map(s => s.trim());
    const hasRequiredScopes = scopes?.some(s => s === 'repo' || s === 'repo:invite');

    if (!hasRequiredScopes) {
      return NextResponse.json(
        { error: "GitHub token must have 'repo' or 'repo:invite' scope" },
        { status: 400 }
      );
    }

    // First, check if a seller account already exists for this user
    const { data: existingAccount } = await supabase
      .from('seller_accounts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let error;

    if (existingAccount) {
      // If account exists, update it
      const { error: updateError } = await supabase
        .from('seller_accounts')
        .update({
          github_token: token,
          token_status: 'valid',
          token_last_verified: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      error = updateError;
    } else {
      // If no account exists, create one
      const { error: insertError } = await supabase
        .from('seller_accounts')
        .insert({
          user_id: user.id,
          github_token: token,
          token_status: 'valid',
          token_last_verified: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      error = insertError;
    }

    if (error) {
      console.error('Error saving GitHub token:', error);
      return NextResponse.json(
        { error: "Failed to save GitHub token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "GitHub token saved successfully" 
    });
  } catch (error) {
    console.error('Error saving GitHub token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save GitHub token" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clear the GitHub token
    const { error } = await supabase
      .from('seller_accounts')
      .update({
        github_token: null,
        token_status: null,
        token_last_verified: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting GitHub token:', error);
      return NextResponse.json(
        { error: "Failed to delete GitHub token" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "GitHub token removed successfully" 
    });
  } catch (error) {
    console.error('Error deleting GitHub token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete GitHub token" },
      { status: 500 }
    );
  }
} 