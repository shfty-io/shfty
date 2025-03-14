'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import ProductFilters from './ProductFilters'
import { Database } from '@/types/supabase'
import { PaginationMetadata } from '@/app/page'
import { useRouter } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function stripHtml(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Define the product status type using the Supabase enum
type ProductStatus = Database['public']['Enums']['product_status']

interface Product {
  id: string
  name: string
  description: string
  price: number
  categories: string[]
  image_urls: string[] | null
  short_description: string
  byline: string
  created_at: string
  view_count: number
  purchase_count: number
  trending_score: number
  likes_count: number
  github_repo_url?: string | null
  github_token?: string | null
  status?: ProductStatus | null
  user: {
    avatar_url: string | null
    full_name: string | null
  }
  image_positions?: Record<string, { x: number; y: number }> | null
}

interface ProductListProps {
  products: Product[]
  pagination: PaginationMetadata
  currentPage: number
  initialSearch?: string
  initialSortBy?: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest'
}

export default function ProductList({ 
  products, 
  pagination, 
  currentPage, 
  initialSearch = '', 
  initialSortBy = 'downloaded' 
}: ProductListProps) {
  const router = useRouter();
  
  // These state variables are used in the ProductFilters component
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState<{
    sortBy: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest';
  }>({
    sortBy: initialSortBy
  });

  // Filter products based on search query (client-side filtering)
  let filteredProducts = products;
  if (searchQuery.trim()) {
    filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.short_description && product.short_description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  // For debugging - log current filter state
  console.log('Current filters:', filters);
  console.log('Current search query:', searchQuery);
  
  // Handle page change and apply filters
  const handlePageChange = (page: number) => {
    // Navigate to the new page with current filters
    router.push(
      `/?page=${page}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}${filters.sortBy !== 'downloaded' ? `&sortBy=${filters.sortBy}` : ''}`
    );
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: { sortBy: 'downloaded' | 'liked' | 'newest' | 'price_high' | 'price_low' | 'oldest' }) => {
    setFilters(newFilters);
    // Apply the new filter by navigating to the first page with the new filter
    router.push(
      `/?page=1${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}&sortBy=${newFilters.sortBy}`
    );
  };
  
  // Handle search changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Apply the new search by navigating to the first page with the search
      router.push(
        `/?page=1&search=${encodeURIComponent(query)}${filters.sortBy !== 'downloaded' ? `&sortBy=${filters.sortBy}` : ''}`
      );
    } else {
      // If search is cleared, remove the search parameter
      router.push(
        `/?page=1${filters.sortBy !== 'downloaded' ? `&sortBy=${filters.sortBy}` : ''}`
      );
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const { totalPages } = pagination;
    const items = [];
    
    // Determine the range of page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Ensure we always show 5 pages when possible
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }
    
    // Add first page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink isActive={currentPage === 1} onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Add ellipsis if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={currentPage === i} onClick={() => handlePageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add last page
    if (endPage < totalPages) {
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key="last">
          <PaginationLink isActive={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  // Display products with pagination
  if (filteredProducts.length === 0) {
    return (
      <div>
        <div>
          <div className="px-6">
            <ProductFilters 
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              initialSearch={searchQuery}
              initialSortBy={filters.sortBy}
            />
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
            <p className="text-gray-500">Be the first to sell something amazing!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="">
        <div className="px-6">
          <ProductFilters 
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            initialSearch={searchQuery}
            initialSortBy={filters.sortBy}
          />
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            // Create the product card props
            const productCardProps = {
              id: product.id,
              title: product.name,
              description: product.short_description || stripHtml(product.description),
              price: product.price,
              images: product.image_urls || [],
              image_positions: product.image_positions ? 
                (typeof product.image_positions === 'string' 
                  ? JSON.parse(product.image_positions) 
                  : product.image_positions) 
                : {},
              view_count: product.view_count,
              likes_count: product.likes_count,
              byline: product.byline,
              user: {
                avatar_url: product.user?.avatar_url || '/placeholder-avatar.jpg',
                full_name: product.user?.full_name || 'Anonymous'
              }
            };
            
            return (
              <ProductCard
                key={product.id}
                product={productCardProps}
              />
            );
          })}
        </div>
        
        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {/* Previous page button */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                  </PaginationItem>
                )}
                
                {/* Page numbers */}
                {renderPaginationItems()}
                
                {/* Next page button */}
                {currentPage < pagination.totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
        
        {/* Display count information */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Showing {filteredProducts.length} products
          {pagination.totalItems > 0 && ` of ${pagination.totalItems} total`}
        </div>
      </div>
    </div>
  );
} 