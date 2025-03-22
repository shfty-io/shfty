"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/client';
import { User } from '@supabase/supabase-js';
import { EarningsPanel } from '@/components/earnings/EarningsPanel';
import { Loader2 } from 'lucide-react';
import { PaymentSetupForm } from '@/components/payment/PaymentSetupForm';
import { StripeDisconnectButton } from '@/components/payment/StripeDisconnectButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface SellerAccount {
  stripe_account_id: string | null;
  is_onboarded: boolean;
  account_status: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sellerAccount, setSellerAccount] = useState<SellerAccount | null>(null);
  
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

        // Fetch seller account data
        const { data: sellerData, error: sellerError } = await supabase
          .from('seller_accounts')
          .select('stripe_account_id, is_onboarded, account_status')
          .eq('user_id', user.id)
          .single();
        
        if (!sellerError) {
          setSellerAccount(sellerData);
        } else {
          console.error('Error fetching seller account:', sellerError);
        }
        
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [supabase, router]);
  
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      // Refresh seller account data
      const { data: sellerData } = await supabase
        .from('seller_accounts')
        .select('stripe_account_id, is_onboarded, account_status')
        .eq('user_id', user?.id || '')
        .single();
      
      setSellerAccount(sellerData || null);
    } catch (error) {
      console.error('Error refreshing seller data after disconnect:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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

      {/* Stripe Connect Account Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Stripe Payment Account</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments from customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sellerAccount?.stripe_account_id && sellerAccount.is_onboarded ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium">Connected Account</p>
                <p className="text-sm text-muted-foreground">Account ID: {sellerAccount.stripe_account_id}</p>
                <p className="text-sm text-muted-foreground">Status: {sellerAccount.account_status || 'Active'}</p>
              </div>
              
              <div className="mt-4">
                <StripeDisconnectButton 
                  onDisconnect={handleDisconnect} 
                  stripeAccountId={sellerAccount.stripe_account_id} 
                />
              </div>
            </div>
          ) : (
            <PaymentSetupForm
              onSubmit={(data) => {
                // Refresh the seller account data
                if (data.isOnboarded) {
                  setSellerAccount({
                    stripe_account_id: data.stripeAccountId || null,
                    is_onboarded: data.isOnboarded,
                    account_status: data.accountStatus || 'active'
                  });
                }
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Earnings Panel */}
      <EarningsPanel />
    </div>
  );
} 