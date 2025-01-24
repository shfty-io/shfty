'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface PurchaseButtonProps {
  productId: string
  price: number
  className?: string
}

export function PurchaseButton({ productId, price, className = '' }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      
      // For free products, handle direct download
      if (price === 0) {
        const response = await fetch(`/api/products/${productId}/download-auth`)
        const data = await response.json()

        if (data.githubRepoUrl) {
          window.open(data.githubRepoUrl, '_blank')
        } else if (data.downloadUrl) {
          window.location.href = data.downloadUrl
        }
        return
      }

      // For paid products, initiate Stripe checkout
      const response = await fetch(`/api/checkout/${productId}`, {
        method: 'POST',
      })
      
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