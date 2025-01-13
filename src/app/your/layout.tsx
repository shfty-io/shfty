'use client';

import { Header } from "@/components/your/header"
import { Sidebar } from "@/components/your/sidebar"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/SidebarContext"

export default function YourLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={isSidebarOpen} />
      
      {/* Main content that scrolls */}
      <div className={cn(
        "min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out",
        isSidebarOpen ? "ml-64" : "ml-0"
      )}>
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isOpen={isSidebarOpen}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
