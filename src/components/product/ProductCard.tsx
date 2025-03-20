import Image from 'next/image'
import Link from 'next/link'
import { Eye, Heart } from 'lucide-react'

interface Product {
  id: string
  byline: string
  title: string
  description: string
  price: number
  images: string[]
  image_positions?: Record<string, { x: number; y: number }>
  view_count: number
  likes_count: number
  user: {
    avatar_url?: string
    full_name: string
  }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || '/placeholder.jpg'
    
  const formattedPrice = product.price === 0 
    ? 'Free'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(product.price)

  return (
    <div className="group rounded-lg overflow-hidden border border-gray-200 transition-colors hover:bg-gray-50 h-full flex flex-col">
      <Link href={`/product/${product.byline}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          {product.price === 0 && (
            <div className="absolute top-2 right-2 z-10">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Free
              </span>
            </div>
          )}
          
          <Image
            src={imageUrl}
            alt={product.title}
            width={500}
            height={500}
            className="h-full w-full object-cover"
            style={{
              objectPosition: product.image_positions?.[imageUrl] 
                ? `${product.image_positions[imageUrl].x}% ${product.image_positions[imageUrl].y}%` 
                : '50% 50%'
            }}
          />
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow bg-white group-hover:bg-gray-50 transition-colors">
        <div className="mb-2">
          <h3 className="text-lg font-bold">{product.title}</h3>
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-auto">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm font-medium">{formattedPrice}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Heart className="w-4 h-4" />
              {product.likes_count}
            </span>
            <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Eye className="w-4 h-4" />
              {product.view_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 