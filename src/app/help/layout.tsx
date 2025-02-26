import React from 'react'
import { Metadata } from 'next'
import { HelpSidebar } from '@/components/help/HelpSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'Help Center | Marketplace',
  description: 'Get help and support for using our marketplace platform.',
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <HelpSidebar />
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
} 