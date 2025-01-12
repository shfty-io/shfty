"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface PaymentSetupFormProps {
  onSubmit: (data: PaymentSetupData) => void;
}

export interface PaymentSetupData {
  stripeAccountId?: string;
  isOnboarded: boolean;
}

export function PaymentSetupForm({ onSubmit }: PaymentSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
    </div>
  );
} 