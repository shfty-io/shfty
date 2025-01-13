import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const imageUrl = isHovered && product.images?.[1] 
    ? product.images[1] 
    : product.images?.[0] || '/placeholder.jpg'
    
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price)

  return (
    <Link href={`/product/${product.id}`}>
      <div 
        className="aspect-square overflow-hidden border border-gray-200 bg-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={imageUrl}
          alt={product.title}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900">{product.title}</h3>
        <p className="text-sm text-gray-500">{formattedPrice}</p>
      </div>
    </Link>
  )
} 