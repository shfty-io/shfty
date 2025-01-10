import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CartButton() {
  // TODO: Implement cart count from API
  const cartCount = 0

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/cart" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0"
          >
            {cartCount}
          </Badge>
        )}
        <span className="sr-only">Shopping Cart</span>
      </Link>
    </Button>
  )
} 