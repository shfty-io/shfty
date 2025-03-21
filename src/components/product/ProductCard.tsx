import Image from 'next/image'
import Link from 'next/link'
import { Eye, Heart } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  license?: string
  user: {
    avatar_url?: string
    full_name: string
  }
}

interface ProductCardProps {
  product: Product
}

// Function to get license description
const getLicenseDescription = (license: string): string => {
  const descriptions: Record<string, string> = {
    'MIT': 'You can use it however you want, just keep the creator\'s name on it.',
    'GPL-3.0': 'If you change it, you must share your changes with everyone.',
    'Apache-2.0': 'You can use it freely but must say who made it first.',
    'BSD-3-Clause': 'You can use it if you keep the creator\'s name with it.',
    'BSD-2-Clause': 'You can use it freely with just two simple rules to follow.',
    'LGPL-3.0': 'You can use it with your own stuff, but changes to this must be shared.',
    'MPL-2.0': 'You can mix it with your own code, but must share any fixes to this part.',
    'AGPL-3.0': 'You must share all your changes, even when used on websites.',
    'Unlicense': 'Anyone can use it for anything, like a gift to everyone.',
    'Proprietary': 'You can only use it how the owner says you can.',
    'CC0-1.0': 'Free for anyone to use for anything.',
    'CC-BY-4.0': 'You can use it but must say who made it.',
    'CC-BY-SA-4.0': 'You can use it if you give credit and share your work too.',
    'Other': 'Has special rules made by the creator.'
  };
  
  return descriptions[license] || 'Special rules made by the creator.';
};

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
          <div>
            <p className="text-sm font-medium">{formattedPrice}</p>
            {product.license && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      {product.license}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{getLicenseDescription(product.license)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1 transition-colors">
              <Heart className="w-4 h-4" />
              {product.likes_count}
            </span>
            <span className="flex items-center gap-1 transition-colors">
              <Eye className="w-4 h-4" />
              {product.view_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 