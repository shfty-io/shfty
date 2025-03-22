'use client';

import { CheckCircle2, AlertCircle, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductNavbar } from '@/components/product/ProductNavbar';

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
  if (status === 'session-not-found') {
    return (
      <>
        <ProductNavbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Session Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We couldn&apos;t find your purchase session. Don&apos;t worry, your payment may still be processing. 
                Please check your email for a receipt or wait a few minutes and refresh this page.
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