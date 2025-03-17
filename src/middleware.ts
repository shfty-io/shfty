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
          request.cookies.set({
            name,
            value,
            ...options,
          });
          
          // Set more production-friendly cookie options
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
            // Use lax for auth cookies to work with redirects
            sameSite: 'lax',
            secure: requestUrl.protocol === 'https:',
          });
        },
        remove(name, options) {
          request.cookies.delete(name);
          
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
      // console.log("No session found in middleware");
    } else {
      // Session found and refreshed successfully
      // console.log("Session refreshed successfully in middleware");
    }
  } catch (err) {
    console.error("Failed to refresh session in middleware:", err);
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

