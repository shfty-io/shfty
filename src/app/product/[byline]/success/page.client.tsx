'use client';

import { CheckCircle2, AlertCircle, Github, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductNavbar } from '@/components/product/ProductNavbar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SuccessPageContentProps {
  status: 'success' | 'session-not-found' | 'download-error' | 'github-pending';
  product?: {
    id: string;
    name: string;
    github_repo_url?: string;
  };
  byline?: string;
}

export function SuccessPageContent({
  status,
  product,
  byline
}: SuccessPageContentProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(status === 'session-not-found');

  // Auto-refresh countdown for session-not-found
  useEffect(() => {
    if (status !== 'session-not-found' || !isAutoRefreshing) return;
    
    if (countdown <= 0) {
      // Refresh the page
      router.refresh();
      setCountdown(15); // Reset countdown if we want to continue refreshing
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, isAutoRefreshing, router, status]);

  if (status === 'session-not-found') {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Session Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                We couldn&apos;t find your purchase session. Don&apos;t worry, your payment may still be processing. 
                {isAutoRefreshing && (
                  <span> This page will automatically refresh in {countdown} seconds.</span>
                )}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Please check your email for a receipt or wait a few minutes. Stripe may need a moment to process your payment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href={`/product/${byline}`}>
                    Return to Product
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/your/purchases">
                    View Your Purchases
                  </Link>
                </Button>
                {!isAutoRefreshing && (
                  <Button 
                    onClick={() => router.refresh()} 
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" /> Refresh Now
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
                >
                  {isAutoRefreshing ? 'Stop Auto-Refresh' : 'Auto-Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (status === 'download-error') {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Download Error
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {!product?.name 
                  ? "No codebase available for this product. Please contact support."
                  : "We couldn't generate your download link. Please try again or contact support."}
              </p>
              <Button asChild variant="outline">
                <Link href="/your/purchases">
                  View Your Purchases
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (status === 'github-pending') {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Repository Access Pending
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We couldn&apos;t grant repository access. The seller needs to set up their GitHub integration.
              </p>
              <Button asChild variant="outline">
                <Link href={`/product/${byline}`}>
                  Return to Product
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // For GitHub repos
  if (product?.github_repo_url) {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank you for your purchase!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your purchase of {product.name} was successful.
              </p>
            </div>

            <div className="space-y-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a 
                  href={product.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  View Repository
                </a>
              </Button>
              <div className="pt-4">
                <Link 
                  href="/your/purchases" 
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View your purchases
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Default case - no repository available
  return (
    <>
      <ProductNavbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank you for your purchase!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your purchase of {product?.name} was successful.
            </p>
          </div>

          <div className="space-y-4">
            <div className="pt-4">
              <Link 
                href="/your/purchases" 
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                View your purchases
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 