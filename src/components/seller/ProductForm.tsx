"use client";

import { useState } from "react";
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
}

const categories = [
  "3D",
  "AI",
  "Agency",
  "Animated",
  "App",
  "Blog",
  "Brand Guidelines",
  "Business",
  "Changelog",
  "Documentation",
  "Ecommerce",
  "Education",
  "Entertainment",
  "Food",
  "Free",
  "Health",
  "Landing Page",
  "Membership",
  "Minimal",
  "Modern",
  "New",
  "News",
  "Personal",
  "Photography",
  "Podcast",
  "Portfolio",
  "Real Estate",
  "Restaurant",
  "Resume",
  "SaaS",
  "Sidebar",
  "Splash",
  "Startup",
  "Tech",
  "Web3"
];

export function ProductForm({ onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    demoUrl: "",
    githubUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                {category}
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

      <Button type="submit" className="w-full">
        Save Product Details
      </Button>
    </form>
  );
} 