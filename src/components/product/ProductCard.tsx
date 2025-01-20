import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface Product {
  id: string
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
    <Link href={`/product/${product.id}`}>
      <div 
        className="group relative aspect-square overflow-hidden rounded-lg bg-black"
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
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                </svg>
                {product.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
                {product.view_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 