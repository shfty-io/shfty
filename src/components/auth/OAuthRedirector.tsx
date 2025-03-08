'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function OAuthRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if we have a code parameter directly on the root page
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (code) {
      console.log('OAuth code detected in URL, redirecting to proper callback handler...');
      
      // Construct the proper callback URL with the code
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('code', code);
      
      // Add returnTo parameter to redirect back to home after auth
      callbackUrl.searchParams.set('returnTo', '/');
      
      // Redirect to the proper auth callback endpoint
      window.location.href = callbackUrl.toString();
    } else if (error) {
      console.error('OAuth error detected:', error);
      
      // Redirect to login page with the error
      router.push(`/auth/login?error=${encodeURIComponent(error)}`);
    }
  }, [searchParams, router]);
  
  // This component doesn't render anything
  return null;
} 