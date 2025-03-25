import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Handle GitHub OAuth callback code in URL when landing on home page
  // This happens when the callback URL doesn't properly redirect
  if (requestUrl.pathname === '/' && requestUrl.searchParams.has('code')) {
    const code = requestUrl.searchParams.get('code');
    if (code) {
      // Redirect to the callback URL to properly process the code
      const callbackUrl = new URL('/auth/callback', requestUrl.origin);
      callbackUrl.searchParams.set('code', code);
      callbackUrl.searchParams.set('_t', Date.now().toString());
      return NextResponse.redirect(callbackUrl);
    }
  }
  
  // Create a response object that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add cache control headers for authentication-related routes
  if (requestUrl.pathname.startsWith('/auth/') || 
      requestUrl.pathname.startsWith('/your/') ||
      requestUrl.pathname.startsWith('/admin/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Set cookies properly in the response - this is what matters
          response.cookies.set({
            name,
            value,
            ...options,
            path: options?.path || '/',
            sameSite: options?.sameSite || 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            // Set a longer expiration time for better persistence
            maxAge: options?.maxAge || 60 * 60 * 24 * 30 // 30 days default
          });
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            path: '/',
            maxAge: 0,
          });
        },
      },
    }
  );

  // Refresh session if it exists with improved error handling
  try {
    // Check if we already have auth cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;
    
    // If we have tokens but are trying to access auth routes, check if session is valid
    if ((accessToken || refreshToken) && 
        (requestUrl.pathname.startsWith('/your') || 
         requestUrl.pathname.startsWith('/admin'))) {
      
      // Try to access and refresh the session
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Session is invalid, clear cookies and redirect to login
        console.error("Error refreshing session in middleware:", error);
        // Clear expired cookies if session error occurs
        response.cookies.set({
          name: 'sb-access-token',
          value: '',
          path: '/',
          maxAge: 0,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        response.cookies.set({
          name: 'sb-refresh-token',
          value: '',
          path: '/',
          maxAge: 0,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('message', 'Your session has expired. Please sign in again.');
        return NextResponse.redirect(redirectUrl);
      }
    } else if (!accessToken && !refreshToken) {
      // No session found - this is normal for unauthenticated users
      // Redirect to login if trying to access protected routes
      if (requestUrl.pathname.startsWith('/your') || requestUrl.pathname.startsWith('/admin')) {
        const redirectUrl = new URL('/auth/login', request.url);
        // Add the current URL as a redirect parameter
        redirectUrl.searchParams.set('redirect', requestUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } 
  } catch (err) {
    console.error("Failed to refresh session in middleware:", err);
    // If there's an error checking authentication, redirect to login for protected routes
    if (requestUrl.pathname.startsWith('/your') || requestUrl.pathname.startsWith('/admin')) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('message', 'Your session has expired. Please sign in again.');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Ensure no caching for authenticated routes
  const authPaths = ['/your', '/admin', '/settings', '/account'];
  if (authPaths.some(path => requestUrl.pathname.startsWith(path))) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

// Add middleware configuration to specify which routes it should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

