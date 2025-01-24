'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface PurchaseButtonProps {
  productId: string
  price: number
}

export function PurchaseButton({ productId, price }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products/${productId}/download-auth`)
      const data = await response.json()

      if (data.githubRepoUrl) {
        window.open(data.githubRepoUrl, '_blank')
      } else if (data.downloadUrl) {
        window.location.href = data.downloadUrl
      }
    } catch (error) {
      console.error('Purchase error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handlePurchase} 
      className="w-full" 
      size="lg"
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : price === 0 ? 'Download Now' : 'Purchase Now'}
    </Button>
  )
} 