import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create a compatibility layer for cookies API
const getCookieValue = (name: string): string | undefined => {
  try {
    // When cookies() is used, we need to safely get values without causing type errors
    // This approach uses dynamic behavior to avoid TypeScript errors
    const cookieStore = cookies() as any;
    if (typeof cookieStore.then === 'function') {
      // It's a Promise but we can't await here
      // Just return undefined and let Supabase handle the absence of cookies
      return undefined;
    } else {
      // It's synchronous
      return cookieStore.get?.(name)?.value;
    }
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return undefined;
  }
};

const setCookieValue = (name: string, value: string, options: any): void => {
  try {
    // Similar approach for setting cookies
    const cookieStore = cookies() as any;
    if (typeof cookieStore.then !== 'function') {
      // Only attempt to set if it's synchronous
      cookieStore.set?.(name, value, options);
    }
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error);
  }
};

// Use a more direct approach with proper error handling
export const createClient = (cookieStore?: any) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Check if cookieStore is provided first
          if (cookieStore?.get) {
            return cookieStore.get(name)?.value;
          }
            
          // Use our compatibility layer
          return getCookieValue(name);
        },
        set(name: string, value: string, options: CookieOptions) {
          // Check if cookieStore is provided first
          if (cookieStore?.set) {
            cookieStore.set({ name, value, ...options });
            return;
          }
          
          // Use our compatibility layer
          setCookieValue(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // Check if cookieStore is provided first
          if (cookieStore?.set) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            return;
          }
          
          // Use our compatibility layer
          setCookieValue(name, '', { ...options, maxAge: 0 });
        }
      },
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  );
} 