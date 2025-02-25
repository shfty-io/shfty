import { useState } from "react";
import { ProductFilterEditor } from "@/components/ui/product-filter-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Save, RotateCcw } from "lucide-react";

interface ProductFilterFormProps {
  onApplyFilters?: (filterHtml: string) => void;
  initialValue?: string;
  className?: string;
}

export function ProductFilterForm({ 
  onApplyFilters, 
  initialValue = "", 
  className 
}: ProductFilterFormProps) {
  const [filterContent, setFilterContent] = useState(initialValue);
  const [isSaved, setIsSaved] = useState(false);

  const handleApplyFilters = () => {
    setIsSaved(true);
    onApplyFilters?.(filterContent);
    
    // Reset saved status after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleReset = () => {
    setFilterContent("");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Product Filters
        </CardTitle>
        <CardDescription>
          Create and apply filters to narrow down product search results
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ProductFilterEditor 
          value={filterContent}
          onChange={setFilterContent}
          placeholder="Use the dropdown above to add filter criteria..."
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={handleApplyFilters}
          size="sm"
          className="ml-auto"
          disabled={!filterContent.trim()}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaved ? "Saved!" : "Apply Filters"}
        </Button>
      </CardFooter>
    </Card>
  );
} 