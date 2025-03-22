import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
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
            httpOnly: true
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
    // Try to access and refresh the session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error refreshing session in middleware:", error);
    } else if (!data.session) {
      // No session found - this is normal for unauthenticated users
      // Redirect to login if trying to access protected routes
      if (requestUrl.pathname.startsWith('/your') || requestUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } 
  } catch (err) {
    console.error("Failed to refresh session in middleware:", err);
    // If there's an error checking authentication, redirect to login for protected routes
    if (requestUrl.pathname.startsWith('/your') || requestUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
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

