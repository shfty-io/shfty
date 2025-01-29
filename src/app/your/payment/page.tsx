'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";
import { PaymentSetupForm } from "@/components/payment/PaymentSetupForm";
import { toast } from "@/components/ui/use-toast";
import { User } from '@supabase/supabase-js';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SellerAccount {
  stripe_account_id: string;
  is_onboarded: boolean;
  github_token?: string;
}

interface PaymentSetupData {
  isOnboarded: boolean;
  stripeAccountId?: string;
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
          const { data: sellerData, error: sellerError } = await supabase
            .from('seller_accounts')
            .select('stripe_account_id, is_onboarded, github_token')
            .eq('user_id', userData.id)
            .single();
          
          if (sellerError && sellerError.code === 'PGRST116') {
            // No seller account found, create one
            console.log('Creating new seller account');
            const { data: newSellerData, error: createError } = await supabase
              .from('seller_accounts')
              .insert({
                user_id: userData.id,
                is_onboarded: false,
                account_status: 'pending'
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating seller account:', createError);
            } else {
              setSellerAccount(newSellerData);
            }
          } else if (sellerError) {
            console.error('Error fetching seller account:', sellerError);
          } else {
            setSellerAccount(sellerData);
          }
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

      {/* GitHub Token Setup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">GitHub Integration</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To enable private repository access for your buyers, you need to provide a GitHub personal access token with the following scopes:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground ml-4">
            <li>repo (Full control of private repositories)</li>
            <li>repo:invite (Accept repository invitations)</li>
          </ul>
          <div className="mt-4">
            <Label htmlFor="github_token">GitHub Personal Access Token</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="github_token"
                type="password"
                placeholder="ghp_your_token_here"
                value={sellerAccount?.github_token || ''}
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const token = e.target.value;
                  try {
                    const response = await fetch('/api/seller/github-token', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ token }),
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to save GitHub token');
                    }
                    
                    setSellerAccount(prev => prev ? {
                      ...prev,
                      github_token: token
                    } : null);
                    
                    toast({
                      title: "Success",
                      description: "GitHub token saved successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to save GitHub token. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              />
              <Button 
                variant="destructive" 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/seller/github-token', {
                      method: 'DELETE',
                    });
                    
                    if (!response.ok) throw new Error('Failed to delete token');
                    
                    setSellerAccount(prev => prev ? {...prev, github_token: ''} : null);
                    toast({
                      title: "Success",
                      description: "GitHub token removed successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to delete GitHub token",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Remove Token
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You can create a new token in your{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Developer Settings
              </a>
            </p>
          </div>
        </div>
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