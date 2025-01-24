import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductSearch } from '@/components/global/ProductSearch';
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
    sortBy: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest';
  }) => void;
  onSearch: (query: string) => void;
  counts: {
    all: number;
    latest: number;
    popular: number;
  };
}

export default function ProductFilters({ onFilterChange, onSearch, counts }: ProductFiltersProps) {
  const [sortBy, setSortBy] = useState<'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest'>('downloaded');
  const [activeTab, setActiveTab] = useState<'all' | 'latest' | 'popular'>('all');

  const handleTabChange = (value: string) => {
    const tab = value as 'all' | 'latest' | 'popular';
    setActiveTab(tab);
    onFilterChange({ tab, sortBy });
  };

  const handleSortChange = (value: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest') => {
    setSortBy(value);
    onFilterChange({ tab: activeTab, sortBy: value });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 flex-1 max-w-[1800px] mx-auto">
      <Tabs defaultValue="all" onValueChange={handleTabChange} className="flex-1 md:max-w-[70%]">
        <ScrollArea>
          <TabsList className="h-auto -space-x-px bg-background p-0 rtl:space-x-reverse">
            <TabsTrigger
              value="all"
              className="flex-shrink-0 relative overflow-hidden rounded-none border border-border py-2 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              All Products <span className="ml-1.5 text-gray-500">{counts.all}</span>
            </TabsTrigger>
            <TabsTrigger
              value="latest"
              className="flex-shrink-0 relative overflow-hidden rounded-none border border-border py-2 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              Latest <span className="ml-1.5 text-gray-500">{counts.latest}</span>
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="flex-shrink-0 relative overflow-hidden rounded-none border border-border py-2 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              Popular <span className="ml-1.5 text-gray-500">{counts.popular}</span>
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>

      {/* Search and Sort */}
      <div className="flex items-center space-x-4">
        <ProductSearch onSearch={onSearch} />
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="downloaded">Most downloaded</SelectItem>
            <SelectItem value="liked">Most liked</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price_high">Price high to low</SelectItem>
            <SelectItem value="price_low">Price low to high</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 