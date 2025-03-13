import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, Heart } from 'lucide-react'

interface Product {
  id: string
  byline: string
  title: string
  description: string
  price: number
  images: string[]
  view_count: number
  likes_count: number
  user: {
    avatar_url: string
    full_name: string
  }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const imageUrl = isHovered && product.images?.[1] 
    ? product.images[1] 
    : product.images?.[0] || '/placeholder.jpg'
    
  const formattedPrice = product.price === 0 
    ? 'Free'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(product.price)

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-black">
      <Link 
        href={`/product/${product.byline}`}
        className="block h-full w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
          className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </Link>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Image
            src={product.user.avatar_url || '/placeholder-avatar.jpg'}
            alt={product.user.full_name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <h3 className="text-lg font-bold text-white">{product.title}</h3>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-200">{formattedPrice}</p>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {product.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {product.view_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 