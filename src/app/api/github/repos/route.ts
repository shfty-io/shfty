import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Add interface at the top of the file after imports
interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  visibility: string;
  updated_at: string;
  owner: {
    login: string;
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", requiresReauth: true },
        { status: 401 }
      );
    }

    // Get the user's GitHub access token from their session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return NextResponse.json(
        { error: "Session not found", requiresReauth: true },
        { status: 401 }
      );
    }

    const providerToken = sessionData.session.provider_token;

    if (!providerToken) {
      return NextResponse.json(
        { error: "GitHub authentication required", requiresReauth: true },
        { status: 401 }
      );
    }

    // Test the token's scopes first
    const scopeResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    if (!scopeResponse.ok) {
      // If the token is invalid or expired, indicate that re-authentication is required
      if (scopeResponse.status === 401) {
        return NextResponse.json(
          { error: "GitHub token expired", requiresReauth: true },
          { status: 401 }
        );
      }
      console.error('Failed to verify token:', await scopeResponse.text());
      return NextResponse.json(
        { error: "Invalid GitHub token", requiresReauth: true },
        { status: 401 }
      );
    }

    // Log the scopes we have access to
    const scopes = scopeResponse.headers.get('x-oauth-scopes');
    // console.log('Available scopes:', scopes);

    // Check if we have the required scope
    if (!scopes?.includes('repo')) {
      return NextResponse.json(
        { error: "Insufficient GitHub permissions. Repository access required.", requiresReauth: true },
        { status: 401 }
      );
    }

    // Modified GitHub API call to explicitly request all repositories including private ones
    const response = await fetch('https://api.github.com/user/repos?sort=updated&visibility=all&affiliation=owner,collaborator&per_page=100', {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      throw new Error(`Failed to fetch repositories: ${errorText}`);
    }

    const repositories = await response.json();
    
    // Format response to include needed repository information
    const formattedRepos = repositories.map((repo: GitHubRepository) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      private: repo.private,
      visibility: repo.visibility,
      updated_at: repo.updated_at,
      owner: {
        login: repo.owner.login
      }
    }));

    return NextResponse.json({ repositories: formattedRepos });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
} 