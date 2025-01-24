'use client';

import { useState, useEffect } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";
import { AddPaymentDialog } from "@/components/payment/AddPaymentDialog";
import { PaymentSetupForm, type PaymentSetupData } from "@/components/payment/PaymentSetupForm";
import { toast } from "@/components/ui/use-toast";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [user, setUser] = useState<any>(null);
  const [sellerAccount, setSellerAccount] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData) {
        router.push('/auth/login');
        return;
      }

      setUser(userData);

      // Check if user is a seller
      const { data: sellerData } = await supabase
        .from('seller_accounts')
        .select('stripe_account_id, is_onboarded')
        .eq('user_id', userData.id)
        .single();
      
      setSellerAccount(sellerData);

      // Fetch saved payment methods
      const { data: methodsData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userData.id);
      
      setPaymentMethods(methodsData || []);
    };

    fetchData();
  }, [router]);

  const handlePaymentSetup = async (data: PaymentSetupData) => {
    try {
      if (data.isOnboarded) {
        toast({
          title: "Payment setup complete",
          description: "Your Stripe account has been connected successfully.",
        });
        if (returnTo === 'sell') {
          router.push('/your/sell');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment information. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null; // or loading state
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Settings</h1>
      
      {/* Seller Payment Setup */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Seller Account Setup</h2>
        <PaymentSetupForm onSubmit={handlePaymentSetup} />
      </div>

      {/* Buyer Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Payment Methods</h2>
            <AddPaymentDialog />
          </div>

          <div className="space-y-4">
            {paymentMethods?.length ? (
              paymentMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-600">💳</span>
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• {method.last4}</p>
                      <p className="text-sm text-gray-500">Expires {method.exp_month}/{method.exp_year}</p>
                    </div>
                  </div>
                  <form action="/api/payment/remove" method="POST">
                    <input type="hidden" name="methodId" value={method.id} />
                    <button type="submit" className="text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="border rounded-lg p-4">
                <p className="text-gray-500">No payment methods added yet</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Payment History</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">No recent transactions</p>
                  <p className="text-sm text-gray-500">Your payment history will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 