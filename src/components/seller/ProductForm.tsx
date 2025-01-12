"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/client";
import Image from "next/image";
import { X, Upload, Video } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  videoUrl?: string;
  codebaseUrl?: string;
}

interface MediaFile {
  file: File;
  preview: string;
}

const MAX_IMAGES = 9;
const MAX_VIDEO_SIZE_MB = 100;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

const categories = [
  "3d",
  "ai",
  "agency",
  "animated",
  "app",
  "blog",
  "brand-guidelines",
  "business",
  "changelog",
  "documentation",
  "ecommerce",
  "education",
  "entertainment",
  "food",
  "free",
  "health",
  "landing-page",
  "membership",
  "minimal",
  "modern",
  "new",
  "news",
  "personal",
  "photography",
  "podcast",
  "portfolio",
  "real-estate",
  "restaurant",
  "resume",
  "saas",
  "sidebar",
  "splash",
  "startup",
  "tech",
  "web3"
];

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialData || {
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrls: [],
  });

  const [images, setImages] = useState<MediaFile[]>([]);
  const [video, setVideo] = useState<MediaFile | null>(null);
  const [codebase, setCodebase] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const codebaseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData?.imageUrls) {
      const initialImages: MediaFile[] = initialData.imageUrls.map(url => ({
        file: new File([], "placeholder"),
        preview: url
      }));
      setImages(initialImages);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_IMAGES - images.length;
    
    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = files
      .slice(0, remainingSlots)
      .filter(file => ACCEPTED_IMAGE_TYPES.includes(file.type));

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          file,
          preview: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      alert('Please upload a valid video file (MP4, WebM, or OGG)');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      alert(`Video size should be less than ${MAX_VIDEO_SIZE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideo({
        file,
        preview: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const uploadMedia = async (file: File, type: 'image' | 'video'): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${type}s/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleCodebaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      toast({
        title: "Invalid file type",
        description: "Please upload a ZIP file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      toast({
        title: "File too large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return;
    }

    setCodebase(file);
  };

  const removeCodebase = () => {
    setCodebase(null);
    if (codebaseInputRef.current) {
      codebaseInputRef.current.value = '';
    }
  };

  const uploadCodebase = async (file: File): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('codebases')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('codebases')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Upload images
      const imageUrls = await Promise.all(
        images.map(image => uploadMedia(image.file, 'image'))
      );

      // Upload video if exists
      let videoUrl;
      if (video) {
        videoUrl = await uploadMedia(video.file, 'video');
      }

      // Upload codebase if exists
      let codebaseUrl;
      if (codebase) {
        codebaseUrl = await uploadCodebase(codebase);
      }

      onSubmit({ ...formData, imageUrls, videoUrl, codebaseUrl });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Image Upload */}
      <div>
        <Label className="mb-2 block">Product Images ({images.length}/{MAX_IMAGES})</Label>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
              <Image
                src={image.preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-muted-foreground/50 transition-colors"
            >
              <Upload size={24} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Image</span>
            </button>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={handleImageChange}
          multiple
          className="hidden"
        />
      </div>

      {/* Video Upload */}
      <div>
        <Label className="mb-2 block">Product Video (Optional)</Label>
        <div className="mb-4">
          {video ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
              <video
                src={video.preview}
                controls
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-muted-foreground/50 transition-colors"
            >
              <Video size={24} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Video</span>
              <span className="text-xs text-muted-foreground">MP4, WebM, or OGG (max {MAX_VIDEO_SIZE_MB}MB)</span>
            </button>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES.join(',')}
            onChange={handleVideoChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Codebase Upload */}
      <div>
        <Label className="mb-2 block">Product Codebase (Required)</Label>
        <div className="mb-4">
          {codebase ? (
            <div className="relative border rounded-lg p-4 bg-muted">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="font-medium">{codebase.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(codebase.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCodebase}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => codebaseInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            >
              <Upload size={24} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Upload your codebase as a ZIP file
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum file size: 100MB
              </p>
            </div>
          )}
          <input
            ref={codebaseInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={handleCodebaseChange}
            className="hidden"
            required
          />
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your product name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your product"
            className="min-h-[120px]"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full mt-6" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Save Product Details'}
      </Button>
    </form>
  );
} 