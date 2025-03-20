'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'
import { fetchWithCsrf, generateCsrfToken, getCsrfToken } from '@/lib/csrf-client'
import { useToast } from '@/components/ui/use-toast'

interface PurchaseButtonProps {
  productId: string
  price: number
  className?: string
  source?: string
}

export function PurchaseButton({ productId, price, className = '', source }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tokenStatus, setTokenStatus] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  
  // Determine if on category page for analytics
  const isFromCategory = source === 'category' || pathname?.includes('/category/')
  
  useEffect(() => {
    // Preemptively generate a CSRF token when component mounts
    const preloadCsrf = async () => {
      if (!getCsrfToken()) {
        await generateCsrfToken()
      }
    }
    
    preloadCsrf()
  }, [])
  
  // Check token status on mount for products that have a GitHub repo
  useEffect(() => {
    const checkTokenStatus = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/check-token-status`);
        if (response.ok) {
          const data = await response.json();
          setTokenStatus(data.status);
        }
      } catch (error) {
        console.error('Error checking token status:', error);
      }
    };
    
    checkTokenStatus();
  }, [productId]);
  
  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      
      // If token is expired, show a warning and don't proceed
      if (tokenStatus === 'expired') {
        toast({
          title: "Repository Access Issue",
          description: "This product's repository access may be unavailable as the seller's GitHub token has expired. Please contact the seller.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Always refresh the CSRF token before making a purchase request
      const csrfGenerated = await generateCsrfToken()
      if (!csrfGenerated) {
        toast({
          title: "Error",
          description: "Failed to generate security token. Please refresh the page and try again.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      
      // For free products, handle direct repository access
      if (price === 0) {
        const response = await fetchWithCsrf(`/api/products/${productId}/download-auth`)
        
        if (response.status === 401) {
          // User is not authenticated, redirect to login
          const data = await response.json().catch(() => ({}))
          const redirectUrl = data.redirectTo || `/auth/login?redirect=${encodeURIComponent(pathname || '/')}`
          router.push(redirectUrl)
          return
        }
        
        if (response.status === 403) {
          toast({
            title: "Error",
            description: "Security validation failed. Please refresh the page and try again.",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "The repository could not be found. Please try again later.",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || 'Failed to access repository')
        }
        
        const data = await response.json()

        if (data.githubRepoUrl) {
          window.open(data.githubRepoUrl, '_blank')
        } else {
          toast({
            title: "Error",
            description: "No GitHub repository URL available.",
            variant: "destructive"
          })
        }
        return
      }

      // For paid products, initiate Stripe checkout
      const response = await fetchWithCsrf(`/api/checkout/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: source || (isFromCategory ? 'category' : 'direct')
        })
      })
      
      if (response.status === 401) {
        // User is not authenticated, redirect to login with the current path
        const data = await response.json().catch(() => ({}))
        const redirectUrl = data.redirectTo || `/auth/login?redirect=${encodeURIComponent(pathname || '/')}`
        router.push(redirectUrl)
        return
      }
      
      if (response.status === 403) {
        // CSRF token issue
        console.error('CSRF validation failed')
        toast({
          title: "Error",
          description: "Security validation failed. Please refresh the page and try again.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      
      if (response.status === 400) {
        const data = await response.json().catch(() => ({}))
        
        // Check if this is the seller setup error
        if (data.error && data.error.includes("seller hasn't completed their payment setup")) {
          toast({
            title: "Seller Not Ready",
            description: data.details || "The seller needs to complete their payment setup before you can purchase this product.",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        
        // Handle other Stripe errors
        if (data.error) {
          toast({
            title: "Checkout Error",
            description: data.error,
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
        
        // Handle other 400 errors
        throw new Error(data.error || 'Failed to initiate checkout')
      }
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate checkout')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Purchase error:', error)
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button 
        onClick={handlePurchase} 
        size="lg"
        disabled={isLoading}
        className={className}
      >
        {isLoading ? 'Processing...' : price === 0 ? 'View Repository' : `Purchase for $${price}`}
      </Button>
      
      {tokenStatus === 'expired' && (
        <div className="mt-2 p-2 text-xs bg-red-50 border border-red-200 rounded-md text-red-600">
          Warning: Seller&apos;s GitHub access token has expired. You may not be able to access the repository after purchase.
        </div>
      )}
    </div>
  )
} 