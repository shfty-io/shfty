"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/client';
import { User } from '@supabase/supabase-js';
import { EarningsPanel } from '@/components/earnings/EarningsPanel';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const supabase = createClient();
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Auth error in profile page:', error);
          router.push('/auth/login?redirect=/your/profile');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [supabase, router]);
  
  if (isLoading) {
    return <div className="min-h-[40vh] flex items-center justify-center">Loading profile data...</div>;
  }
  
  if (!user) return null; // User redirected, don't render anything
  
  return (
    <div className="container mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
      </div>
      
      {/* Earnings Panel */}
      <EarningsPanel />
    </div>
  );
} 