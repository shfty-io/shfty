"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PaymentSetupFormProps {
  onSubmit: (data: PaymentSetupData) => void;
}

export interface PaymentSetupData {
  stripeAccountId?: string;
  isOnboarded: boolean;
  accountStatus?: string;
}

export function PaymentSetupForm({ onSubmit }: PaymentSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState<PaymentSetupData | null>(null);

  useEffect(() => {
    // Check existing Stripe account status
    const checkAccountStatus = async () => {
      try {
        const supabase = createClient();
        const { data: sellerAccount } = await supabase
          .from('seller_accounts')
          .select('stripe_account_id, is_onboarded, account_status')
          .single();

        if (sellerAccount) {
          setAccountData({
            stripeAccountId: sellerAccount.stripe_account_id,
            isOnboarded: sellerAccount.is_onboarded,
            accountStatus: sellerAccount.account_status
          });
          
          if (sellerAccount.is_onboarded) {
            onSubmit({
              stripeAccountId: sellerAccount.stripe_account_id,
              isOnboarded: true,
              accountStatus: 'complete'
            });
          }
        }
      } catch (error) {
        console.error('Error checking account status:', error);
      }
    };

    checkAccountStatus();
  }, [onSubmit]);

  const handleStripeConnect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect with Stripe');
      }

      // Redirect to Stripe Connect onboarding
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {accountData?.isOnboarded ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Connected to Stripe</AlertTitle>
          <AlertDescription>
            Your Stripe account is fully set up and ready to receive payments.
          </AlertDescription>
        </Alert>
      ) : accountData?.stripeAccountId ? (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Complete Your Setup</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Your Stripe account setup is incomplete. Please complete the onboarding process to start receiving payments.</p>
            <Button
              onClick={handleStripeConnect}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Loading..." : "Complete Stripe Setup"}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="bg-muted p-6 rounded-lg text-center space-y-4">
          <h3 className="text-lg font-semibold">Connect with Stripe</h3>
          <p className="text-muted-foreground">
            To start selling on our platform, you need to connect your Stripe account.
            This allows you to receive payments securely.
          </p>
          <Button
            onClick={handleStripeConnect}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Connecting..." : "Connect with Stripe"}
          </Button>
        </div>
      )}
    </div>
  );
} 