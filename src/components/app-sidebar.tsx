import * as React from "react"
import { ChevronRight, Store } from "lucide-react"
import Link from "next/link"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
        { title: "3D", url: "/category/3d", isActive: false },
        { title: "AI", url: "/category/ai", isActive: false },
        { title: "Agency", url: "/category/agency", isActive: false },
        { title: "Animated", url: "/category/animated", isActive: false },
        { title: "App", url: "/category/app", isActive: false },
        { title: "Blog", url: "/category/blog", isActive: false },
        { title: "Brand Guidelines", url: "/category/brand-guidelines", isActive: false },
        { title: "Business", url: "/category/business", isActive: false },
        { title: "Changelog", url: "/category/changelog", isActive: false },
        { title: "Documentation", url: "/category/documentation", isActive: false },
        { title: "Ecommerce", url: "/category/ecommerce", isActive: false },
        { title: "Education", url: "/category/education", isActive: false },
        { title: "Entertainment", url: "/category/entertainment", isActive: false },
        { title: "Food", url: "/category/food", isActive: false },
        { title: "Free", url: "/category/free", isActive: false },
        { title: "Health", url: "/category/health", isActive: false },
        { title: "Landing Page", url: "/category/landing-page", isActive: false },
        { title: "Membership", url: "/category/membership", isActive: false },
        { title: "Minimal", url: "/category/minimal", isActive: false },
        { title: "Modern", url: "/category/modern", isActive: false },
        { title: "New", url: "/category/new", isActive: false },
        { title: "News", url: "/category/news", isActive: false },
        { title: "Personal", url: "/category/personal", isActive: false },
        { title: "Photography", url: "/category/photography", isActive: false },
        { title: "Podcast", url: "/category/podcast", isActive: false },
        { title: "Portfolio", url: "/category/portfolio", isActive: false },
        { title: "Real Estate", url: "/category/real-estate", isActive: false },
        { title: "Restaurant", url: "/category/restaurant", isActive: false },
        { title: "Resume", url: "/category/resume", isActive: false },
        { title: "SaaS", url: "/category/saas", isActive: false },
        { title: "Sidebar", url: "/category/sidebar", isActive: false },
        { title: "Splash", url: "/category/splash", isActive: false },
        { title: "Startup", url: "/category/startup", isActive: false },
        { title: "Tech", url: "/category/tech", isActive: false },
        { title: "Web3", url: "/category/web3", isActive: false }
      ],
    },
    {
      title: "Price",
      url: "#",
      items: [
        { title: "Free", url: "/category/free", isActive: false },
        { title: "Paid", url: "/category/paid", isActive: false }
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-4 py-2 text-lg font-semibold hover:text-primary">
          <Store className="h-6 w-6" />
          <span>Market</span>
        </Link>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
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
