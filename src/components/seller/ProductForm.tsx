"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createClient } from "@/lib/client";
import { Github, Upload, X, Check } from "lucide-react";
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
import { useDebounce } from "@/hooks/use-debounce";
import { TagsSelector } from "./TagsSelector";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
}

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

const technologies = [
  // Frontend
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" },
  { id: "svelte", label: "Svelte" },
  { id: "next.js", label: "Next.js" },
  { id: "nuxt", label: "Nuxt" },
  { id: "tailwind", label: "Tailwind" },
  // Backend
  { id: "node.js", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  // Databases
  { id: "postgresql", label: "PostgreSQL" },
  { id: "mysql", label: "MySQL" },
  { id: "mongodb", label: "MongoDB" },
  { id: "supabase", label: "Supabase" },
  { id: "firebase", label: "Firebase" },
  // Cloud & Infrastructure
  { id: "aws", label: "AWS" },
  { id: "google-cloud", label: "Google Cloud" },
  { id: "azure", label: "Azure" },
  { id: "vercel", label: "Vercel" },
  { id: "docker", label: "Docker" },
  { id: "kubernetes", label: "Kubernetes" },
  // Authentication
  { id: "clerk", label: "Clerk" },
  { id: "auth0", label: "Auth0" },
  { id: "nextauth", label: "NextAuth" },
  // Other
  { id: "stripe", label: "Stripe" },
  { id: "ngrok", label: "Ngrok" },
  { id: "graphql", label: "GraphQL" },
  { id: "redis", label: "Redis" },
  { id: "websocket", label: "WebSocket" },
];

export type ProductFormData = {
  id?: string;
  name: string;
  byline: string;
  shortDescription: string;
  description: string;
  price: number;
  categories: string[];
  technologies: string[];
  faq?: FAQItem[];
  githubRepoUrl?: string | null;
  github_token?: string | null;
  imageUrls: string[];
  videoUrl?: string | null;
  demoUrl?: string | null;
  hasReadme?: boolean;
  hasDatabaseMigrations?: boolean;
};

interface FAQItem {
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

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    byline: initialData?.byline ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 0,
    categories: initialData?.categories ?? [],
    technologies: initialData?.technologies ?? [],
    faq: [],
    githubRepoUrl: initialData?.githubRepoUrl || null,
    github_token: initialData?.github_token || null,
    imageUrls: initialData?.imageUrls ?? [],
    videoUrl: initialData?.videoUrl || null,
    demoUrl: initialData?.demoUrl || null,
    hasReadme: initialData?.hasReadme ?? false,
    hasDatabaseMigrations: initialData?.hasDatabaseMigrations ?? false,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const finalFormData = {
      ...formData,
      faq: faqItems
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
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              scopes: 'repo',
              redirectTo: `${window.location.origin}/auth/callback`
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
        const fileName = `images/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const supabase = createClient();

        const { data, error } = await supabase.storage
          .from('products')
          .upload(fileName, file, {
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
      const fileName = `${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('product-videos')
        .upload(fileName, file);

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

  const checkAvailability = async (byline: string) => {
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
  };

  // Effect to check availability when debounced byline changes
  useEffect(() => {
    if (debouncedByline) {
      checkAvailability(debouncedByline);
    } else {
      setIsAvailable(null);
      setMessage(null);
    }
  }, [debouncedByline]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Two column layout for name and byline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="h-6 flex items-center">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            </div>
            <div className="relative">
              <Input
                id="name"
                placeholder="My Product"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10"
                maxLength={25}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The display name of your product (max 25 characters)
            </p>
          </div>

          <div className="space-y-2">
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
                maxLength={25}
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
              <p className="text-xs text-muted-foreground mt-1">
                Used in the URL and imports, can&apos;t be changed later (max 25 characters)
              </p>
              {message && (
                <p className={`text-xs ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
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
                  ? "You can set a price for private repositories" 
                  : "Public repositories must be free"
                : "Set your desired price "}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <TagsSelector 
              tags={categories}
              selectedTags={selectedCategories}
              setSelectedTags={setSelectedCategories}
              title="Categories"
              maxTags={3}
            />
          </div>

          <div className="space-y-2">
            <TagsSelector 
              tags={technologies}
              selectedTags={selectedTechnologies}
              setSelectedTags={setSelectedTechnologies}
              title="Technologies Used"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
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

          <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="shortDescription" className="text-sm font-medium">Short Description</Label>
          <div className="relative">
            <Textarea
              id="shortDescription"
              placeholder="Used in search results and as an intro at the top of your template's page."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              required
              className="min-h-[80px] resize-y"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Brief description of your product
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Full Description</Label>
          <div className="relative w-full">
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) => setFormData({ ...formData, description: value })}
              placeholder="Provide as much detail as possible to significantly increase sales."
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Detailed information about your product
          </p>
        </div>

        <div className="space-y-2">
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

            {/* Image Previews */}
            {formData.imageUrls.map((url, index) => (
              <div key={url} className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => {
                    if (formData.imageUrls.length <= 2) {
                      toast({
                        title: "Cannot Remove",
                        description: "You must have at least 2 images",
                        variant: "destructive"
                      });
                      return;
                    }
                    removeImage(url);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Upload Buttons */}
            <div className="border-2 border-dashed rounded-md aspect-square flex flex-col gap-2 p-4">
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
          <p className="text-xs text-muted-foreground mt-2">
            Upload 2-8 images (PNG, JPG, WEBP) and optionally one video
          </p>
        </div>

        <div className="space-y-4">
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

      <Button type="submit" className="w-full md:w-auto">Save Changes</Button>
    </form>
  );
} 