import { useState } from 'react';
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
    sortBy: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest';
  }) => void;
  onSearch: (query: string) => void;
  initialSearch?: string;
  initialSortBy?: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest';
}

export default function ProductFilters({ 
  onFilterChange, 
  onSearch, 
  initialSearch = '',
  initialSortBy = 'downloaded' 
}: ProductFiltersProps) {
  const [sortBy, setSortBy] = useState<'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest'>(initialSortBy);

  const handleSortChange = (value: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest') => {
    setSortBy(value);
    onFilterChange({ sortBy: value });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 flex-1 max-w-[1800px] mx-auto">
      <div className="flex-1">
        <ProductSearch onSearch={onSearch} initialQuery={initialSearch} />
      </div>
      <div>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="h-9 w-[200px]">
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