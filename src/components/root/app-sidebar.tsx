import * as React from "react"
import { Plus, Minus, Home } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Categories",
      url: "#",
      items: [
        { title: "Business", url: "/category/business", isActive: false },
        { title: "Entertainment", url: "/category/entertainment", isActive: false },
        { title: "Developer Tools", url: "/category/developer-tools", isActive: false },
        { title: "Finance", url: "/category/finance", isActive: false },
        { title: "Education", url: "/category/education", isActive: false },
        { title: "Games", url: "/category/games", isActive: false },
        { title: "Graphics & Design", url: "/category/graphics-design", isActive: false },
        { title: "Health & Fitness", url: "/category/health-fitness", isActive: false },
        { title: "Lifestyle", url: "/category/lifestyle", isActive: false },
        { title: "Medical", url: "/category/medical", isActive: false },
        { title: "News", url: "/category/news", isActive: false },
        { title: "Photo & Video", url: "/category/photo-video", isActive: false },
        { title: "Productivity", url: "/category/productivity", isActive: false },
        { title: "Social Networking", url: "/category/social-networking", isActive: false },
        { title: "Sports", url: "/category/sports", isActive: false },
        { title: "Travel", url: "/category/travel", isActive: false },
        { title: "Utilities", url: "/category/utilities", isActive: false },
        { title: "Weather", url: "/category/weather", isActive: false },
        { title: "Other", url: "/category/other", isActive: false }
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
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
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger className="flex w-full items-center">
                  {item.title}
                  <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                  <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <div className="relative pl-6 ">
                    <Separator orientation="vertical" className="absolute left-4 h-full" />
                    <SidebarMenu>
                      {item.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={item.isActive}>
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </div>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
