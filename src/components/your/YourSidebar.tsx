'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Profile", href: "/your/profile" },
  { name: "Account", href: "/your/account" },
  { name: "Payment", href: "/your/payment" },
  { name: "Purchases", href: "/your/purchases" },
  { name: "Listings", href: "/your/listings" },
  { name: "Sell", href: "/your/sell" },
];

export function YourSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="z-[100]">
      <SidebarHeader className="relative z-[100]">
        <Link href="/" className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-accent transition-colors">
          <div className="h-8 w-8 rounded bg-gray-900 flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-semibold">shfty.io</div>
            <div className="text-xs text-gray-500">Discover</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="z-[100]">
        <div className="px-3 py-2">
          <div className="text-xs font-medium text-gray-500 mb-2">Settings</div>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>{item.name}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="z-[100]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/feedback" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
