import { useState } from 'react';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    sortBy: 'recent' | 'popular' | 'trending';
    priceRange: string;
  }) => void;
}

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under $10', value: '0-10' },
    { label: '$10 - $50', value: '10-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Over $100', value: '100+' },
  ];

  const sortOptions = [
    { label: 'Recent', value: 'recent' },
    { label: 'Popular', value: 'popular' },
    { label: 'Trending', value: 'trending' },
  ];

  const handleSortChange = (sort: 'recent' | 'popular' | 'trending') => {
    setSelectedSort(sort);
    onFilterChange({ sortBy: sort, priceRange: selectedPriceRange });
  };

  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRange(range);
    onFilterChange({ sortBy: selectedSort, priceRange: range });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          id="sort"
          value={selectedSort}
          onChange={(e) => handleSortChange(e.target.value as 'recent' | 'popular' | 'trending')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Price Range
        </label>
        <select
          id="price"
          value={selectedPriceRange}
          onChange={(e) => handlePriceRangeChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 