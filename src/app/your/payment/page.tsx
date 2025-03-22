"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/client';
import { User } from '@supabase/supabase-js';
import { EarningsPanel } from '@/components/earnings/EarningsPanel';
import { Loader2 } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const supabase = createClient();
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Auth error in payment page:', error);
          router.push('/auth/login?redirect=/your/payment');
          return;
        }
        
        setUser(user);
        
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [supabase, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return null; // User redirected, don't render anything
  
  return (
    <div className="container mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>

      {/* Earnings Panel */}
      <EarningsPanel />
    </div>
  );
} 