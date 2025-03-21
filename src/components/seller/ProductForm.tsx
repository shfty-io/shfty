"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/client";
import { Github, Upload, X, Check, Wand2, Loader2, GripVertical } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { UrlInput } from "@/components/ui/url-input";
import { useDebounce } from "@/hooks/use-debounce";
import { TagsSelector } from "./TagsSelector";
import { LicenseSelector } from "./LicenseSelector";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { migrateRichTextFormatting } from "@/lib/utils";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
}

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
  { id: "dart", label: "Dart" },
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
  { id: "symfony", label: "Symfony" },
  // Databases
  { id: "postgresql", label: "PostgreSQL" },
  { id: "mysql", label: "MySQL" },
  { id: "mongodb", label: "MongoDB" },
  { id: "supabase", label: "Supabase" },
  { id: "firebase", label: "Firebase" },
  { id: "prisma", label: "Prisma" },
  { id: "drizzle", label: "Drizzle" },
  { id: "redis", label: "Redis" },
  { id: "mariadb", label: "MariaDB" },
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
  { id: "elixir", label: "Elixir" },
  { id: "phoenix", label: "Phoenix" },
  { id: "meteor", label: "Meteor" },
  { id: "rails", label: "Ruby on Rails" },
];

const MAX_NAME_LENGTH = 25;
const MAX_BYLINE_LENGTH = 25;
const MAX_SHORT_DESCRIPTION_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 5000;

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
  
  // Handle mouse/touch move
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
  
  // Handle mouse/touch up
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

// Add new interface for image positions
// interface ImagePosition {
//   url: string;
//   position: { x: number; y: number };
// }

export type ProductFormData = {
  id?: string;
  name: string;
  byline: string;
  shortDescription: string;
  description: string;
  price: number;
  categories: string[];
  technologies: string[];
  features: FeatureItem[];
  githubRepoUrl?: string | null;
  github_token?: string | null;
  softwareLicense?: string | null;
  imageUrls: string[];
  imagePositions?: Record<string, { x: number; y: number }>;
  videoUrl?: string | null;
  demoUrl?: string | null;
  hasReadme?: boolean;
  hasDatabaseMigrations?: boolean;
};

interface FeatureItem {
  question: string;
  answer: string;
}

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Add SortableImageItem component for drag-and-drop functionality
interface SortableImageItemProps {
  url: string;
  index: number;
  imagePositions?: Record<string, { x: number; y: number }>;
  onRemove: (url: string) => void;
  onPositionEdit: (url: string) => void;
}

function SortableImageItem({ 
  url, 
  index, 
  imagePositions, 
  onRemove, 
  onPositionEdit 
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative aspect-[4/3] group"
    >
      <div className="relative w-full h-full overflow-hidden rounded-md">
        <Image 
          src={url} 
          alt={`Product image ${index + 1}`} 
          fill 
          className="object-cover rounded-md" 
          style={{
            objectPosition: imagePositions?.[url] 
              ? `${imagePositions[url].x}% ${imagePositions[url].y}%` 
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
          onClick={() => onPositionEdit(url)}
        >
          Adjust Position
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={() => onRemove(url)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div 
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-white drop-shadow-md" />
      </div>
      {index === 0 && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-md">
          Primary
        </div>
      )}
    </div>
  );
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    byline: initialData?.byline ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ? migrateRichTextFormatting(initialData.description) : "",
    price: initialData?.price ?? 0,
    categories: initialData?.categories ?? [],
    technologies: initialData?.technologies ?? [],
    features: [],
    githubRepoUrl: initialData?.githubRepoUrl || null,
    github_token: initialData?.github_token || null,
    softwareLicense: initialData?.softwareLicense || null,
    imageUrls: initialData?.imageUrls ?? [],
    imagePositions: initialData?.imagePositions || {},
    videoUrl: initialData?.videoUrl || null,
    demoUrl: initialData?.demoUrl || null,
    hasReadme: initialData?.hasReadme ?? false,
    hasDatabaseMigrations: initialData?.hasDatabaseMigrations ?? false,
  });

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

  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Use the custom debounce hook for byline
  const debouncedByline = useDebounce(formData.byline, 500);

  const [selectedCategories, setSelectedCategories] = useState<typeof categories[0][]>(
    initialData?.categories 
      ? categories.filter(cat => initialData.categories.includes(cat.id)) 
      : []
  );
  
  const [selectedTechnologies, setSelectedTechnologies] = useState<typeof technologies[0][]>(
    initialData?.technologies 
      ? technologies.filter(tech => initialData.technologies.includes(tech.id)) 
      : []
  );

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isTechnologiesOpen, setIsTechnologiesOpen] = useState(false);

  // Add new state variables for AI enhancement
  const [isEnhancingShortDesc, setIsEnhancingShortDesc] = useState(false);
  const [isEnhancingFullDesc, setIsEnhancingFullDesc] = useState(false);

  // License options
  const licenses = [
    { id: 'MIT', label: 'MIT License (Recommended)' },
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
  
  const [selectedLicense, setSelectedLicense] = useState<{ id: string; label: string } | null>(
    formData.softwareLicense ? { id: formData.softwareLicense, label: licenses.find(l => l.id === formData.softwareLicense)?.label || formData.softwareLicense } : null
  );
  
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  
  const handleLicenseOpenChange = (isOpen: boolean) => {
    setIsLicenseOpen(isOpen);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim() === '') {
      toast({ title: "Validation Error", description: "Please provide a product name", variant: "destructive" });
      return;
    }

    if (formData.name.length > MAX_NAME_LENGTH) {
      toast({ title: "Validation Error", description: `Product name must be ${MAX_NAME_LENGTH} characters or less`, variant: "destructive" });
      return;
    }

    if (!formData.byline || formData.byline.trim() === '') {
      toast({ title: "Validation Error", description: "Please provide a byline", variant: "destructive" });
      return;
    }

    if (formData.byline.length > MAX_BYLINE_LENGTH) {
      toast({ title: "Validation Error", description: `Byline must be ${MAX_BYLINE_LENGTH} characters or less`, variant: "destructive" });
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

    // Check minimum price for paid products
    if (formData.price > 0 && formData.price < 4.99) {
      toast({
        title: "Validation Error",
        description: "Minimum price for paid products is $4.99",
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

    if (!formData.githubRepoUrl) {
      toast({
        title: "Validation Error",
        description: "Please provide a GitHub repository",
        variant: "destructive"
      });
      return;
    }

    if (!formData.hasReadme || !formData.hasDatabaseMigrations) {
      toast({
        title: "Validation Error",
        description: "Please confirm that your repository includes a README and database migration files",
        variant: "destructive"
      });
      return;
    }

    const finalFormData: ProductFormData = {
      ...formData,
      features: featureItems
    };

    onSubmit(finalFormData);
  };

  const fetchGitHubRepos = async () => {
    try {
      setIsLoadingRepos(true);
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
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not fetch your GitHub repositories",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (formData.githubRepoUrl) {
      fetchGitHubRepos();
    }
  }, [formData.githubRepoUrl]);

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
        console.error(`Error uploading ${file.name}:`, error);
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
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create a unique filename
      const uniqueFileName = `${Date.now()}-${file.name}`;
      
      // Create a path with user_id and product_id (if available)
      let filePath = `videos/${user.id}`;
      
      // If we have initialData with an id, use it for the subfolder
      if (initialData?.id) {
        filePath += `/${initialData.id}`;
      } else {
        // For new products, create a temporary folder with timestamp
        filePath += `/temp-${Date.now()}`;
      }
      
      filePath += `/${uniqueFileName}`;
      
      const { data, error } = await supabase.storage
        .from('product-videos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-videos')
        .getPublicUrl(data.path);

      setFormData(prev => ({
        ...prev,
        videoUrl: publicUrl
      }));
      
      toast({
        title: "Upload successful",
        description: "Your video has been uploaded",
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload video",
        variant: "destructive"
      });
    }
  };

  const removeImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
    }));
  };

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      videoUrl: null
    }));
  };

  const checkAvailability = useCallback(async (byline: string) => {
    try {
      setIsChecking(true);
      const response = await fetch(
        `/api/products/check-byline?byline=${encodeURIComponent(byline)}${initialData?.id ? `&currentProductId=${initialData.id}` : ''}`
      );
      const data = await response.json();
      
      setIsAvailable(data.available);
      setMessage(data.message);
      return data.available;
    } catch (error) {
      console.error('Error checking byline availability:', error);
      setMessage('Error checking byline availability');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [initialData?.id]);

  // Effect to check availability when debounced byline changes
  useEffect(() => {
    if (debouncedByline) {
      checkAvailability(debouncedByline);
    } else {
      setIsAvailable(null);
      setMessage(null);
    }
  }, [debouncedByline, checkAvailability]);

  // Update formData when selectedCategories or selectedTechnologies change
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

  // Add these handlers for the TagsSelector components
  const handleCategoriesOpenChange = (isOpen: boolean) => {
    setIsCategoriesOpen(isOpen);
  };

  const handleTechnologiesOpenChange = (isOpen: boolean) => {
    setIsTechnologiesOpen(isOpen);
  };

  // Update the enhanceShortDescription function to use streaming
  const enhanceShortDescription = async () => {
    if (!formData.shortDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to enhance",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsEnhancingShortDesc(true);
      
      // Prepare a copy of the original text in case we need to revert
      const originalText = formData.shortDescription;
      let enhancedText = '';
      
      // Use the streaming API endpoint
      const response = await fetch('/api/ai/enhance-text/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.shortDescription,
          type: 'short',
          maxLength: MAX_SHORT_DESCRIPTION_LENGTH
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to enhance text');
      }
      
      // Set up event source for streaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }
      
      // Create a toast that we can update
      const { dismiss } = toast({
        title: "Enhancing description...",
        description: "AI is working on your text",
        duration: 10000, // Long duration since we'll dismiss it manually
      });
      
      // Process the streaming response
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('event: chunk')) {
              const dataLine = line.split('\n')[1];
              if (dataLine && dataLine.startsWith('data: ')) {
                try {
                  const data = JSON.parse(dataLine.slice(6));
                  if (data.text) {
                    enhancedText += data.text;
                    // Update the form data in real-time as we receive chunks
                    setFormData(prev => ({
                      ...prev,
                      shortDescription: enhancedText.substring(0, MAX_SHORT_DESCRIPTION_LENGTH)
                    }));
                  }
                } catch (e) {
                  console.error('Error parsing chunk data:', e);
                }
              }
            } else if (line.startsWith('event: error')) {
              const dataLine = line.split('\n')[1];
              if (dataLine && dataLine.startsWith('data: ')) {
                try {
                  const data = JSON.parse(dataLine.slice(6));
                  throw new Error(data.error || 'Unknown error from AI service');
                } catch (e) {
                  throw e;
                }
              }
            }
          }
        }
        
        // Success notification
        dismiss();
        toast({
          title: "Success",
          description: "Description enhanced with AI",
        });
        
      } catch (streamError) {
        console.error('Stream processing error:', streamError);
        // Revert to original text on error
        setFormData(prev => ({
          ...prev,
          shortDescription: originalText
        }));
        throw streamError;
      } finally {
        reader.releaseLock();
      }
      
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enhance text",
        variant: "destructive"
      });
    } finally {
      setIsEnhancingShortDesc(false);
    }
  };
  
  // Update enhanceFullDescription to use streaming like enhanceShortDescription
  const enhanceFullDescription = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to enhance",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsEnhancingFullDesc(true);
      
      // Extract plain text from HTML for the AI to process
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.description;
      const plainText = tempDiv.textContent || '';
      
      // Prepare a copy of the original HTML in case we need to revert
      const originalHtml = formData.description;
      let enhancedText = '';
      
      // Use the streaming API endpoint
      const response = await fetch('/api/ai/enhance-text/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: plainText,
          type: 'full',
          maxLength: MAX_DESCRIPTION_LENGTH
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Set up event source for streaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }
      
      // Create a toast that we can update
      const { dismiss } = toast({
        title: "Enhancing description...",
        description: "AI is working on your text",
        duration: 30000, // Longer duration for full description
      });
      
      // Process the streaming response
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('event: chunk')) {
              const dataLine = line.split('\n')[1];
              if (dataLine && dataLine.startsWith('data: ')) {
                try {
                  const data = JSON.parse(dataLine.slice(6));
                  if (data.text) {
                    enhancedText += data.text;
                    
                    // Format the enhanced text with proper HTML structure
                    // Split by double newlines to identify paragraphs
                    const paragraphs = enhancedText.split('\n\n');
                    let formattedHtml = '';
                    
                    // Process each paragraph to identify headings and format accordingly
                    paragraphs.forEach((paragraph: string) => {
                      if (!paragraph.trim()) return;
                      
                      // Check for heading patterns
                      if (paragraph.startsWith('# ')) {
                        formattedHtml += `<h1 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1rem;">${convertMarkdownToHtml(paragraph.substring(2))}</h1>`;
                      } else if (paragraph.startsWith('## ')) {
                        formattedHtml += `<h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem;">${convertMarkdownToHtml(paragraph.substring(3))}</h2>`;
                      } else if (paragraph.startsWith('### ')) {
                        formattedHtml += `<h3 style="font-size: 1.25rem; font-weight: semibold; margin-bottom: 0.5rem;">${convertMarkdownToHtml(paragraph.substring(4))}</h3>`;
                      } else if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                        // Convert bullet points to HTML list
                        const listItems = paragraph.split('\n').map(line => {
                          // Remove the bullet point marker and trim
                          const itemText = line.replace(/^[*-]\s+/, '').trim();
                          if (itemText) {
                            return `<li>${convertMarkdownToHtml(itemText)}</li>`;
                          }
                          return '';
                        }).filter(Boolean).join('');
                        
                        formattedHtml += `<ul style="list-style-type: disc; padding-left: 2rem; margin-bottom: 1rem;">${listItems}</ul>`;
                      } else {
                        // Regular paragraph with line breaks preserved
                        formattedHtml += `<p style="margin-bottom: 1rem;">${convertMarkdownToHtml(paragraph.replace(/\n/g, '<br>'))}</p>`;
                      }
                    });
                    
                    // If no formatted HTML was created, wrap the entire text in a paragraph
                    if (!formattedHtml && enhancedText.trim()) {
                      formattedHtml = `<p style="margin-bottom: 1rem;">${convertMarkdownToHtml(enhancedText.replace(/\n/g, '<br>'))}</p>`;
                    }
                    
                    // Update the form data in real-time as we receive chunks
                    setFormData(prev => ({
                      ...prev,
                      description: formattedHtml
                    }));
                  }
                } catch (e) {
                  console.error('Error parsing chunk data:', e);
                }
              }
            } else if (line.startsWith('event: error')) {
              const dataLine = line.split('\n')[1];
              if (dataLine && dataLine.startsWith('data: ')) {
                try {
                  const data = JSON.parse(dataLine.slice(6));
                  throw new Error(data.error || 'Unknown error from AI service');
                } catch (e) {
                  throw e;
                }
              } else if (line.startsWith('event: complete')) {
                // Processing is complete
              }
            }
          }
        }
        
        // Success notification
        dismiss();
        toast({
          title: "Success",
          description: "Description enhanced with AI",
        });
        
      } catch (streamError) {
        console.error('Stream processing error:', streamError);
        // Revert to original HTML on error
        setFormData(prev => ({
          ...prev,
          description: originalHtml
        }));
        throw streamError;
      } finally {
        reader.releaseLock();
      }
      
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enhance text",
        variant: "destructive"
      });
    } finally {
      setIsEnhancingFullDesc(false);
    }
  };

  // Add this helper function to convert markdown to HTML
  const convertMarkdownToHtml = (text: string): string => {
    // Convert bold: **text** or __text__ to <strong class="rich-text-strong">text</strong>
    let html = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (_, g1, g2) => `<strong class="rich-text-strong">${g1 || g2}</strong>`);
    
    // Convert italic: *text* or _text_ to <em class="rich-text-em">text</em>
    html = html.replace(/\*(.*?)\*|_(.*?)_/g, (_, g1, g2) => {
      // Skip if this is part of a bold pattern that was already processed
      if ((g1 && !g1.includes('*')) || (g2 && !g2.includes('_'))) {
        return `<em class="rich-text-em">${g1 || g2}</em>`;
      }
      return _;
    });
    
    // Convert inline code: `code` to <code class="rich-text-code">code</code>
    html = html.replace(/`(.*?)`/g, (_, g1) => `<code class="rich-text-code">${g1}</code>`);
    
    // Convert links: [text](url) to <a href="url" class="rich-text-a">text</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => `<a href="${url}" class="rich-text-a">${text}</a>`);
    
    // Wrap in paragraph tags if not already wrapped
    if (!html.startsWith('<p') && !html.startsWith('<h')) {
      html = `<p class="rich-text-p">${html}</p>`;
    }
    
    return html;
  };

  // Add state for currently editing image focal point
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [isFocalPointDialogOpen, setIsFocalPointDialogOpen] = useState(false);

  // Add handler for updating image position
  const updateImagePosition = (url: string, position: { x: number; y: number }) => {
    setFormData(prev => ({
      ...prev,
      imagePositions: {
        ...prev.imagePositions,
        [url]: position
      }
    }));
  };

  // Add handler for drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.imageUrls.indexOf(active.id as string);
        const newIndex = prev.imageUrls.indexOf(over.id as string);
        
        return {
          ...prev,
          imageUrls: arrayMove(prev.imageUrls, oldIndex, newIndex),
        };
      });
    }
  };

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative z-[50]">
      <div className="space-y-6">
        {/* Two column layout for name and byline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                placeholder="My Product"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10"
                maxLength={MAX_NAME_LENGTH}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex justify-between">
              <span>The display name of your product</span>
              <span>{formData.name.length}/{MAX_NAME_LENGTH}</span>
            </p>
          </div>

          <div className="space-y-2 relative z-[70]">
            <div className="h-6 flex items-center">
              <Label htmlFor="byline" className="text-sm font-medium">
                Slug
                <span className="text-destructive ml-1">*</span>
              </Label>
            </div>
            <div className="relative">
              <Input
                id="byline"
                placeholder='e.g. "modern-dashboard"'
                value={formData.byline}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData({ ...formData, byline: newValue });
                }}
                required
                className={`h-10 ${formData.byline ? (isAvailable === false ? "border-red-500" : isAvailable === true ? "border-green-500" : "") : ""}`}
                maxLength={MAX_BYLINE_LENGTH}
              />
              {formData.byline && (
                <div className="absolute right-3 top-2.5">
                  {isChecking ? (
                    <span className="animate-pulse">...</span>
                  ) : isAvailable === true ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : isAvailable === false ? (
                    <X className="h-5 w-5 text-red-600" />
                  ) : null}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>Used in the URL and imports, can&apos;t be changed later</span>
                <span>{formData.byline.length}/{MAX_BYLINE_LENGTH}</span>
              </p>
              {message && (
                <p className={`text-xs ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 relative z-[70]">
            <div className="h-6 flex items-center">
              <Label htmlFor="price" className="text-sm font-medium">Price (USD)</Label>
            </div>
            <div className="relative">
              <Input
                id="price"
                type="number"
                min={formData.githubRepoUrl && !githubRepos.find(repo => repo.html_url === formData.githubRepoUrl)?.private ? 0 : 4.99}
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                className={`h-10 ${formData.price >= 0 ? "" : "border-red-500"}`}
                disabled={Boolean(formData.githubRepoUrl && !githubRepos.find(repo => repo.html_url === formData.githubRepoUrl)?.private)}
              />
              {formData.price < 0 && (
                <div className="absolute right-3 top-2.5">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.githubRepoUrl 
                ? githubRepos.find(repo => repo.html_url === formData.githubRepoUrl)?.private 
                  ? "Minimum price is $4.99 for paid products" 
                  : "Public repositories must be free"
                : "Minimum price is $4.99 for paid products"}
            </p>
          </div>
        </div>

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
          <p className="text-xs text-muted-foreground mt-1 flex justify-between">
            <span>Specify the license under which your software is distributed</span>
            <Link href="/help/licenses" target="_blank" className="text-primary hover:underline">Learn more about licenses</Link>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 relative z-[70]">
            <div className="h-6 flex items-center">
              <Label className="text-sm font-medium">Product Demo URL (Optional)</Label>
            </div>
            <div className="relative">
              <UrlInput
                placeholder="your-demo-url.com"
                value={(formData.demoUrl || '').replace('https://', '')}
                onChange={(e) => {
                  const url = e.target.value;
                  setFormData({ 
                    ...formData, 
                    demoUrl: url ? `https://${url}` : null 
                  });
                }}
                className="h-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Link to a live demo of your product
            </p>
          </div>

          <div className="space-y-2 relative z-[70]">
            <div className="h-6 flex items-center">
              <Label className="text-sm font-medium">
                GitHub Repository
                <span className="text-destructive ml-1">*</span>
              </Label>
            </div>
            <div className="relative">
              <Dialog>
                <DialogTrigger asChild>
                  <div 
                    className={`flex h-10 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer ${isLoadingRepos ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (!isLoadingRepos) {
                        fetchGitHubRepos();
                      }
                    }}
                  >
                    <Github className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">
                      {isLoadingRepos 
                        ? "Loading repositories..." 
                        : formData.githubRepoUrl 
                          ? "Repository selected"
                          : "Select Repository"}
                    </span>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select a Repository</DialogTitle>
                    <DialogDescription>
                      Choose a GitHub repository to link to your product
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {githubRepos.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        className={`w-full p-4 border rounded-md cursor-pointer hover:border-primary transition-colors text-left ${
                          formData.githubRepoUrl === repo.html_url ? 'border-primary bg-muted' : ''
                        }`}
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            githubRepoUrl: repo.html_url,
                            // Set price to 0 for public repos, otherwise keep the previously set price
                            price: repo.private ? prev.price : 0
                          }));
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{repo.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded ${
                                repo.private ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {repo.private ? 'Private' : 'Public'}
                              </span>
                              {repo.owner && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Owner: {repo.owner.login}
                                </span>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {repo.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Updated: {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                    {githubRepos.length === 0 && !isLoadingRepos && (
                      <p className="text-center text-muted-foreground">
                        No repositories found
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              {formData.githubRepoUrl && (
                <div className="space-y-4 mt-2">
                  <div className="p-3 border rounded-md bg-muted">
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      <span className="text-sm font-medium">Selected Repository:</span>
                    </div>
                    <a 
                      href={formData.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 block break-all"
                    >
                      {formData.githubRepoUrl}
                    </a>
                  </div>

                  <div className="space-y-2 p-3 border rounded-md">
                    <Label className="text-sm font-medium">Repository Requirements</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasReadme"
                          checked={formData.hasReadme}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasReadme: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="hasReadme" className="text-sm font-normal">
                          Repository includes a README with setup instructions
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasDatabaseMigrations"
                          checked={formData.hasDatabaseMigrations}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasDatabaseMigrations: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="hasDatabaseMigrations" className="text-sm font-normal">
                          Repository includes database migration files (if applicable)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Link your GitHub repository to your product
            </p>
          </div>
        </div>

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
              disabled={isEnhancingShortDesc || !formData.shortDescription.trim()}
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
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= MAX_SHORT_DESCRIPTION_LENGTH) {
                  setFormData({ ...formData, shortDescription: newValue });
                }
              }}
              required
              className="min-h-[80px] resize-y"
              maxLength={MAX_SHORT_DESCRIPTION_LENGTH}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex justify-between">
            <span>Brief description of your product</span>
            <span>{formData.shortDescription.length}/{MAX_SHORT_DESCRIPTION_LENGTH}</span>
          </p>
        </div>

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
              disabled={isEnhancingFullDesc || !formData.description.trim()}
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
              onChange={(value: string) => {
                // For rich text editor, we need to check the plain text length
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = value;
                const textLength = tempDiv.textContent?.length || 0;
                
                if (textLength <= MAX_DESCRIPTION_LENGTH) {
                  setFormData({ ...formData, description: value });
                }
              }}
              placeholder="Provide as much detail as possible to significantly increase sales."
              className="min-h-[300px]"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex justify-between">
            <span>Detailed information about your product</span>
            <span>{(() => {
              // Calculate plain text length for the rich text
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = formData.description;
              return `${tempDiv.textContent?.length || 0}/${MAX_DESCRIPTION_LENGTH}`;
            })()}</span>
          </p>
        </div>

        <div className="space-y-2 relative z-[70]">
          <Label className="text-sm font-medium flex items-center">
            Product Media
            <span className="text-destructive ml-1">*</span>
            <span className="text-xs text-muted-foreground ml-2">
              (Minimum 2 images required)
            </span>
          </Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Video Preview */}
            {formData.videoUrl && (
              <div className="relative col-span-2 row-span-2 aspect-video">
                <video
                  src={formData.videoUrl}
                  controls
                  className="w-full h-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={removeVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Image Previews with drag-and-drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.imageUrls}
                strategy={rectSortingStrategy}
              >
                {formData.imageUrls.map((url, index) => (
                  <SortableImageItem
                    key={url}
                    url={url}
                    index={index}
                    imagePositions={formData.imagePositions}
                    onRemove={removeImage}
                    onPositionEdit={(url) => {
                      setEditingImage(url);
                      setIsFocalPointDialogOpen(true);
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {/* Upload Buttons */}
            <div className="border-2 border-dashed rounded-md aspect-[4/3] flex flex-col gap-2 p-4">
              {/* Image Upload */}
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

              {/* Video Upload */}
              {!formData.videoUrl && (
                <>
                  <div className="w-full border-t border-border my-2" />
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <Input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      id="video-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleVideoUpload(file);
                        }
                      }}
                    />
                    <Label
                      htmlFor="video-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-1">
                        Upload Video
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Optional (MP4, max 100MB)
                      </span>
                    </Label>
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex flex-col">
            <span>Upload 2-8 images (PNG, JPG, WEBP). The first image (leftmost) will be displayed in product cards.</span>
            <span>Drag and drop to reorder images. After uploading, click &quot;Adjust Position&quot; to set how each image appears.</span>
          </p>
        </div>

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

      <Button type="submit" className="w-full md:w-auto">Save Changes</Button>

      {/* Focal Point Selector Dialog */}
      {editingImage && (
        <FocalPointSelector
          imageUrl={editingImage}
          initialPosition={formData.imagePositions?.[editingImage] || { x: 50, y: 50 }}
          onPositionChange={(position) => updateImagePosition(editingImage, position)}
          open={isFocalPointDialogOpen}
          onOpenChange={setIsFocalPointDialogOpen}
        />
      )}
    </form>
  );
} 