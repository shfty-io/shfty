'use client';

import { useState } from 'react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    try {
      setIsLoading(true);
      console.log("Signing out user...");
      
      // Sign out using the client-side supabase instance
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        return;
      }
      
      console.log("User signed out successfully");
      
      // Force router refresh and redirect to login
      router.refresh();
      router.push('/auth/login');
    } catch (err) {
      console.error("Unexpected error during sign-out:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
} 