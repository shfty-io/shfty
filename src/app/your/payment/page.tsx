'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";
import { PaymentSetupForm, type PaymentSetupData } from "@/components/payment/PaymentSetupForm";
import { toast } from "@/components/ui/use-toast";
import { User } from '@supabase/supabase-js';

interface SellerAccount {
  stripe_account_id: string;
  is_onboarded: boolean;
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [user, setUser] = useState<User | null>(null);
  const [sellerAccount, setSellerAccount] = useState<SellerAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData) {
          router.push('/auth/login');
          return;
        }

        setUser(userData);

        // Only fetch seller account data if we don't already have it
        if (!sellerAccount) {
          const { data: sellerData } = await supabase
            .from('seller_accounts')
            .select('stripe_account_id, is_onboarded')
            .eq('user_id', userData.id)
            .single();
          
          setSellerAccount(sellerData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]); // Remove sellerAccount from dependencies to prevent re-fetching

  const handlePaymentSetup = async (data: PaymentSetupData) => {
    try {
      if (data.isOnboarded) {
        // Update local state to avoid unnecessary refetch
        setSellerAccount(prev => ({
          ...prev,
          is_onboarded: true,
          stripe_account_id: data.stripeAccountId || prev?.stripe_account_id || ''
        }));

        toast({
          title: "Payment setup complete",
          description: "Your Stripe account has been connected successfully.",
        });
        if (returnTo === 'sell') {
          router.push('/your/sell');
        }
      }
    } catch (err) {
      console.error('Payment setup error:', err);
      toast({
        title: "Error",
        description: "Failed to save payment information. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[200px]">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Settings</h1>
      
      {/* Seller Payment Setup */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Seller Account Setup</h2>
        {sellerAccount?.is_onboarded ? (
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">✓ Your Stripe account is connected and ready to receive payments.</p>
            <p>Account ID: {sellerAccount.stripe_account_id}</p>
          </div>
        ) : (
          <PaymentSetupForm onSubmit={handlePaymentSetup} />
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
} 