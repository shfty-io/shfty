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
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isOpen={isSidebarOpen}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
