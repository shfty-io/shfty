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
    const [currentFormat, setCurrentFormat] = React.useState<string>("p");
    const prevValueRef = React.useRef<string>(value);

    React.useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

    // Apply styles to elements whenever content changes
    const applyStylesToElements = React.useCallback(() => {
      if (!editorRef.current) return;
      
      // Instead of applying inline styles, add CSS classes to elements
      const elements = editorRef.current.querySelectorAll('h1, h2, h3, p, ul, ol, li, strong, em, code, a');
      elements.forEach(el => {
        // Add appropriate classes based on element type
        if (el.tagName.toLowerCase() === 'h1') {
          el.classList.add('rich-text-h1');
        } else if (el.tagName.toLowerCase() === 'h2') {
          el.classList.add('rich-text-h2');
        } else if (el.tagName.toLowerCase() === 'h3') {
          el.classList.add('rich-text-h3');
        } else if (el.tagName.toLowerCase() === 'p') {
          el.classList.add('rich-text-p');
        } else if (el.tagName.toLowerCase() === 'ul') {
          el.classList.add('rich-text-ul');
        } else if (el.tagName.toLowerCase() === 'ol') {
          el.classList.add('rich-text-ol');
        } else if (el.tagName.toLowerCase() === 'li') {
          el.classList.add('rich-text-li');
        } else if (el.tagName.toLowerCase() === 'strong') {
          el.classList.add('rich-text-strong');
        } else if (el.tagName.toLowerCase() === 'em') {
          el.classList.add('rich-text-em');
        } else if (el.tagName.toLowerCase() === 'code') {
          el.classList.add('rich-text-code');
        } else if (el.tagName.toLowerCase() === 'a') {
          el.classList.add('rich-text-a');
        }
      });
    }, []);

    // Initialize the editor with the provided value
    React.useEffect(() => {
      if (editorRef.current && !isInitialized) {
        editorRef.current.innerHTML = value;
        setIsInitialized(true);
      }
    }, [value, isInitialized]);

    // Update the editor content when value prop changes externally
    React.useEffect(() => {
      if (editorRef.current && isInitialized && value !== prevValueRef.current) {
        // Only update if the value has actually changed and is different from current editor content
        if (value !== editorRef.current.innerHTML) {
          editorRef.current.innerHTML = value;
          prevValueRef.current = value;
          
          // Apply styles after updating content
          applyStylesToElements();
        }
      }
    }, [value, isInitialized, applyStylesToElements]);

    // Ensure the current format is maintained
    const ensureFormat = React.useCallback(() => {
      if (!editorRef.current) return;
      
      // If the editor is empty or contains only a <br> tag, ensure it has the current format
      const content = editorRef.current.innerHTML.trim();
      if (content === '' || content === '<br>') {
        // Create a new element with the current format
        const newElement = document.createElement(currentFormat);
        newElement.innerHTML = '<br>';
        
        // Clear the editor and add the new element
        editorRef.current.innerHTML = '';
        editorRef.current.appendChild(newElement);
        
        // Set cursor inside the new element
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.setStart(newElement, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        // Apply styles to the newly created element
        applyStylesToElements();
        
        // Notify about the change
        onChange(editorRef.current.innerHTML);
        prevValueRef.current = editorRef.current.innerHTML;
      }
    }, [currentFormat, onChange, prevValueRef, applyStylesToElements]);

    // Handle input changes
    const handleInput = React.useCallback(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        if (content !== prevValueRef.current) {
          // Apply styles to ensure new content has the right classes
          applyStylesToElements();
          
          // Now get the updated content with classes
          const updatedContent = editorRef.current.innerHTML;
          onChange(updatedContent);
          prevValueRef.current = updatedContent;
          
          // Check if we need to ensure format after deletion
          if (content.trim() === '' || content === '<br>') {
            ensureFormat();
          }
        }
      }
    }, [onChange, applyStylesToElements, ensureFormat, prevValueRef]);

    // Format text with execCommand
    const formatText = React.useCallback((command: string, value?: string) => {
      document.execCommand(command, false, value);
      handleInput();
      editorRef.current?.focus();
    }, [handleInput]);

    // Handle format changes (h1, h2, h3, p)
    const handleFormatChange = React.useCallback((format: string) => {
      setCurrentFormat(format);
      
      // Use execCommand to format the current selection or line
      if (format === 'p') {
        formatText('formatBlock', '<p>');
      } else if (format === 'h1') {
        formatText('formatBlock', '<h1>');
      } else if (format === 'h2') {
        formatText('formatBlock', '<h2>');
      } else if (format === 'h3') {
        formatText('formatBlock', '<h3>');
      }
      
      // If the editor is empty, ensure the format is applied
      if (editorRef.current && (editorRef.current.innerHTML.trim() === '' || editorRef.current.innerHTML === '<br>')) {
        ensureFormat();
      }
    }, [formatText, ensureFormat]);

    // Handle key presses
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      // Handle Backspace and Delete keys
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // Check if we're about to delete the last character
        const selection = window.getSelection();
        if (selection && editorRef.current) {
          // Get the current block element
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          let currentElement = container.nodeType === 3 ? container.parentElement : container as HTMLElement;
          
          // Find the closest block element
          while (currentElement && currentElement !== editorRef.current) {
            if (currentElement.matches('p, h1, h2, h3, h4, h5, h6')) {
              break;
            }
            currentElement = currentElement.parentElement as HTMLElement;
          }
          
          // If we found a block element and it's almost empty
          if (currentElement && currentElement !== editorRef.current) {
            const text = currentElement.textContent || '';
            if (text.length <= 1) {
              // After the keypress, check if we need to restore the format
              setTimeout(() => {
                ensureFormat();
              }, 0);
            }
          }
        }
      }
      
      // Let the browser handle Enter key naturally
      // We'll just make sure styles are applied after any changes
      setTimeout(applyStylesToElements, 0);
    }, [applyStylesToElements, ensureFormat]);

    return (
      <div className="space-y-2">
        <style jsx global>{`
          /* Editor styles for editing */
          .editor-content h1, .rich-text-h1 {
            font-size: 1.875rem !important;
            font-weight: bold !important;
            margin-bottom: 1rem !important;
          }
          .editor-content h2, .rich-text-h2 {
            font-size: 1.5rem !important;
            font-weight: bold !important;
            margin-bottom: 0.75rem !important;
          }
          .editor-content h3, .rich-text-h3 {
            font-size: 1.25rem !important;
            font-weight: semibold !important;
            margin-bottom: 0.5rem !important;
          }
          .editor-content p, .rich-text-p {
            margin-bottom: 1rem !important;
          }
          .editor-content ul, .rich-text-ul {
            list-style-type: disc !important;
            padding-left: 2rem !important;
            margin-bottom: 1rem !important;
          }
          .editor-content ol, .rich-text-ol {
            list-style-type: decimal !important;
            padding-left: 2rem !important;
            margin-bottom: 1rem !important;
          }
          .editor-content li, .rich-text-li {
            margin-bottom: 0.25rem !important;
          }
          .editor-content strong, .rich-text-strong {
            font-weight: bold !important;
          }
          .editor-content em, .rich-text-em {
            font-style: italic !important;
          }
          .editor-content code, .rich-text-code {
            background-color: #f0f0f0 !important;
            padding: 0.1rem 0.2rem !important;
            border-radius: 0.2rem !important;
            font-family: monospace !important;
          }
          .editor-content a, .rich-text-a {
            color: #3b82f6 !important;
            text-decoration: underline !important;
          }
        `}</style>
        <div className="flex items-center gap-2">
          <Select
            value={currentFormat}
            onValueChange={(value) => {
              handleFormatChange(value);
            }}
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
          onFocus={() => {
            applyStylesToElements();
            // Ensure format when focusing on an empty editor
            if (editorRef.current && (editorRef.current.innerHTML.trim() === '' || editorRef.current.innerHTML === '<br>')) {
              ensureFormat();
            }
          }}
          className={cn(
            "editor-content min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h2]:text-2xl [&>h2]:font-bold [&>h3]:text-xl [&>h3]:font-semibold",
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
