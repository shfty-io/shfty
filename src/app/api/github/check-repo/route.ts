import { NextResponse } from 'next/server';

/**
 * Parse a GitHub repository URL to extract owner and repo
 * Handles formats like:
 * - https://github.com/username/repo
 * - https://github.com/username/repo.git
 * - github.com/username/repo
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Clean the URL
    const cleanUrl = url.trim().replace(/\.git$/, '');
    
    // Extract the path portion
    let path;
    try {
      const urlObj = new URL(cleanUrl);
      if (urlObj.hostname !== 'github.com') {
        return null;
      }
      path = urlObj.pathname.substring(1); // remove leading slash
    } catch {
      // If URL parsing fails, try direct extraction
      if (!cleanUrl.includes('github.com/')) {
        return null;
      }
      path = cleanUrl.split('github.com/')[1];
    }
    
    // Split into owner/repo
    const parts = path.split('/');
    if (parts.length < 2) {
      return null;
    }
    
    return {
      owner: parts[0],
      repo: parts[1]
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json();
    
    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }
    
    const parsed = parseGitHubUrl(repoUrl);
    
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }
    
    const { owner, repo } = parsed;
    
    // GitHub API allows checking public repositories without authentication
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }
      
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      return NextResponse.json(
        { error: "Failed to check repository" },
        { status: response.status }
      );
    }
    
    const repoData = await response.json();
    
    return NextResponse.json({
      exists: true,
      isPublic: !repoData.private,
      repoInfo: {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        html_url: repoData.html_url,
        description: repoData.description,
        private: repoData.private,
        owner: {
          login: repoData.owner.login,
          avatar_url: repoData.owner.avatar_url
        }
      }
    });
  } catch (error) {
    console.error('Error checking repository:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check repository' },
      { status: 500 }
    );
  }
} 