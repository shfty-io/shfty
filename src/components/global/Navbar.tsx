import Link from 'next/link'
import { Search } from '@/components/root/Search'
import { CartButton } from '@/components/global/CartButton'
import { UserNav } from '@/components/global/UserNav'
import { createClient } from '@/lib/server'

export async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">SoftMarket</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/categories" className="transition-colors hover:text-foreground/80">
              Categories
            </Link>
            <Link href="/products" className="transition-colors hover:text-foreground/80">
              All Products
            </Link>
            <Link href="/sell" className="transition-colors hover:text-foreground/80">
              Sell
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Search />
          </div>
          <nav className="flex items-center space-x-2">
            <CartButton />
            <UserNav initialUser={user} />
          </nav>
        </div>
      </div>
    </header>
  )
} 