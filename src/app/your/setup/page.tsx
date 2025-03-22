'use client';

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";
import { PaymentSetupForm } from "@/components/payment/PaymentSetupForm";
import { toast } from "@/components/ui/use-toast";
import { User } from '@supabase/supabase-js';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SellerAccount {
  stripe_account_id: string | null;
  is_onboarded: boolean;
  github_token?: string;
  token_status?: string;
  token_last_verified?: string;
}

interface PaymentSetupData {
  isOnboarded: boolean;
  stripeAccountId?: string;
}

function SetupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [user, setUser] = useState<User | null>(null);
  const [sellerAccount, setSellerAccount] = useState<SellerAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectStripe = async () => {
    if (confirm('Are you sure you want to disconnect your Stripe account? You will not be able to receive payments until you set up a new account.')) {
      setIsDisconnecting(true);
      try {
        const response = await fetch('/api/seller/stripe-disconnect', {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to disconnect Stripe account');
        }

        toast({
          title: "Stripe account disconnected",
          description: "Your Stripe account has been successfully disconnected.",
        });
        
        // Refresh the data by fetching it again
        fetchUserData();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to disconnect Stripe account",
          variant: "destructive",
        });
      } finally {
        setIsDisconnecting(false);
      }
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      const supabase = createClient();
      
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData) {
        router.push('/auth/login');
        return;
      }

      setUser(userData);

      // Fetch seller account data
      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_accounts')
        .select('stripe_account_id, is_onboarded, github_token, token_status, token_last_verified')
        .eq('user_id', userData.id)
        .single();
      
      if (sellerError && sellerError.code === 'PGRST116') {
        // No seller account found, create one
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
          toast({
            title: "Error",
            description: "Failed to create seller account. Please try again.",
            variant: "destructive",
          });
        } else {
          setSellerAccount(newSellerData);
        }
      } else if (sellerError) {
        console.error('Error fetching seller account:', sellerError);
      } else {
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
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePaymentSetup = async (data: PaymentSetupData) => {
    try {
      if (data.isOnboarded) {
        // Update local state to avoid unnecessary refetch
        setSellerAccount(prev => ({
          ...prev,
          is_onboarded: true,
          stripe_account_id: data.stripeAccountId || prev?.stripe_account_id || null
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

  const handleGithubTokenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value;
    try {
      const response = await fetch('/api/seller/github-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      // Note: You can create a new token in your GitHub Developer Settings
      // at https://github.com/settings/tokens with 'repo' scope permissions
      // to enable repository access for automatic deployment.
      
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
    } catch (err) {
      console.error('GitHub token save error:', err);
      toast({
        title: "Error",
        description: "Failed to save GitHub token. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveToken = async () => {
    try {
      const response = await fetch('/api/seller/github-token', {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete token');
      
      setSellerAccount(prev => prev ? {...prev, github_token: undefined} : null);
      toast({
        title: "Success",
        description: "GitHub token removed successfully",
      });
    } catch (err) {
      console.error('GitHub token remove error:', err);
      toast({
        title: "Error",
        description: "Failed to delete GitHub token",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[400px]">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading setup information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the router redirect
  }

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Setup</h1>
      
      {/* Seller Payment Setup */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Seller Account Setup</h2>
        {sellerAccount?.is_onboarded ? (
          <div className="border rounded-md p-4">
            <div className="text-sm mb-4">
              <p className="mb-2">✓ Your Stripe account is connected and ready to receive payments.</p>
              <p className="text-muted-foreground">Account ID: {sellerAccount.stripe_account_id}</p>
            </div>
            {sellerAccount.stripe_account_id && (
              <Button 
                variant="outline" 
                className="text-destructive hover:text-destructive"
                onClick={handleDisconnectStripe}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect Stripe Account"}
              </Button>
            )}
          </div>
        ) : (
          <PaymentSetupForm onSubmit={handlePaymentSetup} />
        )}
      </div>

      {/* GitHub Token Setup */}
      <div>
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
                onChange={handleGithubTokenChange}
              />
              <Button 
                variant="destructive" 
                onClick={handleRemoveToken}
              >
                Remove Token
              </Button>
            </div>
            
            {sellerAccount?.github_token && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  {sellerAccount?.token_status === 'valid' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Valid
                    </span>
                  ) : sellerAccount?.token_status === 'expired' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Unknown
                    </span>
                  )}
                </div>
                {sellerAccount?.token_last_verified && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last verified: {new Date(sellerAccount.token_last_verified).toLocaleString()}
                  </p>
                )}
                {sellerAccount?.token_status === 'expired' && (
                  <p className="text-xs text-red-500 mt-1">
                    Your token has expired or is invalid. Please generate a new token with the &apos;repo&apos; scope and update it.
                  </p>
                )}
              </div>
            )}
            
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
              .{" "}
              <Link
                href="/help/github-setup"
                className="text-primary hover:underline"
              >
                Learn more about GitHub setup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupPageContent />
    </Suspense>
  );
} 