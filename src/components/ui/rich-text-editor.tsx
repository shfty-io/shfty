import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ className, value, onChange, placeholder, ...props }, ref) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = React.useState(false);

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

    const handleHeadingChange = React.useCallback((value: string) => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || !editorRef.current) return;

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      let element = container.nodeType === 3 ? container.parentElement : container as HTMLElement;

      // If no specific element is selected, wrap the entire selection in the new element
      if (!element || element === editorRef.current) {
        const newElement = document.createElement(value);
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
          if (element.matches('p, h1, h2, h3, h4, h5, h6')) {
            const newElement = document.createElement(value);
            newElement.innerHTML = element.innerHTML;
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

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Select
            defaultValue="p"
            onValueChange={handleHeadingChange}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Paragraph" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">Paragraph</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => formatText('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => formatText('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => formatText('insertUnorderedList')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => formatText('insertOrderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4",
            className
          )}
          data-placeholder={placeholder}
          {...props}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor }; 