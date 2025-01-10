"use client"

import { Search as SearchIcon } from 'lucide-react'

export function Search() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search 3D assets..."
          className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  )
} 