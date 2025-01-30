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

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
}

const categories = [
  "photo_video",
  "productivity",
  "utilities",
  "entertainment",
  "developer_tools",
  "business",
  "creativity",
  "security",
  "lifestyle",
  "education",
  "communication_social",
  "games",
  "finance",
  "other"
];

const technologies = [
  // Frontend
  "react",
  "vue",
  "angular",
  "svelte",
  "next.js",
  "nuxt",
  "tailwind",
  // Backend
  "node.js",
  "python",
  "java",
  "php",
  "ruby",
  "go",
  "rust",
  // Databases
  "postgresql",
  "mysql",
  "mongodb",
  "supabase",
  "firebase",
  // Cloud & Infrastructure
  "aws",
  "google-cloud",
  "azure",
  "vercel",
  "docker",
  "kubernetes",
  // Authentication
  "clerk",
  "auth0",
  "nextauth",
  // Other
  "stripe",
  "ngrok",
  "graphql",
  "redis",
  "websocket",
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
  codebaseSource?: 'zip' | 'github';
  githubRepoUrl?: string | null;
  github_token?: string | null;
  imageUrls: string[];
  videoUrl?: string | null;
  demoUrl?: string | null;
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

const getCategoryDisplayName = (category: string) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    byline: initialData?.byline ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 10,
    categories: initialData?.categories ?? [],
    technologies: initialData?.technologies ?? [],
    faq: [],
    codebaseSource: initialData?.codebaseSource || 'github',
    githubRepoUrl: initialData?.githubRepoUrl || null,
    github_token: initialData?.github_token || null,
    imageUrls: initialData?.imageUrls ?? [],
    videoUrl: initialData?.videoUrl || null,
    demoUrl: initialData?.demoUrl || null,
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
      
      if (!response.ok) throw new Error(data.error);
      
      setGithubRepos(data.repositories);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast({
        title: "Error",
        description: "Could not fetch your GitHub repositories",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (formData.codebaseSource === 'github') {
      fetchGitHubRepos();
    }
  }, [formData.codebaseSource]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        {/* Two column layout for name and byline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              Product Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="name"
              placeholder='e.g. "Modern Dashboard Template"'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <p className="text-sm text-muted-foreground">
              The display name of your product
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="byline" className="flex items-center">
              Slug
              <span className="text-destructive ml-1">*</span>
            </Label>
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
                className={formData.byline ? (isAvailable === false ? "border-red-500" : isAvailable === true ? "border-green-500" : "") : ""}
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
            <p className="text-sm text-muted-foreground">
              Used in the URL and imports, can&apos;t be changed later
            </p>
            {message && (
              <p className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Three column layout for price, category, and demo URL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label>
              Categories
              <span className="text-sm text-muted-foreground ml-2">
                (Select up to 3)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    if (formData.categories.includes(category)) {
                      setFormData({
                        ...formData,
                        categories: formData.categories.filter(c => c !== category)
                      });
                    } else if (formData.categories.length < 3) {
                      setFormData({
                        ...formData,
                        categories: [...formData.categories, category]
                      });
                    } else {
                      toast({
                        title: "Maximum categories reached",
                        description: "You can only select up to 3 categories",
                        variant: "destructive"
                      });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.categories.includes(category)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {getCategoryDisplayName(category)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>
              Technologies Used
              <span className="text-sm text-muted-foreground ml-2">
                (Select all that apply)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {technologies.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => {
                    if (formData.technologies.includes(tech)) {
                      setFormData({
                        ...formData,
                        technologies: formData.technologies.filter(t => t !== tech)
                      });
                    } else {
                      setFormData({
                        ...formData,
                        technologies: [...formData.technologies, tech]
                      });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.technologies.includes(tech)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Product Demo URL (Optional)</Label>
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
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label className="flex items-center">
                Codebase Source
                <span className="text-destructive ml-1">*</span>
                <span className="text-sm text-muted-foreground ml-2">
                  (At least one required)
                </span>
              </Label>
              <div className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Label className="text-sm font-medium">GitHub Repository</Label>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Recommended</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="ghost"
                        className="relative flex h-9 w-full items-center justify-start gap-2 rounded-lg border border-input bg-background px-3 text-sm ring-offset-background shadow-sm shadow-black/5 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, codebaseSource: 'github' }));
                          fetchGitHubRepos();
                        }}
                        disabled={isLoadingRepos}
                      >
                        <Github className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">
                          {isLoadingRepos 
                            ? "Loading repositories..." 
                            : formData.githubRepoUrl 
                              ? "Repository selected"
                              : "Select Repository"}
                        </span>
                      </Button>
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
                            className={`w-full p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors text-left ${
                              formData.githubRepoUrl === repo.html_url ? 'border-primary bg-muted' : ''
                            }`}
                            onClick={() => {
                              setFormData(prev => ({ 
                                ...prev, 
                                githubRepoUrl: repo.html_url 
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
                    <div className="p-3 border rounded-lg bg-muted">
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
            placeholder="Used in search results and as an intro at the top of your template's page."
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Full Description</Label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Provide as much detail as possible to significantly increase sales."
          />
        </div>

        <div>
          <Label>
            Product Media
            <span className="text-destructive ml-1">*</span>
            <span className="text-sm text-muted-foreground ml-2">
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
                  className="w-full h-full rounded-lg object-cover"
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
                  className="object-cover rounded-lg"
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
            <div className="border-2 border-dashed rounded-lg aspect-square flex flex-col gap-2 p-4">
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
          <p className="text-sm text-muted-foreground mt-2">
            Upload 2-8 images (PNG, JPG, WEBP) and optionally one video
          </p>
        </div>

        <div>
          <Label>FAQ</Label>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <Input
                  placeholder="Question"
                  value={item.question}
                  onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                />
                <Textarea
                  placeholder="Answer"
                  value={item.answer}
                  onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeFaqItem(index)}
                >
                  Remove FAQ Item
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addFaqItem}>
              Add FAQ Item
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit">Save Changes</Button>
    </form>
  );
} 