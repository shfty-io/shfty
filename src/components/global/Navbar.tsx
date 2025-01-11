import Link from 'next/link'
import { UserNav } from '@/components/global/UserNav'
import { ProductSearch } from '@/components/global/ProductSearch'
import { createClient } from '@/lib/server'

export async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="relative w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">SoftMarket</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full max-w-sm">
            <ProductSearch />
          </div>
          <nav className="flex items-center space-x-2">
            <UserNav initialUser={user} />
          </nav>
        </div>
      </div>
    </header>
  )
} 