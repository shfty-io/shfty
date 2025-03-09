'use client';

import { useState } from 'react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    try {
      setIsLoading(true);
      
      // Sign out the user
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        return;
      }
      
      // Force refresh
      router.refresh();
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (err) {
      console.error("Error during sign out:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? 'Signing Out...' : 'Sign Out'}
    </Button>
  );
} 