'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function ProductSearch({ onSearch, initialQuery = '' }: ProductSearchProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery.trim());
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        className="h-9 w-[300px] rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </form>
  );
} 