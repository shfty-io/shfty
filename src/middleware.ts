import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Create a response object to modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          });
        },
        remove(name) {
          response.cookies.set({
            name,
            value: '',
            path: '/',
            maxAge: 0,
          });
        },
      },
    }
  );

  // Check session status
  const { data: { session } } = await supabase.auth.getSession();

  // Protect routes that require authentication
  if ((!session) && 
      (requestUrl.pathname.startsWith('/your') || 
       requestUrl.pathname.startsWith('/admin'))) {
    const redirectUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Set no-cache headers for authenticated routes
  if (requestUrl.pathname.startsWith('/your') || 
      requestUrl.pathname.startsWith('/admin') || 
      requestUrl.pathname.startsWith('/auth/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return response;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};

