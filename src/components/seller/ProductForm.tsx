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
import { toast } from "@/components/ui/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
}

export interface ProductFormData {
  name: string;
  byline: string;
  shortDescription: string;
  description: string;
  price: number;
  categories: string[];
  faq?: FAQItem[];
}

interface FAQItem {
  question: string;
  answer: string;
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
    faq: []
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalFormData = {
      ...formData,
      faq: faqItems
    };

    onSubmit(finalFormData);
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
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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