"use client";

import { useState } from "react";
import { ProductFilterForm } from "@/components/product/ProductFilterForm";
import { parseFilterHtml, filtersToQueryObject, FilterData } from "@/lib/product-filter-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function ProductFilterExample() {
  const [activeFilters, setActiveFilters] = useState<FilterData | null>(null);
  
  const handleApplyFilters = (filterHtml: string) => {
    // Parse the HTML into structured filter data
    const filterData = parseFilterHtml(filterHtml);
    setActiveFilters(filterData);
    
    // In a real application, you would use this to filter products
    const queryObject = filtersToQueryObject(filterData);
    console.log("Filter query object:", queryObject);
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Product Filter Example</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Filter Editor</h2>
          <ProductFilterForm 
            onApplyFilters={handleApplyFilters}
            initialValue={`<h2>Product Filters</h2>
<p>Category: Electronics</p>
<p>Price Range: $100 - $500</p>
<p>Min Rating: 4 stars</p>`}
          />
          
          <Alert className="mt-8">
            <Info className="h-4 w-4" />
            <AlertTitle>How to use</AlertTitle>
            <AlertDescription>
              Select a filter type from the dropdown and enter your criteria. 
              Add different types of filters and group them as needed. 
              Click &quot;Apply Filters&quot; to see the structured data.
            </AlertDescription>
          </Alert>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Filters</h2>
          
          {activeFilters ? (
            <div className="space-y-4">
              {/* Display filter groups */}
              {activeFilters.groups.map((group, groupIndex) => (
                <Card key={groupIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {group.filters.map((filter, filterIndex) => (
                        <li key={filterIndex} className="flex items-start">
                          <span className="font-medium text-sm mr-2">{filter.type}:</span>
                          <span className="text-sm">{filter.value}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Display subgroups if any */}
                    {group.subgroups && group.subgroups.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2">
                        {group.subgroups.map((subgroup, subgroupIndex) => (
                          <div key={subgroupIndex} className="mt-2">
                            <h4 className="font-medium text-sm">{subgroup.title}</h4>
                            <ul className="space-y-1 mt-1">
                              {subgroup.filters.map((filter, filterIndex) => (
                                <li key={filterIndex} className="flex items-start text-sm">
                                  <span className="font-medium mr-2">{filter.type}:</span>
                                  <span>{filter.value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Summary of filter categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filter Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {activeFilters.categories.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm">Categories:</h4>
                        <ul className="mt-1">
                          {activeFilters.categories.map((category, i) => (
                            <li key={i} className="text-sm">{category}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {activeFilters.priceRanges.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm">Price Ranges:</h4>
                        <ul className="mt-1">
                          {activeFilters.priceRanges.map((range, i) => (
                            <li key={i} className="text-sm">
                              {range.min !== undefined ? `$${range.min}` : '$0'} - 
                              {range.max !== undefined ? ` $${range.max}` : ' No Max'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {activeFilters.ratings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm">Min Ratings:</h4>
                        <ul className="mt-1">
                          {activeFilters.ratings.map((rating, i) => (
                            <li key={i} className="text-sm">{rating} stars</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {activeFilters.keywords.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm">Keywords:</h4>
                        <ul className="mt-1">
                          {activeFilters.keywords.map((keyword, i) => (
                            <li key={i} className="text-sm">{keyword}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No filters applied yet. Use the editor on the left to create filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 