import { createServerClient, createBrowserClient } from "@supabase/ssr";
import type { NextApiRequest, NextApiResponse } from 'next';

// For pages directory API routes and getServerSideProps
export const createPagesServerClient = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies[name];
        },
        set(name, value, options) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=${options?.path || '/'}; ${options?.maxAge ? `Max-Age=${options.maxAge};` : ''} ${options?.sameSite ? `SameSite=${options.sameSite};` : ''} ${options?.secure ? 'Secure;' : ''} ${options?.httpOnly ? 'HttpOnly;' : ''}`);
        },
        remove(name, options) {
          res.setHeader('Set-Cookie', `${name}=; Path=${options?.path || '/'}; Max-Age=0; ${options?.sameSite ? `SameSite=${options.sameSite};` : ''} ${options?.secure ? 'Secure;' : ''} ${options?.httpOnly ? 'HttpOnly;' : ''}`);
        },
      },
    }
  );
};

// For client-side usage in pages directory
export const createPagesClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}; 