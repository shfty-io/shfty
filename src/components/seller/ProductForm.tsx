"use client";

import { useState, useRef } from "react";
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

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrls: string[];
  videoUrl?: string;
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

export function ProductForm({ onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    demoUrl: "",
    githubUrl: "",
    imageUrls: [],
  });

  const [images, setImages] = useState<MediaFile[]>([]);
  const [video, setVideo] = useState<MediaFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

      onSubmit({ ...formData, imageUrls, videoUrl });
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Product Images ({images.length}/{MAX_IMAGES})</Label>
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
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
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-gray-400"
            >
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-500">Add Image</span>
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
      <div className="space-y-2">
        <Label>Product Video (Optional)</Label>
        <div className="flex flex-col gap-4">
          {video ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
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
              className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-gray-400"
            >
              <Video size={24} className="text-gray-400" />
              <span className="text-sm text-gray-500">Add Video</span>
              <span className="text-xs text-gray-400">MP4, WebM, or OGG (max {MAX_VIDEO_SIZE_MB}MB)</span>
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

      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your product name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your product"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
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

      <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="demoUrl">Demo URL (Optional)</Label>
        <Input
          id="demoUrl"
          type="url"
          value={formData.demoUrl}
          onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
          placeholder="https://demo.yourproduct.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
        <Input
          id="githubUrl"
          type="url"
          value={formData.githubUrl}
          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
          placeholder="https://github.com/yourusername/yourrepo"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Save Product Details'}
      </Button>
    </form>
  );
} 