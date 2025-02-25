import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Search, Tag, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFilterEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ProductFilterEditor = React.forwardRef<HTMLDivElement, ProductFilterEditorProps>(
  ({ className, value, onChange, placeholder, ...props }, ref) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [currentFormat, setCurrentFormat] = React.useState<string>("p");

    React.useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (editorRef.current && !isInitialized) {
        editorRef.current.innerHTML = value;
        setIsInitialized(true);
      }
    }, [value, isInitialized]);

    const handleInput = React.useCallback(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        if (content !== value) {
          onChange(content);
        }
      }
    }, [onChange, value]);

    const formatText = React.useCallback((command: string, value?: string) => {
      document.execCommand(command, false, value);
      handleInput();
      editorRef.current?.focus();
    }, [handleInput]);

    const handleFormatChange = React.useCallback((formatType: string) => {
      setCurrentFormat(formatType);
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || !editorRef.current) return;

      // Special handling for filter criteria types
      let prefix = "";
      let tagName = "p";
      
      switch (formatType) {
        case "category":
          prefix = "Category: ";
          tagName = "p";
          break;
        case "price":
          prefix = "Price Range: ";
          tagName = "p";
          break;
        case "rating":
          prefix = "Min Rating: ";
          tagName = "p";
          break;
        case "keyword":
          prefix = "Keyword: ";
          tagName = "p";
          break;
        case "h2":
          tagName = "h2";
          break;
        case "h3":
          tagName = "h3";
          break;
        default:
          tagName = "p";
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;

      // If no specific element is selected, create a new element with prefix
      if (!element || element === editorRef.current) {
        const newElement = document.createElement(tagName);
        if (prefix) {
          const textNode = document.createTextNode(prefix);
          newElement.appendChild(textNode);
        }
        
        try {
          range.surroundContents(newElement);
        } catch {
          // If surroundContents fails, try a different approach
          newElement.appendChild(range.extractContents());
          range.insertNode(newElement);
        }
      } else {
        // Find the closest block-level element
        while (element && element !== editorRef.current) {
          if (element.matches('p, h2, h3')) {
            const newElement = document.createElement(tagName);
            let content = element.innerHTML;
            
            // Only add prefix if it's not already there
            if (prefix && !content.startsWith(prefix)) {
              content = prefix + content;
            }
            
            newElement.innerHTML = content;
            element.replaceWith(newElement);
            break;
          }
          element = element.parentElement as HTMLElement;
        }
      }

      handleInput();
      editorRef.current.focus();
    }, [handleInput]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        formatText('insertParagraph');
      }
    }, [formatText]);

    const insertFilterTemplate = React.useCallback(() => {
      if (!editorRef.current) return;
      
      const template = `
        <h2>Product Filters</h2>
        <p>Category: Electronics</p>
        <p>Price Range: $100 - $500</p>
        <p>Min Rating: 4 stars</p>
        <p>Keyword: wireless</p>
      `;
      
      editorRef.current.innerHTML = template;
      handleInput();
    }, [handleInput]);

    return (
      <div className="space-y-2">
        <style jsx global>{`
          .filter-editor h2 {
            font-size: 1.5rem !important;
            font-weight: bold !important;
            margin-bottom: 0.75rem !important;
            color: hsl(var(--primary)) !important;
          }
          .filter-editor h3 {
            font-size: 1.25rem !important;
            font-weight: semibold !important;
            margin-bottom: 0.5rem !important;
          }
          .filter-editor p[data-filter-type]::before {
            font-weight: bold;
          }
        `}</style>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={currentFormat}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Filter Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">Normal Text</SelectItem>
              <SelectItem value="h2">Filter Group</SelectItem>
              <SelectItem value="h3">Sub-Group</SelectItem>
              <SelectItem value="category">Category Filter</SelectItem>
              <SelectItem value="price">Price Range Filter</SelectItem>
              <SelectItem value="rating">Rating Filter</SelectItem>
              <SelectItem value="keyword">Keyword Filter</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => formatText('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => formatText('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => formatText('insertUnorderedList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 ml-auto"
            onClick={insertFilterTemplate}
            title="Insert Filter Template"
          >
            <Filter className="h-4 w-4 mr-2" />
            Insert Template
          </Button>
        </div>
        
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={cn(
            "filter-editor min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4",
            className
          )}
          data-placeholder={placeholder || "Enter filter criteria..."}
          {...props}
        />
        
        <div className="text-xs text-muted-foreground">
          Tip: Use the dropdown to select different filter types. The template button will insert common filter patterns.
        </div>
      </div>
    );
  }
);

ProductFilterEditor.displayName = "ProductFilterEditor";

export { ProductFilterEditor }; 