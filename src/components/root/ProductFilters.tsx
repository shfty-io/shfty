import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  onFilterChange: (filters: {
    tab: 'all' | 'latest' | 'popular';
    sortBy: 'downloaded' | 'liked' | 'newest';
  }) => void;
  counts: {
    all: number;
    latest: number;
    popular: number;
  };
}

export default function ProductFilters({ onFilterChange, counts }: ProductFiltersProps) {
  const [sortBy, setSortBy] = useState<'downloaded' | 'liked' | 'newest'>('downloaded');
  const [activeTab, setActiveTab] = useState<'all' | 'latest' | 'popular'>('all');

  const handleTabChange = (value: string) => {
    const tab = value as 'all' | 'latest' | 'popular';
    setActiveTab(tab);
    onFilterChange({ tab, sortBy });
  };

  const handleSortChange = (value: 'downloaded' | 'liked' | 'newest') => {
    setSortBy(value);
    onFilterChange({ tab: activeTab, sortBy: value });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <ScrollArea>
          <TabsList className="mb-3 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
            <TabsTrigger
              value="all"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              All Products <span className="ml-1.5 text-gray-500">{counts.all}</span>
            </TabsTrigger>
            <TabsTrigger
              value="latest"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              Latest <span className="ml-1.5 text-gray-500">{counts.latest}</span>
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              Popular <span className="ml-1.5 text-gray-500">{counts.popular}</span>
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>

      {/* Search and Sort */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="h-9 w-[200px] rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs text-gray-400">/</span>
          </div>
        </div>

        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="downloaded">Most downloaded</SelectItem>
            <SelectItem value="liked">Most liked</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 