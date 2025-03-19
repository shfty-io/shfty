"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { migrateRichTextFormatting } from '@/lib/utils';
import { Upload, X, Wand2, Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { UrlInput } from "@/components/ui/url-input";
import { TagsSelector } from "./TagsSelector";
import { LicenseSelector } from "./LicenseSelector";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createClient } from "@/lib/client";

// Redefine the props interface locally
interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<{ success?: boolean; error?: string }>;
  initialData?: ProductFormData | null;
}

// Define FeatureItem locally
interface FeatureItem {
  question: string;
  answer: string;
}

// Add constants from ProductForm
const MAX_NAME_LENGTH = 25;
const MAX_SHORT_DESCRIPTION_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Update the categories array with all options
const categories = [
  // Work & Productivity
  { id: "ai_notetakers", label: "AI Notetakers" },
  { id: "app_switcher", label: "App Switcher" },
  { id: "compliance_software", label: "Compliance Software" },
  { id: "e_signature_apps", label: "E-Signature Apps" },
  { id: "knowledge_base_software", label: "Knowledge Base Software" },
  { id: "meeting_software", label: "Meeting Software" },
  { id: "pdf_editor", label: "PDF Editor" },
  { id: "presentation_software", label: "Presentation Software" },
  { id: "project_management_software", label: "Project Management Software" },
  { id: "scheduling_software", label: "Scheduling Software" },
  { id: "search", label: "Search" },
  { id: "spreadsheets", label: "Spreadsheets" },
  { id: "ad_blockers", label: "Ad Blockers" },
  { id: "customer_support_tools", label: "Customer Support Tools" },
  { id: "email_clients", label: "Email Clients" },
  { id: "note_and_writing_apps", label: "Note and Writing Apps" },
  { id: "password_managers", label: "Password Managers" },
  { id: "screenshots_and_screen_recording_apps", label: "Screenshots & Screen Recording Apps" },
  { id: "security_software", label: "Security Software" },
  { id: "team_collaboration_software", label: "Team Collaboration Software" },
  
  // Engineering & Development
  { id: "ab_testing_tools", label: "A/B Testing Tools" },
  { id: "authentication_identity_tools", label: "Authentication & Identity Tools" },
  { id: "content_management_systems", label: "Content Management Systems" },
  { id: "code_review_tools", label: "Code Review Tools" },
  { id: "command_line_tools", label: "Command Line Tools" },
  { id: "data_visualization_tools", label: "Data Visualization Tools" },
  { id: "git_clients", label: "Git Clients" },
  { id: "issue_tracking_software", label: "Issue Tracking Software" },
  { id: "no_code_platforms", label: "No-Code Platforms" },
  { id: "standup_bots", label: "Standup Bots" },
  { id: "testing_qa_software", label: "Testing and QA Software" },
  { id: "vpn_client", label: "VPN Client" },
  { id: "ai_coding_assistants", label: "AI Coding Assistants" },
  { id: "automation_tools", label: "Automation Tools" },
  { id: "code_editors", label: "Code Editors" },
  { id: "data_analysis_tools", label: "Data Analysis Tools" },
  { id: "databases_backend_frameworks", label: "Databases and Backend Frameworks" },
  { id: "headless_cms_software", label: "Headless CMS Software" },
  { id: "observability_tools", label: "Observability Tools" },
  { id: "static_site_generators", label: "Static Site Generators" },
  { id: "unified_api", label: "Unified API" },
  { id: "website_analytics", label: "Website Analytics" },
  
  // Design & Creative
  { id: "design_mockups", label: "Design Mockups" },
  { id: "digital_whiteboards", label: "Digital Whiteboards" },
  { id: "icon_sets", label: "Icon Sets" },
  { id: "ui_frameworks", label: "UI Frameworks" },
  { id: "wireframing", label: "Wireframing" },
  { id: "background_removal_tools", label: "Background Removal Tools" },
  { id: "design_resources", label: "Design Resources" },
  { id: "graphic_design_tools", label: "Graphic Design Tools" },
  { id: "interface_design_tools", label: "Interface Design Tools" },
  { id: "photo_editing", label: "Photo Editing" },
  { id: "user_research", label: "User Research" },
  
  // Social & Community
  { id: "blogging_platforms", label: "Blogging Platforms" },
  { id: "dating_apps", label: "Dating Apps" },
  { id: "microblogging_platforms", label: "Microblogging Platforms" },
  { id: "safety_privacy_platforms", label: "Safety and Privacy Platforms" },
  { id: "community_management", label: "Community Management" },
  { id: "link_in_bio_tools", label: "Link in Bio Tools" },
  { id: "messaging_apps", label: "Messaging Apps" },
  { id: "newsletter_platforms", label: "Newsletter Platforms" },
  
  // Marketing & Sales
  { id: "advertising_tools", label: "Advertising Tools" },
  { id: "seo_tools", label: "SEO Tools" },
  { id: "crm_software", label: "CRM Software" },
  { id: "email_marketing", label: "Email Marketing" },
  { id: "keyword_research_tools", label: "Keyword Research Tools" },
  { id: "lead_generation_software", label: "Lead Generation Software" },
  { id: "sales_enablement", label: "Sales Enablement" },
  { id: "social_media_management_tools", label: "Social Media Management Tools" },
  { id: "survey_form_builders", label: "Survey and Form Builders" },
  { id: "business_intelligence_software", label: "Business Intelligence Software" },
  { id: "marketing_automation_platforms", label: "Marketing Automation Platforms" },
  { id: "social_media_scheduling_tools", label: "Social Media Scheduling Tools" },
  
  // AI
  { id: "ai_characters", label: "AI Characters" },
  { id: "ai_content_detection", label: "AI Content Detection" },
  { id: "ai_generative_art", label: "AI Generative Art" },
  { id: "ai_infrastructure_tools", label: "AI Infrastructure Tools" },
  { id: "ai_voice_agents", label: "AI Voice Agents" },
  { id: "chatgpt_prompts", label: "ChatGPT Prompts" },
  { id: "predictive_ai", label: "Predictive AI" },
  { id: "ai_chatbots", label: "AI Chatbots" },
  { id: "ai_databases", label: "AI Databases" },
  { id: "ai_metrics_evaluation", label: "AI Metrics and Evaluation" },
  { id: "llms", label: "LLMs" },
  { id: "text_to_speech", label: "Text-to-Speech" },
  
  // Games
  { id: "action_games", label: "Action Games" },
  { id: "adventure_games", label: "Adventure Games" },
  { id: "puzzle_games", label: "Puzzle Games" },
  { id: "strategy_games", label: "Strategy Games" },
  { id: "role_playing_games", label: "Role-Playing Games" },
  { id: "simulation_games", label: "Simulation Games" },
  { id: "sports_games", label: "Sports Games" },
  { id: "board_games", label: "Board Games" },
  { id: "card_games", label: "Card Games" },
  { id: "educational_games", label: "Educational Games" },
  
  // Product add-ons
  { id: "chrome_extensions", label: "Chrome Extensions" },
  { id: "figma_templates", label: "Figma Templates" },
  { id: "slack_apps", label: "Slack Apps" },
  { id: "wordpress_plugins", label: "WordPress Plugins" },
  { id: "figma_plugins", label: "Figma Plugins" },
  { id: "notion_templates", label: "Notion Templates" },
  { id: "twitter_apps", label: "Twitter Apps" },
  { id: "wordpress_themes", label: "WordPress Themes" },
  
  // Web3
  { id: "crypto_wallets", label: "Crypto Wallets" },
  { id: "defi", label: "DeFi" },
  { id: "nft_creation_tools", label: "NFT Creation Tools" },
  
  // Frontend Resources
  { id: "blog", label: "Blog" },
  { id: "portfolio", label: "Portfolio" },
  { id: "personal", label: "Personal" },
  { id: "dashboard", label: "Dashboard" },
  { id: "landing_page", label: "Landing Page" },
  { id: "business", label: "Business" },
  { id: "documentation", label: "Documentation" },
  { id: "ecommerce", label: "Ecommerce" },
  { id: "boilerplates", label: "Boilerplates" },
  { id: "ui_kits_components", label: "UI Kits & Components" },
  { id: "templates_themes", label: "Templates & Themes" }
];

// Update the technologies array with all options
const technologies = [
  // Frontend
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" },
  { id: "svelte", label: "Svelte" },
  { id: "next_js", label: "Next.js" },
  { id: "nuxt", label: "Nuxt" },
  { id: "tailwind", label: "Tailwind" },
  { id: "remix", label: "Remix" },
  { id: "astro", label: "Astro" },
  { id: "solid_js", label: "Solid.js" },
  { id: "qwik", label: "Qwik" },
  // Languages
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  // Backend
  { id: "node_js", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "c_sharp", label: "C#" },
  { id: "dotnet", label: ".NET" },
  { id: "deno", label: "Deno" },
  // Frameworks
  { id: "express", label: "Express" },
  { id: "fastapi", label: "FastAPI" },
  { id: "django", label: "Django" },
  { id: "laravel", label: "Laravel" },
  { id: "spring_boot", label: "Spring Boot" },
  // Databases
  { id: "postgresql", label: "PostgreSQL" },
  { id: "mysql", label: "MySQL" },
  { id: "mongodb", label: "MongoDB" },
  { id: "supabase", label: "Supabase" },
  { id: "firebase", label: "Firebase" },
  { id: "prisma", label: "Prisma" },
  { id: "drizzle", label: "Drizzle" },
  { id: "redis", label: "Redis" },
  // Cloud & Infrastructure
  { id: "aws", label: "AWS" },
  { id: "google_cloud", label: "Google Cloud" },
  { id: "azure", label: "Azure" },
  { id: "vercel", label: "Vercel" },
  { id: "docker", label: "Docker" },
  { id: "kubernetes", label: "Kubernetes" },
  // Authentication
  { id: "clerk", label: "Clerk" },
  { id: "auth0", label: "Auth0" },
  { id: "nextauth", label: "NextAuth" },
  // Mobile & Desktop
  { id: "react_native", label: "React Native" },
  { id: "flutter", label: "Flutter" },
  { id: "swift", label: "Swift" },
  { id: "kotlin", label: "Kotlin" },
  { id: "electron", label: "Electron" },
  { id: "tauri", label: "Tauri" },
  { id: "capacitor", label: "Capacitor" },
  // Other
  { id: "stripe", label: "Stripe" },
  { id: "ngrok", label: "Ngrok" },
  { id: "graphql", label: "GraphQL" },
  { id: "websocket", label: "WebSocket" },
  { id: "pwa", label: "PWA" },
  { id: "webassembly", label: "WebAssembly" },
];

// Add full licenses array
const licenses = [
  { id: 'MIT', label: 'MIT License' },
  { id: 'GPL-3.0', label: 'GNU General Public License v3.0' },
  { id: 'Apache-2.0', label: 'Apache License 2.0' },
  { id: 'BSD-3-Clause', label: 'BSD 3-Clause License' },
  { id: 'BSD-2-Clause', label: 'BSD 2-Clause License' },
  { id: 'LGPL-3.0', label: 'GNU Lesser General Public License v3.0' },
  { id: 'MPL-2.0', label: 'Mozilla Public License 2.0' },
  { id: 'AGPL-3.0', label: 'GNU Affero General Public License v3.0' },
  { id: 'Unlicense', label: 'The Unlicense' },
  { id: 'Proprietary', label: 'Proprietary License' },
  { id: 'CC0-1.0', label: 'Creative Commons Zero v1.0 Universal' },
  { id: 'CC-BY-4.0', label: 'Creative Commons Attribution 4.0' },
  { id: 'CC-BY-SA-4.0', label: 'Creative Commons Attribution Share Alike 4.0' },
  { id: 'Other', label: 'Other License' },
];

// Define FocalPointSelector component
interface FocalPointSelectorProps {
  imageUrl: string;
  initialPosition?: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FocalPointSelector({ imageUrl, initialPosition = { x: 50, y: 50 }, onPositionChange, open, onOpenChange }: FocalPointSelectorProps) {
  const [position, setPosition] = useState(initialPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Update position when initialPosition changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);
  
  // Measure container on mount and resize
  useEffect(() => {
    if (!open) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    // Initial measurement with a slight delay to ensure rendering
    const timer = setTimeout(updateSize, 50);
    
    // Listen for window resize
    window.addEventListener('resize', updateSize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, [open]);
  
  // Handle mouse/touch down
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartDragPos({ x: clientX, y: clientY });
  };
  
  // Handle mouse/touch move - wrap in useCallback
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaX = clientX - startDragPos.x;
    const deltaY = clientY - startDragPos.y;
    
    // Calculate new position as percentage
    let newX = position.x - (deltaX / containerSize.width) * 100;
    let newY = position.y - (deltaY / containerSize.height) * 100;
    
    // Clamp values between 0 and 100
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    
    setPosition({ x: newX, y: newY });
    setStartDragPos({ x: clientX, y: clientY });
  }, [isDragging, position.x, position.y, startDragPos.x, startDragPos.y, containerSize.width, containerSize.height]);
  
  // Handle mouse/touch up - wrap in useCallback
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    onPositionChange(position);
  }, [isDragging, onPositionChange, position]);
  
  // Add global event listeners for dragging
  useEffect(() => {
    if (!open) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.clientX, e.clientY);
      }
    };
    
    const handleMouseUp = () => {
      handleDragEnd();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    const handleTouchEnd = () => {
      handleDragEnd();
    };
    
    // Add document-level event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    // Add ESC key handler to close the modal
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [open, isDragging, onOpenChange, handleDragEnd, handleDragMove]);
  
  // If not open, don't render anything
  if (!open) return null;
  
  // Use Dialog for a more integrated approach
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" onInteractOutside={(e) => {
        if (isDragging) {
          e.preventDefault();
        }
      }} onPointerMove={(e) => {
        if (isDragging) {
          e.preventDefault();
          handleDragMove(e.clientX, e.clientY);
        }
      }}>
        <DialogHeader>
          <DialogTitle>Adjust Image Position</DialogTitle>
          <DialogDescription>
            Drag the image to adjust which part will be visible in the 4:3 frame. 
            The outlined area shows exactly what will be displayed.
          </DialogDescription>
        </DialogHeader>
        
        <div 
          ref={containerRef}
          className="relative aspect-[4/3] overflow-hidden rounded-md border-2 border-primary cursor-move mt-4"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDragStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.touches[0]) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
        >
          {/* The image that can be dragged */}
          <div 
            className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ touchAction: 'none' }}
          >
            {/* Using a styled div instead of img or Image to avoid Next.js warning while maintaining drag functionality */}
            <div 
              ref={imageRef}
              className="absolute max-w-none w-full h-full"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: 'cover'
              }}
            />
          </div>
          
          {/* Visual indicator for dragging */}
          {isDragging && (
            <div className="absolute inset-0 border-4 border-white/30 pointer-events-none" />
          )}
        </div>

        <div className="flex justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            This is exactly how your image will appear in the product card.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onPositionChange(position);
                onOpenChange(false);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Update the ProductFormData definition to extend Omit<OriginalType, 'byline'>
export type ProductFormData = {
  id?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  categories: string[];
  technologies: string[];
  features: FeatureItem[];
  githubRepoUrl?: string | null;
  softwareLicense?: string | null;
  imageUrls: string[];
  imagePositions?: Record<string, { x: number; y: number }>;
  videoUrl?: string | null;
  demoUrl?: string | null;
};

// Add GitHubRepo interface
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
    type: string;
  };
}

export function ProductEditForm({ onSubmit, initialData }: ProductFormProps) {
  // Add state hooks from ProductForm
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancingShortDesc, setIsEnhancingShortDesc] = useState(false);
  const [isEnhancingFullDesc, setIsEnhancingFullDesc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state for focal point editing
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [isFocalPointDialogOpen, setIsFocalPointDialogOpen] = useState(false);

  // Add these state variables near the other state declarations, around line 385-390
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isTechnologiesOpen, setIsTechnologiesOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);

  // Add GitHub repos state
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  
  // Add state for manual GitHub URL checking
  const [isCheckingRepo, setIsCheckingRepo] = useState(false);
  const [manualRepoIsPublic, setManualRepoIsPublic] = useState<boolean | null>(null);
  
  // Add description length state
  const [descriptionLength, setDescriptionLength] = useState(0);
  
  // Add selected tags state
  const [selectedCategories, setSelectedCategories] = useState(
    initialData?.categories 
      ? categories.filter(cat => initialData.categories.includes(cat.id)) 
      : []
  );
  
  const [selectedTechnologies, setSelectedTechnologies] = useState(
    initialData?.technologies 
      ? technologies.filter(tech => initialData.technologies.includes(tech.id)) 
      : []
  );

  // Add license state
  const [selectedLicense, setSelectedLicense] = useState(
    initialData?.softwareLicense 
      ? licenses.find(l => l.id === initialData.softwareLicense) || null 
      : null
  );

  // Update initial formData state to include imagePositions
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ? migrateRichTextFormatting(initialData.description) : "",
    price: initialData?.price ?? 0,
    categories: initialData?.categories ?? [],
    technologies: initialData?.technologies ?? [],
    features: initialData?.features || [],
    githubRepoUrl: initialData?.githubRepoUrl || null,
    softwareLicense: initialData?.softwareLicense || null,
    imageUrls: initialData?.imageUrls ?? [],
    imagePositions: initialData?.imagePositions || {},
    videoUrl: initialData?.videoUrl || null,
    demoUrl: initialData?.demoUrl || null
  });
  
  // Initialize featureItems from initialData
  const [featureItems, setFeatureItems] = useState<FeatureItem[]>(() => {
    if (!initialData?.features) return [];
    try {
      return typeof initialData.features === 'string' 
        ? JSON.parse(initialData.features) 
        : Array.isArray(initialData.features) 
          ? initialData.features 
          : [];
    } catch {
      return [];
    }
  });

  // Add fetchGitHubRepos function
  const fetchGitHubRepos = useCallback(async () => {
    try {
      const response = await fetch('/api/github/repos');
      const data = await response.json();
      
      if (!response.ok) {
        // Check if we need to re-authenticate
        if (data.requiresReauth) {
          // Redirect to GitHub OAuth flow
          const supabase = createClient();
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              scopes: 'repo',
              redirectTo: `${siteUrl}/auth/callback`
            }
          });
          
          if (error) {
            throw new Error('Failed to initiate GitHub re-authentication');
          }
          return;
        }
        throw new Error(data.error);
      }
      
      setGithubRepos(data.repositories);
      
      // Check if current githubRepoUrl is in the fetched repos
      if (formData.githubRepoUrl) {
        const found = data.repositories.find((repo: GitHubRepo) => repo.html_url === formData.githubRepoUrl);
        if (found) {
        } else {
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not fetch your GitHub repositories",
        variant: "destructive"
      });
    }
  }, [formData.githubRepoUrl]);

  // Add function to check GitHub repository visibility
  const checkGitHubRepositoryVisibility = async (url: string) => {
    if (!url) return;
    
    try {
      setIsCheckingRepo(true);
      setManualRepoIsPublic(null);
      
      const response = await fetch('/api/github/check-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl: url }),
      });
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setManualRepoIsPublic(data.isPublic);
        
        // If it's a public repo, set price to 0
        if (data.isPublic) {
          setFormData(prev => ({
            ...prev,
            price: 0
          }));
        }
      }
    } catch {
    } finally {
      setIsCheckingRepo(false);
    }
  };

  // Add effect to check GitHub repo URL when it changes
  useEffect(() => {
    if (formData.githubRepoUrl && !githubRepos.find(repo => repo.html_url === formData.githubRepoUrl)) {
      checkGitHubRepositoryVisibility(formData.githubRepoUrl);
    }
  }, [formData.githubRepoUrl, githubRepos]);
  
  // Add effect to set price to 0 for public repositories from user's own repos
  useEffect(() => {
    if (formData.githubRepoUrl && githubRepos.length > 0) {
      const selectedRepo = githubRepos.find(repo => repo.html_url === formData.githubRepoUrl);
      if (selectedRepo) {
        if (!selectedRepo.private) {
          setFormData(prev => ({
            ...prev,
            price: 0
          }));
        }
      }
    }
  }, [formData.githubRepoUrl, githubRepos]);

  // Check repository when component mounts if there's a githubRepoUrl in initialData
  useEffect(() => {
    if (initialData?.githubRepoUrl) {
      fetchGitHubRepos();
    }
  }, [initialData?.githubRepoUrl, fetchGitHubRepos]);

  useEffect(() => {
    if (typeof window !== 'undefined' && initialData?.description) {
      setFormData(prev => ({
        ...prev,
        description: migrateRichTextFormatting(initialData.description)
      }));
    }
  }, [initialData?.description]);

  // Add effect to update description length
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.description;
      setDescriptionLength(tempDiv.textContent?.length || 0);
    }
  }, [formData.description]);

  const addFeatureItem = () => {
    setFeatureItems([...featureItems, { question: '', answer: '' }]);
  };

  const removeFeatureItem = (index: number) => {
    setFeatureItems(featureItems.filter((_, i) => i !== index));
  };

  const updateFeatureItem = (index: number, field: 'question' | 'answer', value: string) => {
    const newFeatureItems = [...featureItems];
    newFeatureItems[index][field] = value;
    setFeatureItems(newFeatureItems);
  };

  // Add handlers from ProductForm (image upload, video upload, GitHub repos, etc)
  const handleMultipleImageUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    const remainingSlots = 8 - formData.imageUrls.length;

    // Check if we're trying to upload too many files
    if (totalFiles > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const uploadPromises = fileArray.map(async (file) => {
      try {
        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error(`${file.name} is not a valid image type`);
        }

        const fileExt = file.name.split('.').pop();
        
        const supabase = createClient();
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Create a unique filename with a random component
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Create a path with user_id and product_id (if available)
        let filePath = `images/${user.id}`;
        
        // If we have initialData with an id, use it for the subfolder
        if (initialData?.id) {
          filePath += `/${initialData.id}`;
        } else {
          // For new products, create a temporary folder with timestamp
          filePath += `/temp-${Date.now()}`;
        }
        
        filePath += `/${uniqueFileName}`;

        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(data.path);

        return publicUrl;
      } catch (error) {
        throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value);

      const failedUploads = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (successfulUploads.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...successfulUploads]
        }));

        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${successfulUploads.length} image${successfulUploads.length === 1 ? '' : 's'}`,
        });
      }

      if (failedUploads.length > 0) {
        toast({
          title: "Some uploads failed",
          description: `${failedUploads.length} file${failedUploads.length === 1 ? '' : 's'} failed to upload`,
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Add AI enhancement functions
  const enhanceShortDescription = async () => {
    if (!formData.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a product name first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsEnhancingShortDesc(true);
      const response = await fetch('/api/ai/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: 'short',
          currentDescription: formData.shortDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance description');
      }

      const data = await response.json();
      
      if (data.description) {
        setFormData(prev => ({
          ...prev,
          shortDescription: data.description.substring(0, MAX_SHORT_DESCRIPTION_LENGTH)
        }));
      }
    } catch {
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancingShortDesc(false);
    }
  };

  const enhanceFullDescription = async () => {
    if (!formData.shortDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide a short description first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsEnhancingFullDesc(true);
      const response = await fetch('/api/ai/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: 'full',
          currentDescription: formData.description,
          shortDescription: formData.shortDescription,
          technologies: formData.technologies,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance description');
      }

      const data = await response.json();
      
      if (data.description) {
        setFormData(prev => ({
          ...prev,
          description: data.description
        }));
      }
    } catch {
      toast({
        title: "Enhancement Failed",
        description: "Could not enhance description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancingFullDesc(false);
    }
  };

  // Update handleSubmit validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim() === '') {
      toast({ title: "Validation Error", description: "Please provide a product name", variant: "destructive" });
      return;
    }

    if (formData.name.length > MAX_NAME_LENGTH) {
      toast({ title: "Validation Error", description: `Product name must be ${MAX_NAME_LENGTH} characters or less`, variant: "destructive" });
      return;
    }

    // Check minimum price for paid products
    if (formData.price > 0 && formData.price < 4.99) {
      toast({
        title: "Validation Error",
        description: "Minimum price for paid products is $4.99",
        variant: "destructive"
      });
      return;
    }

    if (!formData.shortDescription || formData.shortDescription.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please provide a short description",
        variant: "destructive"
      });
      return;
    }

    if (formData.shortDescription.length > MAX_SHORT_DESCRIPTION_LENGTH) {
      toast({
        title: "Validation Error",
        description: `Short description must be ${MAX_SHORT_DESCRIPTION_LENGTH} characters or less`,
        variant: "destructive"
      });
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please provide a full description",
        variant: "destructive"
      });
      return;
    }

    // Check description length by extracting plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.description;
    const descriptionLength = tempDiv.textContent?.length || 0;

    if (descriptionLength > MAX_DESCRIPTION_LENGTH) {
      toast({
        title: "Validation Error",
        description: `Full description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
        variant: "destructive"
      });
      return;
    }
    
    if (formData.imageUrls.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please upload at least 2 images of your product",
        variant: "destructive"
      });
      return;
    }

    // Check if this is a public repository
    const isPublicRepo = (formData.githubRepoUrl && !githubRepos.find(repo => repo.html_url === formData.githubRepoUrl)?.private) || 
        manualRepoIsPublic === true;
    
    // Create a copy of the form data with price set to 0 for public repos
    const finalFormData: ProductFormData = {
      ...formData,
      features: featureItems,
      price: isPublicRepo ? 0 : formData.price
    };

    try {
      setIsSubmitting(true);
      const result = await onSubmit(finalFormData);
      
      if (result.success) {
        toast({
          title: "Changes Saved",
          description: "Your product has been updated successfully.",
          variant: "default",
        });
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add these useEffect hooks
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      categories: selectedCategories.map(cat => cat.id)
    }));
  }, [selectedCategories]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      technologies: selectedTechnologies.map(tech => tech.id)
    }));
  }, [selectedTechnologies]);

  // Add this function with the other handlers
  const removeImage = (urlToRemove: string) => {
    if (formData.imageUrls.length <= 2) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least 2 images",
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
    }));
  };

  // Add handler for updating image position
  const updateImagePosition = (url: string, position: { x: number; y: number }) => {
    // Ensure we're creating a new object for the imagePositions to trigger state updates properly
    setFormData(prev => {
      const newImagePositions = {
        ...(prev.imagePositions || {}),
        [url]: position
      };
      
      return {
        ...prev,
        imagePositions: newImagePositions
      };
    });
  };

  // Add these handler functions around line 870-880, near other handler functions
  const handleCategoriesOpenChange = (isOpen: boolean) => {
    setIsCategoriesOpen(isOpen);
  };

  const handleTechnologiesOpenChange = (isOpen: boolean) => {
    setIsTechnologiesOpen(isOpen);
  };

  const handleLicenseOpenChange = (isOpen: boolean) => {
    setIsLicenseOpen(isOpen);
  };

  // Update JSX to match ProductForm structure
  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative z-[50]">
      <div className="space-y-6">
        {/* Product Basic Info Section */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name input */}
            <div className="space-y-2 relative z-[70]">
              <div className="h-6 flex items-center">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                  <span className="text-destructive ml-1">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={MAX_NAME_LENGTH}
                  placeholder="My Product"
                  required
                  className="h-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>The display name of your product</span>
                <span>{formData.name.length}/{MAX_NAME_LENGTH}</span>
              </p>
            </div>

            {/* Price input */}
            <div className="space-y-2 relative z-[70]">
              <div className="h-6 flex items-center">
                <Label htmlFor="price" className="text-sm font-medium">Price (USD)</Label>
              </div>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  min={(() => {
                    const repoInUserRepos = formData.githubRepoUrl && 
                      githubRepos.find(repo => repo.html_url === formData.githubRepoUrl);
                    const repoIsPublic = repoInUserRepos && !repoInUserRepos.private;
                    const isManuallyCheckedPublic = manualRepoIsPublic === true;
                    return repoIsPublic || isManuallyCheckedPublic ? 0 : 4.99;
                  })()}
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  required
                  className="h-10"
                  disabled={(() => {
                    const repoInUserRepos = formData.githubRepoUrl && 
                      githubRepos.find(repo => repo.html_url === formData.githubRepoUrl);
                    const repoIsPublic = repoInUserRepos && !repoInUserRepos.private;
                    const isManuallyCheckedPublic = manualRepoIsPublic === true;
                    const shouldDisable = Boolean(repoIsPublic || isManuallyCheckedPublic);
                    
                    return shouldDisable;
                  })()}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isCheckingRepo 
                  ? "Checking repository status..." 
                  : formData.githubRepoUrl 
                    ? githubRepos.find(repo => repo.html_url === formData.githubRepoUrl)?.private || manualRepoIsPublic === false
                      ? "Minimum price is $4.99 for paid products" 
                      : "Public repositories must be free"
                    : "Minimum price is $4.99 for paid products"}
              </p>
            </div>
          </div>
        </div>

        {/* Categories and Technologies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`space-y-2 relative ${isCategoriesOpen ? 'z-[150]' : 'z-0'}`}>
            <TagsSelector 
              tags={categories}
              selectedTags={selectedCategories}
              setSelectedTags={setSelectedCategories}
              title="Categories"
              maxTags={3}
              onOpenChange={handleCategoriesOpenChange}
            />
          </div>
          <div className={`space-y-2 relative ${isTechnologiesOpen ? 'z-[150]' : 'z-0'}`}>
            <TagsSelector 
              tags={technologies}
              selectedTags={selectedTechnologies}
              setSelectedTags={setSelectedTechnologies}
              title="Technologies Used"
              onOpenChange={handleTechnologiesOpenChange}
            />
          </div>
        </div>

        {/* License selector */}
        <div className={`space-y-2 relative ${isLicenseOpen ? 'z-[200]' : 'z-0'}`}>
          <div className="h-6 flex items-center">
            <Label htmlFor="softwareLicense" className="text-sm font-medium">Software License</Label>
          </div>
          <div className="relative">
            <LicenseSelector
              licenses={licenses}
              selectedLicense={selectedLicense}
              setSelectedLicense={(license) => {
                setSelectedLicense(license);
                setFormData({ ...formData, softwareLicense: license?.id || null });
              }}
              onOpenChange={handleLicenseOpenChange}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Specify the license under which your software is distributed
          </p>
        </div>

        {/* Demo URL Section */}
        <div className="space-y-2 relative z-[70]">
          <div className="h-6 flex items-center">
            <Label className="text-sm font-medium">Product Demo URL (Optional)</Label>
          </div>
          <div className="relative">
            <UrlInput
              placeholder="your-demo-url.com"
              value={formData.demoUrl ? formData.demoUrl.replace(/^https?:\/\//, '') : ''}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  demoUrl: e.target.value ? `https://${e.target.value}` : null 
                });
              }}
              className="h-10"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Link to a live demo of your product
          </p>
        </div>

        {/* Short Description */}
        <div className="space-y-2 relative z-[70]">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="shortDescription" className="text-sm font-medium">
              Short Description
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={enhanceShortDescription}
              disabled={isEnhancingShortDesc || !formData.name}
              className="flex items-center gap-1"
            >
              {isEnhancingShortDesc ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Enhance with AI</span>
                </>
              )}
            </Button>
          </div>
          <div className="relative">
            <Textarea
              id="shortDescription"
              placeholder="Used in search results and as an intro at the top of your template&apos;s page."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              required
              className="min-h-[80px] resize-y"
              maxLength={MAX_SHORT_DESCRIPTION_LENGTH}
            />
            {isEnhancingShortDesc && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex justify-between">
            <span>Brief description of your product</span>
            <span>{formData.shortDescription.length}/{MAX_SHORT_DESCRIPTION_LENGTH}</span>
          </p>
        </div>

        {/* Full Description */}
        <div className="space-y-2 relative z-[70]">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Full Description
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={enhanceFullDescription}
              disabled={isEnhancingFullDesc || !formData.shortDescription}
              className="flex items-center gap-1"
            >
              {isEnhancingFullDesc ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Enhance with AI</span>
                </>
              )}
            </Button>
          </div>
          <div className="relative w-full">
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Provide as much detail as possible to significantly increase sales."
              className="min-h-[300px]"
            />
            {isEnhancingFullDesc && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex justify-between">
            <span>Detailed information about your product</span>
            <span>{descriptionLength}/{MAX_DESCRIPTION_LENGTH}</span>
          </p>
        </div>

        {/* Media Upload Section */}
        <div className="space-y-2 relative z-[70]">
          <Label className="text-sm font-medium flex items-center">
            Product Media
            <span className="text-destructive ml-1">*</span>
            <span className="text-xs text-muted-foreground ml-2">
              (Minimum 2 images required)
            </span>
          </Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.imageUrls.map((url, index) => (
              <div key={url} className="relative aspect-[4/3] group">
                <div className="relative w-full h-full overflow-hidden rounded-md">
                  <Image 
                    src={url} 
                    alt={`Product image ${index + 1}`} 
                    fill 
                    className="object-cover rounded-md" 
                    style={{
                      objectPosition: formData.imagePositions?.[url] 
                        ? `${formData.imagePositions[url].x}% ${formData.imagePositions[url].y}%` 
                        : '50% 50%'
                    }}
                  />
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center gap-2 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setEditingImageUrl(url);
                      setIsFocalPointDialogOpen(true);
                    }}
                  >
                    Adjust Position
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeImage(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Upload Button */}
            <div className="border-2 border-dashed rounded-md aspect-[4/3] flex flex-col gap-2 p-4">
              <div className="flex-1 flex flex-col items-center justify-center">
                <Input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  className="hidden"
                  id="image-upload"
                  multiple
                  disabled={isUploading}
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      await handleMultipleImageUpload(files);
                      e.target.value = '';
                    }
                  }}
                />
                <Label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center ${isUploading ? 'opacity-50' : ''}`}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-1">
                    {isUploading ? 'Uploading...' : 'Upload Images'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formData.imageUrls.length < 2 
                      ? `${2 - formData.imageUrls.length} more required` 
                      : `${8 - formData.imageUrls.length} slots remaining`}
                  </span>
                </Label>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Upload 2-8 images (PNG, JPG, WEBP) and optionally one video. After uploading, click &quot;Adjust Position&quot; on each image to set how it appears in the 4:3 product card.
          </p>
        </div>

        {/* Features Section */}
        <div className="space-y-4 relative z-[70]">
          <Label className="text-sm font-medium">Features</Label>
          <div className="space-y-4">
            {featureItems.map((item, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor={`feature-question-${index}`} className="text-xs font-medium">Feature</Label>
                  <Input
                    id={`feature-question-${index}`}
                    placeholder="Feature"
                    value={item.question}
                    onChange={(e) => updateFeatureItem(index, 'question', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feature-answer-${index}`} className="text-xs font-medium">Description</Label>
                  <Textarea
                    id={`feature-answer-${index}`}
                    placeholder="Description"
                    value={item.answer}
                    onChange={(e) => updateFeatureItem(index, 'answer', e.target.value)}
                    className="min-h-[80px] resize-y"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFeatureItem(index)}
                  className="mt-2"
                >
                  Remove Feature
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFeatureItem} className="w-full">
              Add Feature
            </Button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button 
        type="submit" 
        className="w-full md:w-auto" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Changes...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>

      {/* Focal Point Selector Dialog */}
      {editingImageUrl && (
        <FocalPointSelector
          imageUrl={editingImageUrl}
          initialPosition={formData.imagePositions?.[editingImageUrl] || { x: 50, y: 50 }}
          onPositionChange={(position) => updateImagePosition(editingImageUrl, position)}
          open={isFocalPointDialogOpen}
          onOpenChange={setIsFocalPointDialogOpen}
        />
      )}
    </form>
  );
}