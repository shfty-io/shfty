'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

type Product = {
  id: number
  name: string
  price: number
  isFree: boolean
  isFeatured?: boolean
  software: string
  image: string
  rating?: number
  createdAt?: Date
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'recent'

const products: Product[] = [
  {
    id: 1,
    name: 'Dirk',
    price: 139.99,
    isFree: true,
    isFeatured: true,
    software: 'Maya',
    image: '/monster1.png',
    rating: 4.5,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    name: 'Furry Felix',
    price: 99.99,
    isFree: true,
    software: 'Cinema 4D',
    image: '/monster2.png',
    rating: 4.2,
    createdAt: new Date('2024-01-10')
  },
  // Add more products as needed
]

export function ProductList() {
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const getSortedProducts = () => {
    let sortedProducts = [...products]
    
    switch (sortBy) {
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price)
      case 'rating':
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'recent':
        return sortedProducts.sort((a, b) => 
          (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      case 'featured':
      default:
        return sortedProducts.sort((a, b) => {
          if (a.isFeatured === b.isFeatured) return 0
          return a.isFeatured ? -1 : 1
        })
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('featured')}>
              Featured
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('price-asc')}>
              Price: Low to High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('price-desc')}>
              Price: High to Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('rating')}>
              Highest Rated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('recent')}>
              Recently Added
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {getSortedProducts().map((product) => (
          <div key={product.id} className="group relative overflow-hidden rounded-lg border bg-background p-2">
            {product.isFeatured && (
              <div className="absolute left-2 top-2 z-10">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  Featured
                </Badge>
              </div>
            )}
            <div className="aspect-square overflow-hidden rounded-md">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {product.software}
                  </Badge>
                  {product.isFree ? (
                    <Badge className="bg-green-500">Free</Badge>
                  ) : null}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)} value
                </p>
                {product.rating && (
                  <span className="text-sm text-muted-foreground">
                    ★ {product.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 