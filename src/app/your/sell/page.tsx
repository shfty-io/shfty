"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProductForm, type ProductFormData } from "@/components/seller/ProductForm";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

const steps = [
  { id: 1, name: "Create Product" },
  { id: 2, name: "Submit Product" },
];

export default function SellerDashboard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductFormData | null>(null);

  // Check payment setup status on load
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const supabase = createClient();
      const { data: sellerAccount } = await supabase
        .from('seller_accounts')
        .select('stripe_account_id, is_onboarded, account_status')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!sellerAccount?.is_onboarded) {
        router.push('/your/payment?returnTo=sell');
        return;
      }
    };

    checkPaymentStatus();
  }, [router]);

  const handleProductSubmit = async (data: ProductFormData) => {
    try {
      setProductData(data);
      // Save to localStorage for persistence
      localStorage.setItem('productData', JSON.stringify(data));
      toast({
        title: "Product details saved",
        description: "Your product information has been saved successfully.",
      });
      setCurrentStep(2);
    } catch (error: Error | unknown) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product details. Please try again.",
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
        body: JSON.stringify({
          productData: {
            ...productData,
            codebase_url: productData?.codebaseSource === 'zip' 
              ? productData?.codebase_url ?? null 
              : null,
            github_repo_url: productData?.codebaseSource === 'github' 
              ? productData?.githubRepoUrl ?? null 
              : null
          }
        }),
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
    } catch (error: Error | unknown) {
      console.error('Error submitting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit product. Please try again.",
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
    <div className="p-6">
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
      <div className="border rounded-lg p-6 mb-6">
        <div className="space-y-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Create Your Product</h2>
              <p className="text-muted-foreground mb-4">
                Start by providing details about your software product.
              </p>
              <ProductForm onSubmit={handleProductSubmit} initialData={productData} />
            </div>
          )}

          {currentStep === 2 && (
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
                      <dd className="inline ml-2">{productData?.categories?.[0]}</dd>
                    </div>
                    <div className="text-sm">
                      <dt className="inline font-medium">Price:</dt>
                      <dd className="inline ml-2">
                        {productData?.price === 0 ? 'Free' : `$${productData?.price}`}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back to Product Details
                  </Button>
                  <Button 
                    onClick={handleFinalSubmit}
                  >
                    Submit for Review
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 