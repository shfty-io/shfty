import { createServerClient, createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This version accepts an already awaited cookies() result
export const createClient = (cookieStore?: Awaited<ReturnType<typeof cookies>>) => {
  // Don't try to automatically get cookies() as it returns a Promise
  // and should be awaited before being passed to this function

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (!cookieStore) {
            return [];
          }
          try {
            return cookieStore.getAll();
          } catch (error) {
            console.error("Error getting cookies:", error);
            return [];
          }
        },
        setAll(cookiesToSet) {
          if (!cookieStore) {
            return;
          }
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            console.error("Error setting cookies:", error);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};

// Helper function for server components
// This is a direct replacement for most createClient() usage in server components
export const createServerComponentClient = async () => {
  try {
    // Make sure to await the cookies() function
    const cookieStore = await cookies();
    return createClient(cookieStore);
  } catch (error) {
    console.error("Error accessing cookies in server component:", error);
    // Fallback to clientless version if cookies can't be accessed
    return createClient();
  }
};

// Function for client components to use
export const createClientComponentClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Service client with admin privileges for operations that require service role
export const createServiceClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
};
