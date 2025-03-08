'use client';

import { Button } from '@/components/ui/button';

export function PayoutSettings() {
  return (
    <div className="mt-8 border rounded-lg p-6 bg-muted/20">
      <h2 className="text-xl font-semibold mb-4">Payout Settings</h2>
      <p className="text-muted-foreground mb-4">
        Your earnings are automatically paid out to your connected bank account. You can view and update your bank account details in your Stripe dashboard.
      </p>
      <Button
        onClick={() => window.open('https://dashboard.stripe.com/account', '_blank')}
        className="mt-2"
      >
        View Stripe Dashboard
      </Button>
    </div>
  );
} 