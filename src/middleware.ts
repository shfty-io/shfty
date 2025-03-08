import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Create an unmodified response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  const host = request.headers.get('host') || '';
  
  // Determine cookie domain for production
  let cookieDomain = undefined;
  
  if (isProduction) {
    // Extract the domain without port
    const hostParts = host.split(':')[0];
    
    if (hostParts === 'localhost') {
      cookieDomain = undefined;
    } else if (hostParts.includes('.')) {
      // For custom domains like shfty.io
      cookieDomain = hostParts;
    } else if (process.env.VERCEL_URL) {
      cookieDomain = process.env.VERCEL_URL.split('://')[1];
    }
  }

  // Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // This is used for setting cookies in the request to the server
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // This is used for setting cookies in the response to the client
          response.cookies.set({
            name,
            value,
            ...options,
            // Force path to be root to ensure cookies are accessible everywhere
            path: '/',
            // Use secure in production
            secure: isProduction,
            // Set a long expiry for session persistence
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            // Set domain in production
            ...(cookieDomain && { domain: cookieDomain })
          });
        },
        remove(name, options) {
          // This is used for removing cookies from the request to the server
          request.cookies.delete(name);
          // This is used for removing cookies from the response to the client
          response.cookies.set({
            name,
            value: '',
            ...options,
            path: '/', // Ensure the path matches where cookies were set
            maxAge: 0,
            secure: isProduction,
            // Set domain in production
            ...(cookieDomain && { domain: cookieDomain })
          });
        },
      },
    }
  );
  
  // Check for code parameter in URL and redirect to callback if found
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (code && url.pathname === '/') {
    console.log('Auth code detected in middleware, redirecting to callback...');
    const callbackUrl = new URL('/auth/callback', url.origin);
    callbackUrl.searchParams.set('code', code);
    callbackUrl.searchParams.set('returnTo', '/');
    return NextResponse.redirect(callbackUrl);
  }
  
  // Actually fetch the session to ensure proper auth state
  await supabase.auth.getSession();
  
  return response;
}

