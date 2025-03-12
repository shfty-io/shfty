"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { migrateRichTextFormatting } from '@/lib/utils';
import { Github, Upload, X, Wand2, Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { UrlInput } from "@/components/ui/url-input";
import { TagsSelector } from "./TagsSelector";
import { LicenseSelector } from "./LicenseSelector";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Redefine the props interface locally
interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<{ success?: boolean; error?: string }>;
  initialData?: ProductFormData | null;
}

// Define FAQItem locally
interface FAQItem {
  question: string;
  answer: string;
}

// Add this interface near other type definitions
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

// Add constants from ProductForm
const MAX_NAME_LENGTH = 25;
const MAX_SHORT_DESCRIPTION_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 5000;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Update the categories array with all options
const categories = [
  { id: "photo_video", label: "Photo & Video" },
  { id: "productivity", label: "Productivity" },
  { id: "utilities", label: "Utilities" },
  { id: "entertainment", label: "Entertainment" },
  { id: "developer_tools", label: "Developer Tools" },
  { id: "business", label: "Business" },
  { id: "creativity", label: "Creativity" },
  { id: "security", label: "Security" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "education", label: "Education" },
  { id: "communication_social", label: "Communication & Social" },
  { id: "ai", label: "AI" },
  { id: "finance", label: "Finance" },
  { id: "other", label: "Other" }
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

// Update the ProductFormData definition to extend Omit<OriginalType, 'byline'>
export type ProductFormData = {
  id?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  categories: string[];
  technologies: string[];
  faq?: FAQItem[];
  githubRepoUrl?: string | null;
  github_token?: string | null;
  softwareLicense?: string | null;
  imageUrls: string[];
  videoUrl?: string | null;
  demoUrl?: string | null;
};

export function ProductEditForm({ onSubmit, initialData }: ProductFormProps) {
  // Add state hooks from ProductForm
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancingShortDesc, setIsEnhancingShortDesc] = useState(false);
  const [isEnhancingFullDesc, setIsEnhancingFullDesc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log initialData for debugging
  useEffect(() => {
    console.log("Initial data:", initialData);
    console.log("Demo URL from initial data:", initialData?.demoUrl);
  }, [initialData]);

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

  // Update initial formData state
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ? migrateRichTextFormatting(initialData.description) : "",
    price: initialData?.price ?? 0,
    categories: initialData?.categories ?? [],
    technologies: initialData?.technologies ?? [],
    faq: initialData?.faq || [],
    githubRepoUrl: initialData?.githubRepoUrl || null,
    github_token: initialData?.github_token || null,
    softwareLicense: initialData?.softwareLicense || null,
    imageUrls: initialData?.imageUrls ?? [],
    videoUrl: initialData?.videoUrl || null,
    demoUrl: initialData?.demoUrl || null
  });

  // Log formData for debugging
  useEffect(() => {
    console.log("Form data:", formData);
    console.log("Demo URL in form data:", formData.demoUrl);
  }, [formData]);

  // Initialize faqItems from initialData
  const [faqItems, setFaqItems] = useState<FAQItem[]>(() => {
    if (!initialData?.faq) return [];
    try {
      return typeof initialData.faq === 'string' 
        ? JSON.parse(initialData.faq) 
        : Array.isArray(initialData.faq) 
          ? initialData.faq 
          : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && initialData?.description) {
      setFormData(prev => ({
        ...prev,
        description: migrateRichTextFormatting(initialData.description)
      }));
    }
  }, [initialData?.description]);

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqItems = [...faqItems];
    newFaqItems[index][field] = value;
    setFaqItems(newFaqItems);
  };

  // Add handlers from ProductForm (image upload, video upload, GitHub repos, etc)
  const handleMultipleImageUpload = async (files: FileList) => {
    // Implementation would go here
    console.log("Would upload files:", files);
    setIsUploading(true);
    // Mock implementation
    setTimeout(() => {
      setIsUploading(false);
    }, 1000);
  };

  const fetchGitHubRepos = async () => {
    try {
      setIsLoadingRepos(true);
      const response = await fetch('/api/github/repos');
      const data = await response.json();
      
      if (response.ok) {
        setGithubRepos(data.repositories);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch GitHub repositories",
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setIsLoadingRepos(false);
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
    } catch (error) {
      console.error('Error enhancing description:', error);
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
    } catch (error) {
      console.error('Error enhancing description:', error);
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

    const finalFormData = {
      ...formData,
      faq: faqItems
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
    } catch (error) {
      console.error("Error saving product:", error);
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

  useEffect(() => {
    if (formData.githubRepoUrl) {
      fetchGitHubRepos();
    }
  }, [formData.githubRepoUrl]);

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
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  required
                  className="h-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Set to 0 for free products
              </p>
            </div>
          </div>
        </div>

        {/* Categories and Technologies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 relative z-[70]">
            <TagsSelector 
              tags={categories}
              selectedTags={selectedCategories}
              setSelectedTags={setSelectedCategories}
              title="Categories"
              maxTags={3}
            />
          </div>
          <div className="space-y-2 relative z-[70]">
            <TagsSelector 
              tags={technologies}
              selectedTags={selectedTechnologies}
              setSelectedTags={setSelectedTechnologies}
              title="Technologies Used"
            />
          </div>
        </div>

        {/* License selector */}
        <div className="space-y-2 relative z-[70]">
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
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Specify the license under which your software is distributed
          </p>
        </div>

        {/* Demo URL and GitHub Repository */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* GitHub Repository Section */}
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
                  <div className="flex h-10 w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                    <Github className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">
                      {formData.githubRepoUrl ? 
                        formData.githubRepoUrl.split('/').slice(-2).join('/') : // Show repo owner/name
                        "Select Repository"}
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
                    {isLoadingRepos ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : githubRepos.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No repositories found. Make sure you connected your GitHub account.
                      </div>
                    ) : (
                      githubRepos.map((repo) => (
                        <button
                          key={repo.id}
                          type="button"
                          className={`w-full p-4 border rounded-md cursor-pointer hover:border-primary transition-colors text-left ${
                            formData.githubRepoUrl === repo.html_url ? 'border-primary bg-muted' : ''
                          }`}
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            githubRepoUrl: repo.html_url,
                            price: repo.private ? prev.price : 0
                          }))}
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
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Link your GitHub repository to your product
            </p>
          </div>
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
              placeholder="Used in search results and as an intro at the top of your template&#39;s page."
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
            <span>{(() => {
              // Calculate plain text length for the rich text
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = formData.description;
              return `${tempDiv.textContent?.length || 0}/${MAX_DESCRIPTION_LENGTH}`;
            })()}</span>
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
              <div key={url} className="relative aspect-square">
                <Image src={url} alt={`Product image ${index + 1}`} fill className="object-cover rounded-md" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeImage(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Upload Button */}
            <div className="border-2 border-dashed rounded-md aspect-square flex flex-col gap-2 p-4">
              <div className="flex-1 flex flex-col items-center justify-center">
                <Input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  className="hidden"
                  id="image-upload"
                  multiple
                  disabled={isUploading}
                  onChange={(e) => e.target.files && handleMultipleImageUpload(e.target.files)}
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
            Upload 2-8 images (PNG, JPG, WEBP) and optionally one video
          </p>
        </div>

        {/* FAQ/Features Section */}
        <div className="space-y-4 relative z-[70]">
          <Label className="text-sm font-medium">Features</Label>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor={`faq-question-${index}`} className="text-xs font-medium">Feature</Label>
                  <Input
                    id={`faq-question-${index}`}
                    placeholder="Feature"
                    value={item.question}
                    onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`faq-answer-${index}`} className="text-xs font-medium">Description</Label>
                  <Textarea
                    id={`faq-answer-${index}`}
                    placeholder="Description"
                    value={item.answer}
                    onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                    className="min-h-[80px] resize-y"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFaqItem(index)}
                  className="mt-2"
                >
                  Remove Feature
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFaqItem} className="w-full">
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
    </form>
  );
}