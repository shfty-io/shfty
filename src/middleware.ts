import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Create an unmodified response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
            // Use domain attribute based on environment
            ...(process.env.NODE_ENV === 'production' && {
              secure: true,
              domain: process.env.VERCEL_URL ? `.${process.env.VERCEL_URL.split('://')[1]}` : undefined
            })
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
            ...(process.env.NODE_ENV === 'production' && {
              secure: true,
              domain: process.env.VERCEL_URL ? `.${process.env.VERCEL_URL.split('://')[1]}` : undefined
            })
          });
        },
      },
    }
  );
  
  // Actually fetch the session to ensure proper auth state
  await supabase.auth.getSession();
  
  return response;
}

