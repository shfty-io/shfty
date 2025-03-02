'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { usePathname, useRouter } from 'next/navigation'
import { fetchWithCsrf, generateCsrfToken, getCsrfToken } from '@/lib/csrf-client'

interface PurchaseButtonProps {
  productId: string
  price: number
  className?: string
  source?: string
}

export function PurchaseButton({ productId, price, className = '', source }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [csrfReady, setCsrfReady] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // Ensure CSRF token is available when component mounts
  useEffect(() => {
    const prepareCsrfToken = async () => {
      try {
        // Check if token already exists
        const token = getCsrfToken()
        if (!token) {
          await generateCsrfToken()
        }
        setCsrfReady(true)
      } catch (err) {
        console.error('Failed to generate CSRF token:', err)
        toast({
          title: "Warning",
          description: "Failed to set up security token. You may experience issues with checkout.",
          variant: "destructive"
        })
      }
    }
    
    prepareCsrfToken()
  }, [])
  
  // Automatically detect if we're on a category page if source is not provided
  const isFromCategory = source || (pathname && pathname.startsWith('/category/'))
  
  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      
      // Always refresh the CSRF token before making a purchase request
      await generateCsrfToken()
      
      // For free products, handle direct download
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
        
        const data = await response.json()

        if (data.githubRepoUrl) {
          window.open(data.githubRepoUrl, '_blank')
        } else if (data.downloadUrl) {
          window.location.href = data.downloadUrl
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
          source: isFromCategory ? 'category' : 'direct'
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
        description: "Failed to process purchase. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handlePurchase} 
      size="lg"
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Processing...' : price === 0 ? 'Download Now' : `Purchase for $${price}`}
    </Button>
  )
} 