import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/root/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full">
        <AppSidebar />
        <SidebarInset className="w-full">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 