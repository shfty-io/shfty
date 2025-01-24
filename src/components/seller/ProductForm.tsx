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
import { Github } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
                  {category}
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
                            {repo.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {repo.description}
                              </p>
                            )}
                          </div>
                          {repo.private && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Private
                            </span>
                          )}
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