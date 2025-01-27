"use client"

import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"
import { ExternalLink, Github, Download } from "lucide-react"
import { ProductStats } from "./ProductStats"
import { PurchaseButton } from "./PurchaseButton"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

type Product = Database['public']['Tables']['products']['Row'] & {
  demo_url?: string | null
  seller?: {
    full_name: string | null
    avatar_url: string | null
  } | null
  likes_count: number
  updated_at: string | null
  github_repo_url?: string | null
  codebase_url?: string | null
}

interface ProductHeroProps {
  product: Product
  hasPurchased: boolean
}

export function ProductHero({ product, hasPurchased }: ProductHeroProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products/${product.id}/download-auth`)
      const data = await response.json()

      console.log('Download response:', data) // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get download URL')
      }

      // Since this is the download button handler, prioritize the direct download URL
      if (data.downloadUrl) {
        window.location.href = data.downloadUrl
      } else if (data.githubRepoUrl) {
        window.open(data.githubRepoUrl, '_blank')
      } else {
        throw new Error('No download URL available')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Error",
        description: "Failed to generate download link. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-8 flex flex-col gap-[30px]">
      {/* Title and Description */}
      <div className="flex max-w-[800px] flex-col gap-2.5">
        <h1 className="text-4xl font-bold">{product.name}</h1>
        <p className="text-lg text-muted-foreground">{product.short_description}</p>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-2.5">
        {!hasPurchased ? (
          <PurchaseButton 
            productId={product.id}
            price={product.price}
          />
        ) : (
          <div className="flex gap-2.5">
            {product.github_repo_url && (
              <Button size="lg" variant="outline" asChild>
                <a 
                  href={product.github_repo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  View Repository
                </a>
              </Button>
            )}
            {product.codebase_url && (
              <Button 
                size="lg"
                onClick={handleDownload}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                {isLoading ? 'Processing...' : 'Download Files'}
              </Button>
            )}
          </div>
        )}
        
        {product.demo_url && (
          <Button variant="outline" size="lg" asChild>
            <a href={product.demo_url} target="_blank" rel="noopener noreferrer">
              Preview <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      <ProductStats
        productId={product.id}
        creatorName={product.seller?.full_name || null}
        creatorAvatarUrl={product.seller?.avatar_url || null}
        updatedAt={product.updated_at}
        likesCount={product.likes_count || 0}
        viewCount={product.view_count || 0}
      />
    </div>
  )
} 