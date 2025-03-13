"use client"

import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"
import { ExternalLink, Github } from "lucide-react"
import { ProductStats } from "./ProductStats"
import { PurchaseButton } from "./PurchaseButton"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { fetchWithCsrf, generateCsrfToken } from "@/lib/csrf-client"

type Product = Database['public']['Tables']['products']['Row'] & {
  demo_url?: string | null
  seller?: {
    full_name: string | null
    avatar_url: string | null
  } | null
  likes_count: number
  updated_at: string | null
  github_repo_url?: string | null
  categories?: string[]
  technologies?: string[] | null
}

interface ProductHeroProps {
  product: Product
  hasPurchased: boolean
}

export function ProductHero({ product, hasPurchased }: ProductHeroProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGitHubAccess = async () => {
    try {
      setIsLoading(true)
      
      // Generate CSRF token before making the request
      await generateCsrfToken()
      
      // Use fetchWithCsrf to include the CSRF token header
      const response = await fetchWithCsrf(`/api/products/${product.id}/download-auth`)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle authentication errors
          toast({
            title: "Authentication Required",
            description: "Please sign in to access this repository.",
            variant: "destructive"
          })
          return
        }
        
        if (response.status === 404) {
          // Handle product not found
          toast({
            title: "Error",
            description: "The repository could not be found. Please try again later.",
            variant: "destructive"
          })
          return
        }
        
        // Handle other errors
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || 'Failed to get repository access')
      }
      
      const data = await response.json()
      
      console.log('GitHub access response:', data) // Debug log

      if (data.githubRepoUrl) {
        window.open(data.githubRepoUrl, '_blank')
      } else {
        throw new Error('No GitHub repository URL available')
      }
    } catch (error) {
      console.error('GitHub access error:', error)
      toast({
        title: "Error",
        description: "Failed to access the GitHub repository. Please try again.",
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
            price={product.price ?? 0}
          />
        ) : (
          <div className="flex gap-2.5">
            {product.github_repo_url && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleGitHubAccess}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Github className="h-5 w-5" />
                {isLoading ? 'Processing...' : 'View Repository'}
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