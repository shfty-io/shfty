'use client'

import Link from 'next/link'
import { UserNav } from '@/components/global/UserNav'
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createBrowserClient } from '@supabase/ssr'
import { cn } from '@/lib/utils'

// Full categories data for sidebar
const allCategories = [
  {
    title: "Work & Productivity",
    url: "#",
    items: [
      { title: "AI notetakers", url: "/category/ai-notetakers" },
      { title: "App switcher", url: "/category/app-switcher" },
      { title: "Compliance software", url: "/category/compliance-software" },
      { title: "Customer support tools", url: "/category/customer-support-tools" },
      { title: "E-signature apps", url: "/category/e-signature-apps" },
      { title: "Email clients", url: "/category/email-clients" },
      { title: "Knowledge base software", url: "/category/knowledge-base-software" },
      { title: "Meeting software", url: "/category/meeting-software" },
      { title: "Note and writing apps", url: "/category/note-and-writing-apps" },
      { title: "Password managers", url: "/category/password-managers" },
      { title: "PDF Editor", url: "/category/pdf-editor" },
      { title: "Presentation Software", url: "/category/presentation-software" },
      { title: "Project management software", url: "/category/project-management-software" },
      { title: "Scheduling software", url: "/category/scheduling-software" },
      { title: "Screenshots & screen recording", url: "/category/screenshots-and-screen-recording-apps" },
      { title: "Search", url: "/category/search" },
      { title: "Security software", url: "/category/security-software" },
      { title: "Spreadsheets", url: "/category/spreadsheets" },
      { title: "Team collaboration software", url: "/category/team-collaboration-software" },
    ]
  },
  {
    title: "Engineering & Development",
    url: "#",
    items: [
      { title: "A/B testing tools", url: "/category/ab-testing-tools" },
      { title: "AI Coding Assistants", url: "/category/ai-coding-assistants" },
      { title: "Authentication & identity tools", url: "/category/authentication-identity-tools" },
      { title: "Automation tools", url: "/category/automation-tools" },
      { title: "Code editors", url: "/category/code-editors" },
      { title: "Code Review Tools", url: "/category/code-review-tools" },
      { title: "Command line tools", url: "/category/command-line-tools" },
      { title: "Content Management Systems", url: "/category/content-management-systems" },
      { title: "Data analysis tools", url: "/category/data-analysis-tools" },
      { title: "Data visualization tools", url: "/category/data-visualization-tools" },
      { title: "Databases & backend frameworks", url: "/category/databases-backend-frameworks" },
      { title: "Git clients", url: "/category/git-clients" },
      { title: "Headless CMS software", url: "/category/headless-cms-software" },
      { title: "Hiring software", url: "/category/hiring-software" },
      { title: "Issue tracking software", url: "/category/issue-tracking-software" },
      { title: "No-code platforms", url: "/category/no-code-platforms" },
      { title: "Observability tools", url: "/category/observability-tools" },
      { title: "Standup bots", url: "/category/standup-bots" },
      { title: "Static site generators", url: "/category/static-site-generators" },
      { title: "Testing & QA software", url: "/category/testing-qa-software" },
      { title: "Unified API", url: "/category/unified-api" },
      { title: "VPN client", url: "/category/vpn-client" },
      { title: "Website analytics", url: "/category/website-analytics" },
    ]
  },
  {
    title: "Design & Creative",
    url: "#",
    items: [
      { title: "Background removal tools", url: "/category/background-removal-tools" },
      { title: "Design mockups", url: "/category/design-mockups" },
      { title: "Design resources", url: "/category/design-resources" },
      { title: "Digital whiteboards", url: "/category/digital-whiteboards" },
      { title: "Graphic design tools", url: "/category/graphic-design-tools" },
      { title: "Icon sets", url: "/category/icon-sets" },
      { title: "Interface design tools", url: "/category/interface-design-tools" },
      { title: "Photo editing", url: "/category/photo-editing" },
      { title: "UI frameworks", url: "/category/ui-frameworks" },
      { title: "User research", url: "/category/user-research" },
      { title: "Wireframing", url: "/category/wireframing" },
    ]
  },
  {
    title: "AI",
    url: "#",
    items: [
      { title: "AI Characters", url: "/category/ai-characters" },
      { title: "AI Chatbots", url: "/category/ai-chatbots" },
      { title: "AI Content Detection", url: "/category/ai-content-detection" },
      { title: "AI Databases", url: "/category/ai-databases" },
      { title: "AI Generative Art", url: "/category/ai-generative-art" },
      { title: "AI Headshot Generators", url: "/category/ai-headshot-generators" },
      { title: "AI Infrastructure Tools", url: "/category/ai-infrastructure-tools" },
      { title: "AI Metrics and Evaluation", url: "/category/ai-metrics-evaluation" },
      { title: "AI Voice Agents", url: "/category/ai-voice-agents" },
      { title: "ChatGPT Prompts", url: "/category/chatgpt-prompts" },
      { title: "LLMs", url: "/category/llms" },
      { title: "Predictive AI", url: "/category/predictive-ai" },
      { title: "Text-to-Speech", url: "/category/text-to-speech" },
    ]
  },
  {
    title: "Social & Community",
    url: "#",
    items: [
      { title: "Blogging platforms", url: "/category/blogging-platforms" },
      { title: "Community management", url: "/category/community-management" },
      { title: "Dating apps", url: "/category/dating-apps" },
      { title: "Link in bio tools", url: "/category/link-in-bio-tools" },
      { title: "Messaging apps", url: "/category/messaging-apps" },
      { title: "Microblogging platforms", url: "/category/microblogging-platforms" },
      { title: "Newsletter platforms", url: "/category/newsletter-platforms" },
      { title: "Safety and Privacy platforms", url: "/category/safety-privacy-platforms" },
    ]
  },
  {
    title: "Marketing & SEO",
    url: "#",
    items: [
      { title: "Advertising tools", url: "/category/advertising-tools" },
      { title: "Business intelligence software", url: "/category/business-intelligence-software" },
      { title: "CRM software", url: "/category/crm-software" },
      { title: "Email marketing", url: "/category/email-marketing" },
      { title: "Keyword research tools", url: "/category/keyword-research-tools" },
      { title: "Lead generation software", url: "/category/lead-generation-software" },
      { title: "Marketing automation platforms", url: "/category/marketing-automation-platforms" },
      { title: "Sales enablement", url: "/category/sales-enablement" },
      { title: "SEO tools", url: "/category/seo-tools" },
      { title: "Social media management tools", url: "/category/social-media-management-tools" },
      { title: "Social media scheduling tools", url: "/category/social-media-scheduling-tools" },
      { title: "Survey & form builders", url: "/category/survey-form-builders" },
    ]
  },
  {
    title: "Gaming",
    url: "#", 
    items: [
      { title: "Action games", url: "/category/action-games" },
      { title: "Adventure games", url: "/category/adventure-games" },
      { title: "Board games", url: "/category/board-games" },
      { title: "Card games", url: "/category/card-games" },
      { title: "Educational games", url: "/category/educational-games" },
      { title: "Puzzle games", url: "/category/puzzle-games" },
      { title: "Role playing games", url: "/category/role-playing-games" },
      { title: "Simulation games", url: "/category/simulation-games" },
      { title: "Sports games", url: "/category/sports-games" },
      { title: "Strategy games", url: "/category/strategy-games" },
    ]
  },
  {
    title: "Extensions & Plugins",
    url: "#",
    items: [
      { title: "Chrome extensions", url: "/category/chrome-extensions" },
      { title: "Figma plugins", url: "/category/figma-plugins" },
      { title: "Figma templates", url: "/category/figma-templates" },
      { title: "Notion templates", url: "/category/notion-templates" },
      { title: "Slack apps", url: "/category/slack-apps" },
      { title: "Twitter apps", url: "/category/twitter-apps" },
      { title: "WordPress plugins", url: "/category/wordpress-plugins" },
      { title: "WordPress themes", url: "/category/wordpress-themes" },
    ]
  },
  {
    title: "Web3 & Crypto",
    url: "#",
    items: [
      { title: "Crypto wallets", url: "/category/crypto-wallets" },
      { title: "DeFi", url: "/category/defi" },
      { title: "NFT creation tools", url: "/category/nft-creation-tools" },
    ]
  },
  {
    title: "Templates",
    url: "#",
    items: [
      { title: "Blog", url: "/category/blog" },
      { title: "Boilerplates", url: "/category/boilerplates" },
      { title: "Business", url: "/category/business" },
      { title: "Dashboard", url: "/category/dashboard" },
      { title: "Documentation", url: "/category/documentation" },
      { title: "Ecommerce", url: "/category/ecommerce" },
      { title: "Landing page", url: "/category/landing-page" },
      { title: "Personal", url: "/category/personal" },
      { title: "Portfolio", url: "/category/portfolio" },
      { title: "Templates & themes", url: "/category/templates-themes" },
      { title: "UI kits & components", url: "/category/ui-kits-components" },
    ]
  }
]

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>("Work & Productivity")
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [isLoadingCounts, setIsLoadingCounts] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    async function loadUser() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error fetching session:", error)
          return
        }
        
        setUser(data.session?.user || null)
      } catch (err) {
        console.error("Failed to load user:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      
      // Refresh page on auth state change
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  useEffect(() => {
    async function fetchCategoryCounts() {
      setIsLoadingCounts(true)
      
      // Use direct client initialization
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
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    }
    
    if (mounted) {
      fetchCategoryCounts();
    }
  }, [mounted]);

  // Helper function to get count for a specific category URL
  const getCategoryCount = (url: string): number => {
    if (!url.includes('/category/')) return 0;
    
    // Extract the category slug from the URL
    const slug = url.split('/category/')[1];
    if (!slug) return 0;
    
    // Try multiple formats for maximum compatibility
    const dbCategory = slug.replace(/-/g, '_');
    
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

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-8 max-w-full">
        <div className="flex items-center w-1/4 justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-semibold text-xl">shfty</span>
          </Link>
        </div>
        
        <div className="flex w-2/4 justify-center">
          <nav className="hidden md:flex items-center mx-auto space-x-6 text-sm font-medium">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-base">
                  Categories
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                  <span className="sr-only">Toggle categories menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-[min(90vw,900px)] p-0 flex"
                forceMount
              >
                <div className="flex h-[500px]">
                  <div className="bg-muted/50 border-r w-[200px] py-2 h-full overflow-y-auto">
                    {allCategories.map((category) => (
                      <div
                        key={category.title}
                        className={cn(
                          "px-3 py-2 text-sm font-medium cursor-pointer hover:bg-muted",
                          hoveredCategory === category.title && "bg-muted"
                        )}
                        onMouseEnter={() => setHoveredCategory(category.title)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.title}</span>
                          <ChevronRight className="h-4 w-4 opacity-70" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 w-[700px] h-full overflow-y-auto">
                    {hoveredCategory ? (
                      <>
                        <h3 className="font-semibold mb-4 text-lg text-foreground sticky top-0 bg-background/95 backdrop-blur z-10 py-1">
                          {hoveredCategory}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 min-h-[400px]">
                          {allCategories
                            .find(c => c.title === hoveredCategory)?.items
                            .map((item) => (
                              <Link
                                key={item.title}
                                href={item.url}
                                className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-muted text-sm transition-colors h-10 w-full"
                              >
                                <span className="mr-2 truncate">{item.title}</span>
                                <span className="text-muted-foreground text-xs font-medium rounded-full px-2 py-0.5 bg-muted whitespace-nowrap flex-shrink-0">
                                  {isLoadingCounts ? "..." : getCategoryCount(item.url)}
                                </span>
                              </Link>
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        Hover over a category to see subcategories
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        
        <div className="flex items-center w-1/4 justify-end space-x-4">
          <Button variant="default" asChild className="hidden md:inline-flex">
            <Link href={user ? "/your/sell" : "/auth/login"}>Sell</Link>
          </Button>
          
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : (
            <UserNav initialUser={user} />
          )}
          
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <div className="px-2">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                    <span className="font-semibold text-xl">shfty</span>
                  </Link>
                  <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </SheetClose>
                </div>
                
                <div className="space-y-2 mb-8">
                  <Link 
                    href={user ? "/your/sell" : "/auth/login"} 
                    className="block px-3 py-2 text-base font-medium rounded-md bg-primary text-primary-foreground" 
                    onClick={() => setSidebarOpen(false)}
                  >
                    Sell
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {allCategories.map((category) => (
                    <div key={category.title} className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground px-3 py-1">
                        {category.title}
                      </h3>
                      <div className="space-y-1">
                        {category.items.slice(0, 8).map((item) => (
                          <Link
                            key={item.title}
                            href={item.url}
                            className="flex items-center justify-between px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span>{item.title}</span>
                            <span className="text-muted-foreground text-xs">
                              {isLoadingCounts ? "..." : getCategoryCount(item.url)}
                            </span>
                          </Link>
                        ))}
                        {category.items.length > 8 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="px-3 h-auto py-1"
                            asChild
                          >
                            <Link 
                              href={`/categories#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              View all {category.items.length} items
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 