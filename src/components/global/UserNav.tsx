"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

interface UserNavProps {
  initialUser: User | null
}

export function UserNav({ initialUser }: UserNavProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser)
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("UserNav: Auth state changed", _event)
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, initialUser])

  async function handleSignOut() {
    try {
      console.log("UserNav: Signing out...")
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("UserNav: Sign out error:", error)
        return
      }
      
      router.refresh()
    } catch (error) {
      console.error("UserNav: Error during sign out:", error)
    }
  }

  if (!user) {
    return (
      <Button variant="ghost" asChild>
        <Link href="/auth/login" className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          <span>Sign in</span>
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/your/account">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={handleSignOut}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 