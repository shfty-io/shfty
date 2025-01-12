'use client';

import { Header } from "@/components/your/header"
import { Sidebar } from "@/components/your/sidebar"
import { useState } from "react"

export default function YourLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* Fixed sidebar */}
      <div className="fixed inset-y-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      
      {/* Main content that scrolls */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
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
