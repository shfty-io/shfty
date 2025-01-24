import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"
import { ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ProductStats } from "./ProductStats"

type Product = Database['public']['Tables']['products']['Row'] & {
  demo_url?: string | null
  seller_avatar_url?: string | null
  seller_name?: string | null
  likes_count: number
  updated_at: string | null
}

interface ProductHeroProps {
  product: Product
  hasPurchased: boolean
}

export function ProductHero({ product, hasPurchased }: ProductHeroProps) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 flex flex-col gap-[30px]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Marketplace
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/templates" className="hover:text-foreground transition-colors">
          Templates
        </Link>
      </div>

      {/* Title and Description */}
      <div className="flex max-w-[800px] flex-col gap-2.5">
        <h1 className="text-4xl font-bold">{product.name}</h1>
        <p className="text-lg text-muted-foreground">{product.short_description}</p>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-2.5">
        {!hasPurchased && (
          <Button size="lg" asChild>
            <Link href={`/product/${product.id}/purchase`}>
              Purchase for ${product.price}
            </Link>
          </Button>
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
        creatorName={product.seller_name || null}
        creatorAvatarUrl={product.seller_avatar_url || null}
        updatedAt={product.updated_at}
        likesCount={product.likes_count || 0}
        viewCount={product.view_count || 0}
      />
    </div>
  )
} 