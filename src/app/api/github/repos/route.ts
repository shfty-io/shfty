import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

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
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's GitHub access token from their session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 401 }
      );
    }

    const providerToken = sessionData.session.provider_token;

    if (!providerToken) {
      return NextResponse.json(
        { error: "GitHub authentication required" },
        { status: 401 }
      );
    }

    // Add debug logging
    console.log('Fetching repositories with token:', providerToken.slice(0, 10) + '...');

    // Test the token's scopes first
    const scopeResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    if (!scopeResponse.ok) {
      console.error('Failed to verify token:', await scopeResponse.text());
      return NextResponse.json(
        { error: "Invalid GitHub token" },
        { status: 401 }
      );
    }

    // Log the scopes we have access to
    const scopes = scopeResponse.headers.get('x-oauth-scopes');
    console.log('Available scopes:', scopes);

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
    
    // Log the number of repositories and how many are private
    console.log('Total repositories:', repositories.length);
    console.log('Private repositories:', repositories.filter((repo: GitHubRepository) => repo.private).length);

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