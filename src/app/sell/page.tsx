"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProductForm, type ProductFormData } from "@/components/seller/ProductForm";
import { PaymentSetupForm, type PaymentSetupData } from "@/components/seller/PaymentSetupForm";
import { toast } from "@/components/ui/use-toast";

const steps = [
  { id: 1, name: "Create Product" },
  { id: 2, name: "Payment Setup" },
  { id: 3, name: "Submit Product" },
];

export default function SellerDashboard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductFormData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentSetupData | null>(null);

  const handleProductSubmit = async (data: ProductFormData) => {
    try {
      // TODO: Send product data to API
      setProductData(data);
      toast({
        title: "Product details saved",
        description: "Your product information has been saved successfully.",
      });
      setCurrentStep(2);
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
      // TODO: Send payment data to API
      setPaymentData(data);
      toast({
        title: "Payment information saved",
        description: "Your payment information has been saved successfully.",
      });
      setCurrentStep(3);
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
      // TODO: Send final submission to API
      toast({
        title: "Product submitted",
        description: "Your product has been submitted for review.",
      });
      // Redirect to seller dashboard or product list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
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
      <Card className="p-6">
        <div className="space-y-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Create Your Product</h2>
              <p className="text-muted-foreground mb-4">
                Start by providing details about your software product.
              </p>
              <ProductForm onSubmit={handleProductSubmit} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Payment Setup</h2>
              <p className="text-muted-foreground mb-4">
                Set up your payment information to receive payments from customers.
              </p>
              <PaymentSetupForm onSubmit={handlePaymentSubmit} />
              <div className="mt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back to Product Details</Button>
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
                      <dt className="inline font-medium">Account Type:</dt>
                      <dd className="inline ml-2">{paymentData?.accountType}</dd>
                    </div>
                    <div className="text-sm">
                      <dt className="inline font-medium">Account Holder:</dt>
                      <dd className="inline ml-2">{paymentData?.accountHolderName}</dd>
                    </div>
                    <div className="text-sm">
                      <dt className="inline font-medium">Country:</dt>
                      <dd className="inline ml-2">{paymentData?.country}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back to Payment Setup
                  </Button>
                  <Button onClick={handleFinalSubmit}>
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