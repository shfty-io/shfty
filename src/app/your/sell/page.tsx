"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProductForm, type ProductFormData } from "@/components/seller/ProductForm";
import { PaymentSetupForm, type PaymentSetupData } from "@/components/seller/PaymentSetupForm";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";

const steps = [
  { id: 1, name: "Payment Setup" },
  { id: 2, name: "Create Product" },
  { id: 3, name: "Submit Product" },
];

export default function SellerDashboard() {
  const searchParams = useSearchParams();
  const setupStatus = searchParams.get('setup');
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductFormData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentSetupData | null>(null);

  // Check payment setup status on load
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const supabase = createClient();
      const { data: sellerAccount } = await supabase
        .from('seller_accounts')
        .select('stripe_account_id, is_onboarded, account_status')
        .single();

      if (sellerAccount?.is_onboarded) {
        setPaymentData({
          stripeAccountId: sellerAccount.stripe_account_id,
          isOnboarded: true,
          accountStatus: sellerAccount.account_status
        });
        setCurrentStep(2); // Move to product creation if payment is set up
      }
    };

    checkPaymentStatus();
  }, []);

  useEffect(() => {
    if (setupStatus === 'complete') {
      // Update Stripe account status
      fetch('/api/stripe/connect', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: paymentData?.stripeAccountId }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'complete') {
          setPaymentData(prev => ({
            ...prev!,
            isOnboarded: true,
            accountStatus: 'complete'
          }));
          toast({
            title: "Payment setup complete",
            description: "Your Stripe account has been connected successfully.",
          });
          setCurrentStep(2);
        } else {
          toast({
            title: "Setup incomplete",
            description: "Please complete your Stripe account setup to continue.",
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update payment status. Please try again.",
          variant: "destructive",
        });
      });
    } else if (setupStatus === 'refresh') {
      toast({
        title: "Setup incomplete",
        description: "Please complete your Stripe account setup to continue.",
        variant: "destructive",
      });
    }
  }, [setupStatus, paymentData?.stripeAccountId]);

  const handleProductSubmit = async (data: ProductFormData) => {
    try {
      setProductData(data);
      // Save to localStorage for persistence
      localStorage.setItem('productData', JSON.stringify(data));
      toast({
        title: "Product details saved",
        description: "Your product information has been saved successfully.",
      });
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSubmit = async (data: PaymentSetupData) => {
    try {
      setPaymentData(data);
      if (data.isOnboarded) {
        setCurrentStep(2);
        // Try to restore product data if it exists
        const savedProduct = localStorage.getItem('productData');
        if (savedProduct) {
          setProductData(JSON.parse(savedProduct));
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

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch('/api/products/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit product');
      }

      toast({
        title: "Product submitted",
        description: "Your product has been submitted for review.",
      });

      // Clear saved data after successful submission
      localStorage.removeItem('productData');
      
      // Redirect to listings page
      window.location.href = '/your/listings';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit product. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Try to restore product data on initial load
  useEffect(() => {
    const savedProduct = localStorage.getItem('productData');
    if (savedProduct) {
      setProductData(JSON.parse(savedProduct));
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Seller Dashboard</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-sm ${
                step.id <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <Card className="p-6 mb-6">
        <div className="space-y-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Payment Setup</h2>
              <p className="text-muted-foreground mb-4">
                Set up your payment information to receive payments from customers.
              </p>
              <PaymentSetupForm onSubmit={handlePaymentSubmit} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Create Your Product</h2>
              <p className="text-muted-foreground mb-4">
                Start by providing details about your software product.
              </p>
              <ProductForm onSubmit={handleProductSubmit} initialData={productData} />
              <div className="mt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back to Payment Setup</Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Submit Product</h2>
              <p className="text-muted-foreground mb-4">
                Review your product details and submit for review.
              </p>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Product Details</h3>
                  <dl className="space-y-1">
                    <div className="text-sm">
                      <dt className="inline font-medium">Name:</dt>
                      <dd className="inline ml-2">{productData?.name}</dd>
                    </div>
                    <div className="text-sm">
                      <dt className="inline font-medium">Category:</dt>
                      <dd className="inline ml-2">{productData?.category}</dd>
                    </div>
                    <div className="text-sm">
                      <dt className="inline font-medium">Price:</dt>
                      <dd className="inline ml-2">${productData?.price}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <dl className="space-y-1">
                    <div className="text-sm">
                      <dt className="inline font-medium">Stripe Account:</dt>
                      <dd className="inline ml-2">
                        {paymentData?.stripeAccountId ? 'Connected' : 'Not Connected'}
                      </dd>
                    </div>
                    <div className="text-sm">
                      <dt className="inline font-medium">Status:</dt>
                      <dd className="inline ml-2">
                        {paymentData?.isOnboarded ? 'Onboarded' : 'Pending Onboarding'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back to Product Details
                  </Button>
                  <Button 
                    onClick={handleFinalSubmit}
                    disabled={!paymentData?.isOnboarded}
                  >
                    Submit for Review
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 