'use client';

import { Header } from "@/components/your/header"
import { YourSidebar } from "@/components/your/YourSidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export default function YourLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="group/sidebar-wrapper flex min-h-svh w-full">
      <YourSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 container mx-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  )
}
