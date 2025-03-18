'use client';

import * as React from "react"
import { Plus, Minus, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

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

// This is the updated categories data structure
const data = {
  navMain: [
    {
      title: "Work & Productivity",
      url: "#",
      items: [
        { title: "AI notetakers", url: "/category/ai-notetakers", isActive: false },
        { title: "App switcher", url: "/category/app-switcher", isActive: false },
        { title: "Compliance software", url: "/category/compliance-software", isActive: false },
        { title: "E-signature apps", url: "/category/e-signature-apps", isActive: false },
        { title: "Knowledge base software", url: "/category/knowledge-base-software", isActive: false },
        { title: "Meeting software", url: "/category/meeting-software", isActive: false },
        { title: "PDF Editor", url: "/category/pdf-editor", isActive: false },
        { title: "Presentation Software", url: "/category/presentation-software", isActive: false },
        { title: "Project management software", url: "/category/project-management-software", isActive: false },
        { title: "Scheduling software", url: "/category/scheduling-software", isActive: false },
        { title: "Search", url: "/category/search", isActive: false },
        { title: "Spreadsheets", url: "/category/spreadsheets", isActive: false },
        { title: "Ad blockers", url: "/category/ad-blockers", isActive: false },
        { title: "Customer support tools", url: "/category/customer-support-tools", isActive: false },
        { title: "Email clients", url: "/category/email-clients", isActive: false },
        { title: "Note and writing apps", url: "/category/note-and-writing-apps", isActive: false },
        { title: "Password managers", url: "/category/password-managers", isActive: false },
        { title: "Screenshots and screen recording apps", url: "/category/screenshots-and-screen-recording-apps", isActive: false },
        { title: "Security software", url: "/category/security-software", isActive: false },
        { title: "Team collaboration software", url: "/category/team-collaboration-software", isActive: false }
      ],
    },
    {
      title: "Engineering & Development",
      url: "#",
      items: [
        { title: "A/B testing tools", url: "/category/ab-testing-tools", isActive: false },
        { title: "Authentication & identity tools", url: "/category/authentication-identity-tools", isActive: false },
        { title: "Content Management Systems", url: "/category/content-management-systems", isActive: false },
        { title: "Code Review Tools", url: "/category/code-review-tools", isActive: false },
        { title: "Command line tools", url: "/category/command-line-tools", isActive: false },
        { title: "Data visualization tools", url: "/category/data-visualization-tools", isActive: false },
        { title: "Git clients", url: "/category/git-clients", isActive: false },
        { title: "Issue tracking software", url: "/category/issue-tracking-software", isActive: false },
        { title: "No-code platforms", url: "/category/no-code-platforms", isActive: false },
        { title: "Standup bots", url: "/category/standup-bots", isActive: false },
        { title: "Testing and QA software", url: "/category/testing-qa-software", isActive: false },
        { title: "VPN client", url: "/category/vpn-client", isActive: false },
        { title: "AI Coding Assistants", url: "/category/ai-coding-assistants", isActive: false },
        { title: "Automation tools", url: "/category/automation-tools", isActive: false },
        { title: "Code editors", url: "/category/code-editors", isActive: false },
        { title: "Data analysis tools", url: "/category/data-analysis-tools", isActive: false },
        { title: "Databases and backend frameworks", url: "/category/databases-backend-frameworks", isActive: false },
        { title: "Headless CMS software", url: "/category/headless-cms-software", isActive: false },
        { title: "Observability tools", url: "/category/observability-tools", isActive: false },
        { title: "Static site generators", url: "/category/static-site-generators", isActive: false },
        { title: "Unified API", url: "/category/unified-api", isActive: false },
        { title: "Website analytics", url: "/category/website-analytics", isActive: false }
      ],
    },
    {
      title: "Design & Creative",
      url: "#",
      items: [
        { title: "Design mockups", url: "/category/design-mockups", isActive: false },
        { title: "Digital whiteboards", url: "/category/digital-whiteboards", isActive: false },
        { title: "Icon sets", url: "/category/icon-sets", isActive: false },
        { title: "UI frameworks", url: "/category/ui-frameworks", isActive: false },
        { title: "Wireframing", url: "/category/wireframing", isActive: false },
        { title: "Background removal tools", url: "/category/background-removal-tools", isActive: false },
        { title: "Design resources", url: "/category/design-resources", isActive: false },
        { title: "Graphic design tools", url: "/category/graphic-design-tools", isActive: false },
        { title: "Interface design tools", url: "/category/interface-design-tools", isActive: false },
        { title: "Photo editing", url: "/category/photo-editing", isActive: false },
        { title: "User research", url: "/category/user-research", isActive: false }
      ],
    },
    {
      title: "Social & Community",
      url: "#",
      items: [
        { title: "Blogging platforms", url: "/category/blogging-platforms", isActive: false },
        { title: "Dating apps", url: "/category/dating-apps", isActive: false },
        { title: "Microblogging platforms", url: "/category/microblogging-platforms", isActive: false },
        { title: "Safety and Privacy platforms", url: "/category/safety-privacy-platforms", isActive: false },
        { title: "Community management", url: "/category/community-management", isActive: false },
        { title: "Link in bio tools", url: "/category/link-in-bio-tools", isActive: false },
        { title: "Messaging apps", url: "/category/messaging-apps", isActive: false },
        { title: "Newsletter platforms", url: "/category/newsletter-platforms", isActive: false }
      ],
    },
    {
      title: "Marketing & Sales",
      url: "#",
      items: [
        { title: "Advertising tools", url: "/category/advertising-tools", isActive: false },
        { title: "SEO tools", url: "/category/seo-tools", isActive: false },
        { title: "CRM software", url: "/category/crm-software", isActive: false },
        { title: "Email marketing", url: "/category/email-marketing", isActive: false },
        { title: "Keyword research tools", url: "/category/keyword-research-tools", isActive: false },
        { title: "Lead generation software", url: "/category/lead-generation-software", isActive: false },
        { title: "Sales enablement", url: "/category/sales-enablement", isActive: false },
        { title: "Social media management tools", url: "/category/social-media-management-tools", isActive: false },
        { title: "Survey and form builders", url: "/category/survey-form-builders", isActive: false },
        { title: "Business intelligence software", url: "/category/business-intelligence-software", isActive: false },
        { title: "Marketing automation platforms", url: "/category/marketing-automation-platforms", isActive: false },
        { title: "Social media scheduling tools", url: "/category/social-media-scheduling-tools", isActive: false }
      ],
    },
    {
      title: "AI",
      url: "#",
      items: [
        { title: "AI Characters", url: "/category/ai-characters", isActive: false },
        { title: "AI Content Detection", url: "/category/ai-content-detection", isActive: false },
        { title: "AI Generative Art", url: "/category/ai-generative-art", isActive: false },
        { title: "AI Infrastructure Tools", url: "/category/ai-infrastructure-tools", isActive: false },
        { title: "AI Voice Agents", url: "/category/ai-voice-agents", isActive: false },
        { title: "ChatGPT Prompts", url: "/category/chatgpt-prompts", isActive: false },
        { title: "Predictive AI", url: "/category/predictive-ai", isActive: false },
        { title: "AI Chatbots", url: "/category/ai-chatbots", isActive: false },
        { title: "AI Databases", url: "/category/ai-databases", isActive: false },
        { title: "AI Metrics and Evaluation", url: "/category/ai-metrics-evaluation", isActive: false },
        { title: "LLMs", url: "/category/llms", isActive: false },
        { title: "Text-to-Speech", url: "/category/text-to-speech", isActive: false }
      ],
    },
    {
      title: "Product add-ons",
      url: "#",
      items: [
        { title: "Chrome Extensions", url: "/category/chrome-extensions", isActive: false },
        { title: "Figma Templates", url: "/category/figma-templates", isActive: false },
        { title: "Slack apps", url: "/category/slack-apps", isActive: false },
        { title: "WordPress Plugins", url: "/category/wordpress-plugins", isActive: false },
        { title: "Figma Plugins", url: "/category/figma-plugins", isActive: false },
        { title: "Notion Templates", url: "/category/notion-templates", isActive: false },
        { title: "Twitter apps", url: "/category/twitter-apps", isActive: false },
        { title: "WordPress themes", url: "/category/wordpress-themes", isActive: false }
      ],
    },
    {
      title: "Web3",
      url: "#",
      items: [
        { title: "Crypto wallets", url: "/category/crypto-wallets", isActive: false },
        { title: "DeFi", url: "/category/defi", isActive: false },
        { title: "NFT creation tools", url: "/category/nft-creation-tools", isActive: false }
      ],
    },
    {
      title: "Frontend Resources",
      url: "#",
      items: [
        { title: "Blog", url: "/category/blog", isActive: false },
        { title: "Portfolio", url: "/category/portfolio", isActive: false },
        { title: "Personal", url: "/category/personal", isActive: false },
        { title: "Dashboard", url: "/category/dashboard", isActive: false },
        { title: "Landing Page", url: "/category/landing-page", isActive: false },
        { title: "Business", url: "/category/business", isActive: false },
        { title: "Documentation", url: "/category/documentation", isActive: false },
        { title: "Ecommerce", url: "/category/ecommerce", isActive: false },
        { title: "Boilerplates", url: "/category/boilerplates", isActive: false },
        { title: "UI Kits & Components", url: "/category/ui-kits-components", isActive: false },
        { title: "Templates & Themes", url: "/category/templates-themes", isActive: false }
      ],
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [categoryCounts, setCategoryCounts] = React.useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function fetchCategoryCounts() {
      setIsLoading(true);
      
      // Use direct client initialization instead of importing from server file
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      try {
        // Fetch all approved products and their categories
        const { data: products, error } = await supabase
          .from('products')
          .select('categories')
          .eq('status', 'approved');
        
        if (error) {
          console.error('Supabase query error:', error);
          return;
        }
        
        console.log('Fetched products:', products?.length || 0);
        
        // Calculate counts for each category
        const counts: Record<string, number> = {};
        
        // Process all products and count by category
        products?.forEach((product) => {
          if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach((category: string) => {
              // Convert slugs to database format if needed
              const normalizedCategory = category.includes('-') ? 
                category.replace(/-/g, '_') : category;
              
              counts[normalizedCategory] = (counts[normalizedCategory] || 0) + 1;
            });
          }
        });
        
        console.log('Category counts:', counts);
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCategoryCounts();
  }, []);
  
  // Helper function to get count for a specific category URL
  const getCategoryCount = (url: string): number => {
    if (!url.includes('/category/')) return 0;
    
    // Extract the category slug from the URL
    const slug = url.split('/category/')[1];
    if (!slug) return 0;
    
    // Try multiple formats for maximum compatibility
    const dbCategory = slug.replace(/-/g, '_');
    
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Getting count for ${slug} → ${dbCategory}: ${categoryCounts[dbCategory] || 0}`);
    }
    
    // Check various formats of the category name
    if (categoryCounts[dbCategory] !== undefined) {
      return categoryCounts[dbCategory];
    }
    
    // Try the original slug format
    if (categoryCounts[slug] !== undefined) {
      return categoryCounts[slug];
    }
    
    return 0;
  };
  
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
            defaultOpen={false}
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
                      {item.items.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton asChild isActive={pathname === subItem.url}>
                            <a href={subItem.url} className="flex items-center justify-between w-full py-1.5">
                              <div className="flex items-center gap-2 mr-2 flex-shrink overflow-hidden">
                                <span className="truncate">{subItem.title}</span>
                              </div>
                              <span className="text-muted-foreground text-sm font-medium flex-shrink-0 min-w-[15px] text-right">
                                {isLoading ? "" : getCategoryCount(subItem.url)}
                              </span>
                            </a>
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
