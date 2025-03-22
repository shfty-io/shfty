"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductForm, type ProductFormData } from "@/components/seller/ProductForm";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function SellerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductFormData | null>(null);
  const [isPaymentSetup, setIsPaymentSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const setupParam = searchParams.get('setup');
  
  // Check payment setup status on load
  useEffect(() => {
    const checkPaymentStatus = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: sellerAccount } = await supabase
          .from('seller_accounts')
          .select('stripe_account_id, is_onboarded, account_status')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        // Set payment setup status
        setIsPaymentSetup(!!sellerAccount?.is_onboarded);
        
        // If we're coming back from Stripe Connect onboarding
        if (setupParam === 'complete' && sellerAccount?.stripe_account_id && !sellerAccount?.is_onboarded) {
          verifyStripeAccountStatus(sellerAccount.stripe_account_id);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [setupParam]);

  const verifyStripeAccountStatus = async (accountId: string) => {
    setIsVerifying(true);
    try {
      // Call our API to check the account status directly with Stripe
      const response = await fetch('/api/stripe/connect', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify account status');
      }
      
      const data = await response.json();
      
      if (data.isOnboarded) {
        setIsPaymentSetup(true);
        toast({
          title: "Payment Setup Complete",
          description: "Your Stripe account is now connected and ready to receive payments.",
        });
        
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('setup');
        window.history.replaceState({}, '', url.toString());
      } else {
        toast({
          title: "Payment Setup Incomplete",
          description: "Please complete all steps in the Stripe onboarding process.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying Stripe account:', error);
      toast({
        title: "Verification Error",
        description: "Unable to verify your Stripe account status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const navigateToPaymentSetup = () => {
    router.push('/your/payment?returnTo=sell');
  };

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
      // Validate that productData exists and has all required fields
      if (!productData) {
        throw new Error("Product data is missing");
      }

      // Check required fields explicitly
      const missingFields: string[] = [];
      
      if (!productData.name) missingFields.push('name');
      if (!productData.description) missingFields.push('description');
      if (!productData.shortDescription) missingFields.push('shortDescription');
      if (!productData.byline) missingFields.push('byline');
      if (typeof productData.price !== 'number') missingFields.push('price');
      if (!Array.isArray(productData.categories) || productData.categories.length === 0) {
        missingFields.push('categories');
      }

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Create a properly formatted object for the API
      const submissionData = {
        name: productData.name,
        byline: productData.byline,
        shortDescription: productData.shortDescription,
        description: productData.description,
        price: productData.price,
        categories: productData.categories,
        technologies: productData.technologies,
        features: productData.features,
        githubRepoUrl: productData.githubRepoUrl,
        github_token: productData.github_token,
        softwareLicense: productData.softwareLicense,
        imageUrls: productData.imageUrls,
        imagePositions: productData.imagePositions,
        videoUrl: productData.videoUrl,
        demoUrl: productData.demoUrl
      };

      console.log("Submitting data:", submissionData);

      const response = await fetch('/api/products/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
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

  // If payment is not set up, show only the notification
  if (!isPaymentSetup && !isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
        
        <div className="border border-destructive rounded-lg p-6 md:p-8 mb-6 bg-background">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            {setupParam === 'complete' && isVerifying ? (
              <>
                <AlertTitle className="text-lg">Verifying Your Stripe Account</AlertTitle>
                <AlertDescription className="text-base text-muted-foreground">
                  Please wait while we verify your Stripe Connect account status...
                </AlertDescription>
                <Loader2 className="h-8 w-8 animate-spin text-primary mt-2" />
              </>
            ) : setupParam === 'refresh' ? (
              <>
                <AlertTitle className="text-lg">Stripe Setup Expired</AlertTitle>
                <AlertDescription className="text-base text-muted-foreground mt-2">
                  Your Stripe setup session has expired. Please try again.
                </AlertDescription>
                <Button size="lg" onClick={navigateToPaymentSetup} className="mt-4">
                  Restart Payment Setup
                </Button>
              </>
            ) : (
              <>
                <AlertDescription className="text-lg text-destructive">
                  You need to set up payment details before you can sell products.
                </AlertDescription>
                <Button size="lg" onClick={navigateToPaymentSetup} className="mt-4">
                  Set Up Payment
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
        <div className="border rounded-lg p-6 md:p-8 mb-6 bg-card shadow-sm">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Full page is only accessible if payment is set up
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
      
      <Alert className="mb-8">
        <AlertDescription className="text-sm">
          Products go through a review process before being featured.{" "}
          <Link href="/help/product-review" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
            Learn more
          </Link>
        </AlertDescription>
      </Alert>
      
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
                    {productData?.softwareLicense && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-1">Software License</dt>
                        <dd>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                              {productData.softwareLicense.replace(/-/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </span>
                          </div>
                        </dd>
                      </div>
                    )}
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

export default function SellerDashboard() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SellerDashboardContent />
    </Suspense>
  );
}