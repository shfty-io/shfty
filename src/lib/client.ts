import { createBrowserClient } from "@supabase/ssr";

// Log environment variables to help with debugging
if (typeof window !== 'undefined') {
  console.log('Client Environment Check:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('- NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL ? 'Set' : 'Not set');
}

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
