import Link from "next/link"
import { ProductSearch } from "../global/ProductSearch"
import { UserNav } from "../global/UserNav"
import { createClient } from "@/lib/server"

export async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">MarketPlace</span>
          </Link>
          <ProductSearch />
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/sell" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Sell
          </Link>
          <UserNav initialUser={user} />
        </div>
      </div>
    </header>
  )
}
