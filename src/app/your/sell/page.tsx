"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductForm, type ProductFormData } from "@/components/seller/ProductForm";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Link from "next/link";

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
            github_repo_url: productData?.githubRepoUrl ?? null
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
      
      <Alert className="mb-8">
        <AlertDescription className="text-sm">
          Products go through a review process before being featured.{" "}
          <Link href="/help/product-review" className="font-medium underline underline-offset-4">
            Learn more
          </Link>
        </AlertDescription>
      </Alert>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-sm ${
                step.id <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="border rounded-lg p-6 md:p-8 mb-6 bg-card shadow-sm">
        <div className="space-y-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Create Your Product</h2>
              <p className="text-muted-foreground mb-6">
                Start by providing details about your software product.
              </p>
              <ProductForm onSubmit={handleProductSubmit} initialData={productData} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Submit Product</h2>
              <p className="text-muted-foreground mb-6">
                Review your product details and submit for review.
              </p>
              <div className="space-y-6">
                <div className="border rounded-lg p-6 bg-card/50">
                  <h3 className="font-medium text-lg mb-4">Product Details</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-1">Name</dt>
                      <dd className="text-base">{productData?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-1">Categories</dt>
                      <dd>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {productData?.categories?.map((category) => (
                            <span 
                              key={category} 
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                            >
                              {category.split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' & ')}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-1">Technologies</dt>
                      <dd>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {productData?.technologies?.map((tech) => (
                            <span 
                              key={tech} 
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-1">Price</dt>
                      <dd className="text-base">
                        {productData?.price === 0 ? 'Free' : `$${productData?.price}`}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full sm:w-auto">
                    Back to Product Details
                  </Button>
                  <Button 
                    onClick={handleFinalSubmit}
                    className="w-full sm:w-auto"
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