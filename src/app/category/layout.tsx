import { SidebarProvider } from "@/components/ui/sidebar";

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
  )
} 