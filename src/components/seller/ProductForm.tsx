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
import { Github, Upload, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { UrlInput } from "@/components/ui/url-input";
import { Globe } from "lucide-react";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
}

export type ProductFormData = {
  name: string;
  byline: string;
  shortDescription: string;
  description: string;
  price: number;
  categories: string[];
  faq?: FAQItem[];
  codebaseSource?: 'zip' | 'github';
  codebase_url?: string | null;
  githubRepoUrl?: string | null;
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
  owner: string | null;
}

const categories = [
  "photo-video",
  "productivity",
  "utilities",
  "entertainment",
  "developer-tools",
  "business",
  "creativity",
  "security",
  "lifestyle",
  "education",
  "communication-social",
  "games",
  "finance",
  "other"
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const getCategoryDisplayName = (category: string) => {
  return category
    .split('-')
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
    faq: [],
    codebaseSource: initialData?.codebaseSource || 'zip',
    codebase_url: initialData?.codebase_url || null,
    githubRepoUrl: initialData?.githubRepoUrl || null,
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

    if (formData.codebaseSource === 'github' && !formData.githubRepoUrl) {
      toast({
        title: "Validation Error",
        description: "Please provide a GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    if (formData.codebaseSource === 'zip' && !formData.codebase_url) {
      toast({
        title: "Validation Error",
        description: "Please upload a ZIP file or switch to GitHub repository",
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

  const handleFileUpload = async (file: File) => {
    try {
      const supabase = createClient();
      const fileName = `${Date.now()}-${file.name}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('codebases')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('codebases')
        .getPublicUrl(data.path);

      setFormData(prev => ({
        ...prev,
        codebase_url: publicUrl  // Store the public URL instead of just the path
      }));
      
      toast({
        title: "Upload successful",
        description: "Your codebase file has been uploaded",
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload codebase file",
        variant: "destructive"
      });
    }
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
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
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
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, or WEBP image",
          variant: "destructive"
        });
        return;
      }

      // Create a more unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `images/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const supabase = createClient();

      // Upload file to Supabase storage with correct bucket and folder path
      const { data, error } = await supabase.storage
        .from('products') // Changed to just 'products'
        .upload(fileName, file, { // fileName includes 'images/' prefix
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(error.message || 'Failed to upload image');
      }

      if (!data?.path) {
        throw new Error('No path returned from upload');
      }

      // Get the public URL with correct bucket name
      const { data: { publicUrl } } = supabase.storage
        .from('products') // Changed to just 'products'
        .getPublicUrl(data.path);

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Verify the image is accessible
      const imgResponse = await fetch(publicUrl);
      if (!imgResponse.ok) {
        throw new Error('Uploaded image is not accessible');
      }

      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, publicUrl]
      }));
      
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded",
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload image. Please try again.",
        variant: "destructive"
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="byline">Byline</Label>
          <Input
            id="byline"
            value={formData.byline}
            onChange={(e) => setFormData({ ...formData, byline: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
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
          />
        </div>

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
          <Label>Categories</Label>
          <Select
            value={formData.categories[0] || ''}
            onValueChange={(value) => setFormData({ ...formData, categories: [value] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Codebase Source</Label>
            <Select 
              value={formData.codebaseSource}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                codebaseSource: value as 'zip' | 'github',
                codebase_url: value === 'zip' ? formData.codebase_url : null,
                githubRepoUrl: value === 'github' ? formData.githubRepoUrl : null
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zip">Upload ZIP File</SelectItem>
                <SelectItem value="github">GitHub Repository</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.codebaseSource === 'zip' && (
            <div>
              <Label>Upload Codebase (ZIP)</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />
              </div>
              {formData.codebase_url && (
                <p className="text-sm text-muted-foreground mt-2">
                  ✓ File uploaded successfully
                </p>
              )}
            </div>
          )}

          {formData.codebaseSource === 'github' && (
            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    disabled={isLoadingRepos}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    {isLoadingRepos 
                      ? "Loading repositories..." 
                      : formData.githubRepoUrl 
                        ? "Change repository" 
                        : "Select repository"
                    }
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select a Repository</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {githubRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                          formData.githubRepoUrl === repo.html_url ? 'border-primary bg-muted' : ''
                        }`}
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            githubRepoUrl: repo.html_url 
                          });
                          // Close the dialog
                          const closeButton = document.querySelector('[data-dialog-close]');
                          if (closeButton instanceof HTMLElement) closeButton.click();
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
                                  Owner: {repo.owner}
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
                      </div>
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
                <div className="p-4 border rounded-lg bg-muted">
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
          )}
        </div>

        <div>
          <Label>
            Product Images 
            <span className="text-destructive ml-1">*</span>
            <span className="text-sm text-muted-foreground ml-2">
              (Minimum 2 required)
            </span>
          </Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
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
            {formData.imageUrls.length < 8 && (
              <div className="border-2 border-dashed rounded-lg aspect-square flex items-center justify-center">
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
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-2">
                    {isUploading ? 'Uploading...' : 'Upload Images'}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formData.imageUrls.length < 2 
                      ? `${2 - formData.imageUrls.length} more required` 
                      : `${8 - formData.imageUrls.length} slots remaining`}
                  </span>
                </Label>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Upload 2-8 images (PNG, JPG, WEBP)
          </p>
        </div>

        <div>
          <Label>Product Video (Optional)</Label>
          <div className="mt-2">
            {formData.videoUrl ? (
              <div className="relative aspect-video">
                <video
                  src={formData.videoUrl}
                  controls
                  className="w-full rounded-lg"
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
            ) : (
              <div className="border-2 border-dashed rounded-lg aspect-video flex items-center justify-center">
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
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-2">
                    Upload Video
                  </span>
                </Label>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Upload one video (MP4, max 100MB)
          </p>
        </div>

        <div>
          <Label>Product Demo URL (Optional)</Label>
          <div className="mt-2">
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
          <p className="text-sm text-muted-foreground mt-2">
            Add a URL where users can try out your product (e.g., live demo, sandbox environment)
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