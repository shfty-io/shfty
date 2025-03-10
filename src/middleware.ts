import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
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

  // Refresh session if it exists with error handling
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error refreshing session in middleware:", error);
    }
  } catch (err) {
    console.error("Failed to refresh session in middleware:", err);
  }

  return response;
}

// Add middleware configuration to specify which routes it should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

